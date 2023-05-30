const content = `--[[
  Move next job to be processed to active, lock it and fetch its data. The job
  may be delayed, in that case we need to move it to the delayed set instead.
  This operation guarantees that the worker owns the job during the lock
  expiration time. The worker is responsible of keeping the lock fresh
  so that no other worker picks this job again.
  Input:
      KEYS[1] wait key
      KEYS[2] active key
      KEYS[3] priority key
      KEYS[4] stream events key
      KEYS[5] stalled key
      -- Rate limiting
      KEYS[6] rate limiter key
      KEYS[7] delayed key
      -- Promote delayed jobs
      KEYS[8] paused key
      KEYS[9] meta key
      -- Arguments
      ARGV[1] key prefix
      ARGV[2] timestamp
      ARGV[3] optional job Id
      ARGV[4] options
]]
local rcall = redis.call
local jobId
local waitKey = KEYS[1]
local activeKey = KEYS[2]
local prefixKey = ARGV[1]
local timestamp = tonumber(ARGV[2])
local opts = cmsgpack.unpack(ARGV[4])
--[[
  Function to return the next delayed job timestamp.
]] 
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if (nextTimestamp ~= nil) then 
      nextTimestamp = nextTimestamp / 0x1000
    end
    return nextTimestamp
  end
end
local function getRateLimitTTL(opts, limiterKey)
  local maxJobs = tonumber(opts['limiter'] and opts['limiter']['max'])
  if maxJobs then
    local jobCounter = tonumber(rcall("GET", limiterKey))
    if jobCounter ~= nil and jobCounter >= maxJobs then
      local pttl = rcall("PTTL", limiterKey)
      if pttl > 0 then 
        return pttl 
      end
    end
  end
  return 0
end
--[[
  Updates the delay set, by moving delayed jobs that should
  be processed now to "wait".
    Events:
      'waiting'
]]
local rcall = redis.call
-- Includes
--[[
  Function to add job considering priority.
]]
local function addJobWithPriority(priorityKey, priority, targetKey, jobId)
  rcall("ZADD", priorityKey, priority, jobId)
  local count = rcall("ZCOUNT", priorityKey, 0, priority)
  local len = rcall("LLEN", targetKey)
  local id = rcall("LINDEX", targetKey, len - (count - 1))
  if id then
    rcall("LINSERT", targetKey, "BEFORE", id, jobId)
  else
    rcall("RPUSH", targetKey, jobId)
  end
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, waitKey, pausedKey)
  if rcall("HEXISTS", queueMetaKey, "paused") ~= 1 then
    return waitKey
  else
    return pausedKey
  end
end
local function setGroupRateLimitedIfNeeded(prefixKey, groupId, isRateLimited, timestamp, ttl)
  local groupsKey = prefixKey .. 'groups'
  if not isRateLimited then
    local highscore = rcall("ZREVRANGE", groupsKey, 0, 0,
                            "withscores")[2] or 0
    rcall("ZADD", groupsKey, highscore + 1, groupId)
  else
    local groupsRateLimitKey = groupsKey .. ':limit'
    local nextTimestamp = timestamp + ttl
    rcall("ZADD", groupsRateLimitKey, nextTimestamp, groupId)
  end
end
local function addToGroup(lifo, prefixKey, groupId, jobId, waitKey, timestamp)
    local groupKey = prefixKey .. 'groups:' .. groupId
    local pushCmd = lifo and 'RPUSH' or 'LPUSH';
    --if group is paused we do not need to check for rate limit
    if rcall("ZSCORE", prefixKey .. 'groups:paused', groupId) ~= false then
        rcall(pushCmd, groupKey, jobId)
    else
        -- Has this group reached maximum concurrency?
        local hasReachedMaxConcurrency = rcall("ZSCORE", prefixKey .. 'groups:max', groupId) ~= false
        -- Is group rate limited?
        local groupRateLimitKey = groupKey .. ':limit'
        local ttl = tonumber(rcall("PTTL", groupRateLimitKey))
        local isRateLimited = ttl > 0
        local waitLen = rcall("LLEN", waitKey)
        if hasReachedMaxConcurrency or isRateLimited or waitLen > 0 then
            local numItems = rcall(pushCmd, groupKey, jobId)
            -- First item in a group, we need to add this groupId to the groupsIds zset
            -- or if rate limited to the groups rate limited zset.
            if numItems == 1 and not hasReachedMaxConcurrency then
                setGroupRateLimitedIfNeeded(prefixKey, groupId, isRateLimited,timestamp, ttl)
            end
        else
            -- Perform standard add (and store this job's group id)
            rcall("SET", prefixKey .. 'groups-lid', groupId)
            rcall(pushCmd, waitKey, jobId)
        end
    end
end
-- Try to get as much as 1000 jobs at once, and returns the nextTimestamp if
-- there are more delayed jobs to process.
local function promoteDelayedJobs(delayedKey, waitKey, priorityKey, pausedKey,
                                  metaKey, eventStreamKey, prefix, timestamp)
    local jobs = rcall("ZRANGEBYSCORE", delayedKey, 0, (timestamp + 1) * 0x1000, "LIMIT", 0, 1000)
    if (#jobs > 0) then
        rcall("ZREM", delayedKey, unpack(jobs))
        -- check if we need to use push in paused instead of waiting
        local target = getTargetQueueList(metaKey, waitKey, pausedKey)
        for _, jobId in ipairs(jobs) do
            local jobAttributes = rcall("HMGET", prefix .. jobId, "priority", "gid")
            local priority = tonumber(jobAttributes[1]) or 0
            -- Standard or priority add
            if jobAttributes[2] then
                addToGroup(true, prefix, jobAttributes[2], jobId, target, tonumber(timestamp))
            elseif priority == 0 then
                -- LIFO or FIFO
                rcall("LPUSH", target, jobId)
            else
                addJobWithPriority(priorityKey, priority, target, jobId)
            end
            -- Emit waiting event
            rcall("XADD", eventStreamKey, "*", "event", "waiting", "jobId",
                  jobId, "prev", "delayed")
            rcall("HSET", prefix .. jobId, "delay", 0)
        end
    end
end
-- Promote a rate-limited group (if any) so that it is not rate limited anymore
--[[
  If the wait list is empty we need to move a job from the
  promoted group to wait (so that we always have a job in wait).
]]
-- Reinsert the group with the highest score so that it is moved to the last position
local function reinsertGroup(groupKey, groupsKey, groupId)
  if rcall("LLEN", groupKey) > 0 then
    local highscore = rcall("ZREVRANGE", groupsKey, 0, 0, "withscores")[2] or 0
    -- Note, this mechanism could keep increasing the score indefinetely.
    -- Score can represent 2^53 integers, so approximatelly 285 years adding 1M jobs/second
    -- before it starts misbehaving.
    rcall("ZADD", groupsKey, highscore + 1, groupId)
  end
end
local function moveJobToWaitFromGroup(prefixKey, waitKey, groupsKey, groupKey, groupId)
  if rcall("LLEN", waitKey) == 0 then
    local jobId = rcall("RPOPLPUSH", groupKey, waitKey)
    if jobId then
      rcall("SET", prefixKey .. 'groups-lid', groupId)
    end
  end
  reinsertGroup(groupKey, groupsKey, groupId)
end
local function promoteRateLimitedGroups(prefixKey, waitKey, timestamp)
    local groupsRateLimitKey = prefixKey .. 'groups:limit'
    local groupIds = rcall("ZPOPMIN", groupsRateLimitKey)
    if #groupIds > 0 then
        -- Is the group really limited?
        local groupRateLimitKey = prefixKey .. 'groups:' .. groupIds[1] .. ':limit'
        local ttl = tonumber(rcall("PTTL", groupRateLimitKey))
        local groupId = groupIds[1]
        if ttl <= 0 then
            -- remove the key manually if ttl is zero to avoid side effects.
            if ttl == 0 then rcall("DEL", groupRateLimitKey) end
            local groupsKey = prefixKey .. 'groups'
            if rcall("ZSCORE", groupsKey .. ':paused', groupId) == false then
                -- Group is not rate limited anymore so we promote it
                local groupKey = groupsKey .. ':' .. groupId
                moveJobToWaitFromGroup(prefixKey, waitKey, groupsKey, groupKey, groupId)
            end
        else
            -- Group is still rate limited, re-add with new score
            local nextTimestamp = timestamp + ttl
            rcall("ZADD", groupsRateLimitKey, nextTimestamp, groupId)
            return nextTimestamp
        end
    end
end
-- Check if there are delayed jobs that we can move to wait.
promoteDelayedJobs(KEYS[7], KEYS[1], KEYS[3], KEYS[8], KEYS[9], KEYS[4], ARGV[1], timestamp)
local rateLimitedNextTtl = promoteRateLimitedGroups(prefixKey, waitKey, timestamp)
if (ARGV[3] ~= "") then
    jobId = ARGV[3]
    -- clean stalled key
    local stalledKeyType = rcall("TYPE", KEYS[5])
    if stalledKeyType["ok"] == "set" then
        rcall("SREM", KEYS[5], jobId)
    else
        rcall("ZREM", KEYS[5], jobId)
    end
else
    -- Check if we are rate limited first.
    local pttl = getRateLimitTTL(opts, KEYS[6])
    if pttl > 0 then
        return { 0, 0, pttl }
    end
    -- If the queue is paused we should just return.
    local paused = rcall("HEXISTS", prefixKey .. "meta", "paused") == 1
    if paused then return end
    -- no job ID, try non-blocking move from wait to active
    -- note, an empty wait list will return false instead of nil
    jobId = rcall("RPOPLPUSH", waitKey, activeKey)
end
local function increaseGroupConcurrency(groupsKey, groupId, maxConcurrency, timestamp)
  local count = rcall("HINCRBY", prefixKey .. 'groups:active:count', groupId, 1)
  if count >= maxConcurrency then
    rcall("ZADD", prefixKey .. 'groups:max', timestamp, groupId)
    rcall("ZREM", groupsKey, groupId)
    return true
  end
end
local function rateLimitGroup(prefixKey, groupId, maxRate, rateDuration,
                              timestamp)
    if maxRate then
        local groupsKey = prefixKey .. 'groups'
        local groupKey = groupsKey .. ':' .. groupId
        local groupRateLimitKey = groupKey .. ':limit'
        -- Update limit key for this group, if rate-limited move the group to the rate limited zset
        local jobCounter = tonumber(rcall("INCR", groupRateLimitKey))
        if jobCounter == 1 then
            rcall("PEXPIRE", groupRateLimitKey, rateDuration)
        end
        -- -- check if rate limit hit
        if jobCounter >= maxRate then
            -- Since this group is rate limited, remove it from the groupsKey and
            -- add it to the limit set.
            rcall("ZREM", groupsKey, groupId)
            -- However, we should only add to the limited set groups that are not
            -- empty!
            if rcall("LLEN", groupKey) > 0 then
                local groupsRateLimitKey = prefixKey .. 'groups:limit'
                local nextTimestamp = timestamp + rateDuration
                rcall("ZADD", groupsRateLimitKey, nextTimestamp, groupId)
            end
            return true
        end
    end
    return false
end
-- TODO: We are missing the fact that if we get rate limited in "moveToActive" or "moveToFinished" we need
-- to also return the next TTL, so basically taking the min(promoted-TTL, newRateLimitedTTL)
local function moveJobToActiveFromGroup(prefixKey, activeKey, groupMaxConcurrency,
    groupLimit, groupLimitDuration, timestamp)
    local groupsKey = prefixKey .. 'groups'
    local jobId
    -- Try to fetch next group's jobs
    local groupIds = rcall("ZPOPMIN", groupsKey)
    if #groupIds > 0 then
        local groupId = groupIds[1]
        local groupKey = groupsKey .. ':' .. groupId
        jobId = rcall("RPOPLPUSH", groupKey, activeKey)
        -- Handle maxGroupConcurrency
        if groupMaxConcurrency then
            if increaseGroupConcurrency(groupsKey, groupId, groupMaxConcurrency, timestamp) then
                return jobId
            end
        end
        if groupLimit then
            if rateLimitGroup(prefixKey, groupId, groupLimit, groupLimitDuration, timestamp) then
                return jobId
            end
        end
        reinsertGroup(groupKey, groupsKey, groupId)
    end
    return jobId
end
--[[
    If there is no jobId in the wait list we will see if we can fetch a job from any of
    the groups.
    The "groupsKey" is a ZSET holding the group ids. An entry in the ZSET guarantees that there
    is a non empty list for that group (we must keep this guarantee at all times [1]).
    After getting the next jobId from the next group (the one with lowest score in the "groupsKey"),
    we need to check if we need to "reinsert" that group with the highest score. It is reinserted
    only if there are any other jobs left for that group, otherwise it is discarded
    (so that we can guarantee [1]).
    If the wait list is empty, since we always need to have 1 job in the wait list *if* there are group jobs
    in any of the groups (so that our blocking workers will pick the next job automatically),
    we try to get the next job from lowest scored group.
]]
local function prefetchNextGroupJob(prefixKey, groupsKey, waitKey,
                                         timestamp)
    if rcall("LLEN", waitKey) == 0 then
        -- TODO: Investigate if we should not promote rate limited groups here as well.
        -- Try to move the next grouped job to wait list
        local groupIds = rcall("ZPOPMIN", groupsKey)
        if #groupIds > 0 then
            local groupsLastIdKey = prefixKey .. 'groups-lid'
            local lastGroupId = rcall("GET", groupsLastIdKey)
            local groupId = groupIds[1]
            local groupKey = groupsKey .. ':' .. groupId
            local numGroups = rcall("ZCARD", groupsKey)
            if lastGroupId ~= groupId or numGroups == 1 then
                local jobId = rcall("RPOPLPUSH", groupKey, waitKey)
                reinsertGroup(groupKey, groupsKey, groupId)
                rcall("SET", groupsLastIdKey, groupId)
            else
                reinsertGroup(groupKey, groupsKey, groupId)
                -- we take next group's job to avoid repeating last group
                local groupIds = rcall("ZPOPMIN", groupsKey)
                if #groupIds > 0 then
                    local groupId = groupIds[1]
                    local groupKey = groupsKey .. ':' .. groupId
                    rcall("RPOPLPUSH", groupKey, waitKey)
                    reinsertGroup(groupKey, groupsKey, groupId)
                    rcall("SET", groupsLastIdKey, groupId)
                end
            end
        end
    end
end
local function moveJobToActive(jobId, rateLimitedNextTtl, prefixKey, options, timestamp, keys)
    local waitKey = keys[1]
    local activeKey = keys[2]
    local groupsKey = prefixKey .. 'groups'
    local groupLimit
    local groupLimitDuration
    local groupMaxConcurrency
    -- Check if we need to perform global rate limiting
    -- TODO: Replace this rate limiting by same method used in groups.
    local maxJobs = options['limiter'] and options['limiter']['max'];
    local expireTime
    -- It is not enough to check if maxJobs is defined, since we can 
    -- activate the limiter dynamically.
    if jobId and maxJobs then
        local limitDuration = options['limiter']['duration'];
        local rateLimiterKey = keys[6];
        expireTime = tonumber(rcall("PTTL", rateLimiterKey))
        if expireTime <= 0 then
            rcall("DEL", rateLimiterKey)
        end      
        local jobCounter = tonumber(rcall("INCR", rateLimiterKey))
        -- check if rate limit hit
        if jobCounter == 1 then
            local limiterDuration = opts['limiter'] and opts['limiter']['duration']
            local integerDuration = math.floor(math.abs(limiterDuration))
            rcall("PEXPIRE", rateLimiterKey, integerDuration)
        end
        if jobCounter > maxJobs then
            expireTime = rcall("PTTL", rateLimiterKey)
            local jobKey = prefixKey .. jobId
            local groupId = rcall("HGET", jobKey, "gid")
            rcall("LREM", activeKey, 1, jobId)
            if groupId then
                local groupKey = prefixKey .. 'groups:' .. groupId
                -- Move the job back to the group it belongs to
                rcall("RPUSH", groupKey, jobId)
            else
                rcall("RPUSH", waitKey, jobId)
            end
            -- Return when we can process more jobs
            return {0, 0, expireTime}
        end
    end
    if options['group'] then
        if options['group']['limit'] then
            groupLimit = options['group']['limit']['max']
            groupLimitDuration = options['group']['limit']['duration']
        end
        groupMaxConcurrency = options['group']['concurrency']
    end
    local token = options['token']
    local lockDuration = options['lockDuration']
    if jobId and groupMaxConcurrency then
        local jobKey = prefixKey .. jobId
        local groupId = rcall("HGET", jobKey, "gid")
        if groupId then
            local groupKey = prefixKey .. 'groups:' .. groupId
            if rcall("ZSCORE", prefixKey .. 'groups:max', groupId) ~= false then
                -- Special Case for the max concurrency feature.
                -- Since the call to BRPOPLPUSH + this lua script is not atomic,
                -- we need to make sure that we have not reached the max concurrency
                -- for this group.
                -- Move the job back to the group it belongs to
                rcall("LREM", activeKey, -1, jobId)
                rcall("RPUSH", groupKey, jobId)
                jobId = nil
            else
                increaseGroupConcurrency(groupsKey, groupId, groupMaxConcurrency, timestamp)
            end
        end
    end
    if jobId then
        -- Check if the group this job belongs to has been rate limited
        -- NOTE: this handles the edge case where a group can be rate limited
        -- between the BRPOPLPUSH call and moveToActive.
        -- NOTE: Due to this edge case we cannot guarantee the order of rate limited jobs
        -- within a given group.
        local jobKey = prefixKey .. jobId
        local groupId = rcall("HGET", jobKey, "gid")
        if groupId then
            local groupKey = prefixKey .. 'groups:' .. groupId
            local groupRateLimitKey = groupKey .. ':limit'
            local ttl = tonumber(rcall("PTTL", groupRateLimitKey))
            if ttl > 0 then
                -- Remove from active and move back to the group to the "right" side,
                -- so that it gets picked up asap.
                rcall("LREM", activeKey, -1, jobId)
                rcall("RPUSH", groupKey, jobId)
                -- This could have been that last job in a group so lets re-add it just in case
                local nextTimestamp = timestamp + ttl
                local groupsRateLimitKey = groupsKey .. ':limit'
                rcall("ZADD", groupsRateLimitKey, nextTimestamp, groupId)
                -- Update the next ttl known
                if rateLimitedNextTtl then
                    rateLimitedNextTtl = math.min(rateLimitedNextTtl, ttl)
                else
                    rateLimitedNextTtl = ttl
                end
                jobId = nil
            else
                rateLimitGroup(prefixKey, groupId, groupLimit, groupLimitDuration, timestamp)
            end
        end
    end
    if not jobId then
        jobId = moveJobToActiveFromGroup(prefixKey, activeKey,
                    groupMaxConcurrency, groupLimit, groupLimitDuration, timestamp)
    end
    if jobId then
        local jobKey = prefixKey .. jobId
        prefetchNextGroupJob(prefixKey, groupsKey, waitKey)
        local lockKey = jobKey .. ':lock'
        -- get a lock
        rcall("SET", lockKey, token, "PX", lockDuration)
        rcall("ZREM", keys[3], jobId) -- remove from priority
        rcall("XADD", keys[4], "*", "event", "active", "jobId", jobId, "prev",
              "waiting")
        rcall("HSET", jobKey, "processedOn", timestamp)
        rcall("HINCRBY", jobKey, "attemptsMade", 1)
        -- This is a bit wrong actually, the queue could have jobs that are ratelimited or
        -- have reached max concurrency, so in that case we should not emit this.
        return {rcall("HGETALL", jobKey), jobId, expireTime or 0, rateLimitedNextTtl} -- get job data
    else
        -- We hint the worker when there will be groups not rate limited anymore.
        return {0, 0, expireTime or 0, rateLimitedNextTtl}
    end
end
-- If jobId is special ID 0:delay, then there is no job to process
if jobId then 
    if string.sub(jobId, 1, 2) == "0:" then
        rcall("LREM", activeKey, 1, jobId)
        -- Move again since we just got the marker job.
        jobId = rcall("RPOPLPUSH", waitKey, activeKey)
        if jobId and string.sub(jobId, 1, 2) == "0:" then
            rcall("LREM", activeKey, 1, jobId)
            jobId = nil
        end
    end
end
-- this script is not really moving, it is preparing the job for processing
local result = moveJobToActive(jobId, rateLimitedNextTtl, prefixKey, opts, timestamp,
    KEYS)
local resultType = type(result) 
-- Return the timestamp for the next delayed job if any.
local nextTimestamp = getNextDelayedTimestamp(KEYS[7])
if (nextTimestamp ~= nil) then
    if resultType == "table" then
        if (result[4] or 0) > nextTimestamp then
            return { result[1], result[2], result[3], nextTimestamp}
        end
        return {result[1], result[2], result[3], result[4] or nextTimestamp}
    else
        return { 0, 0, 0, nextTimestamp}
    end
end
if resultType == 'nil' then
    return {0, 0, 0, rateLimitedNextTtl}
end
return result
`;
export const moveToActive = {
    name: 'moveToActive',
    content,
    keys: 9,
};
//# sourceMappingURL=moveToActive-9.js.map