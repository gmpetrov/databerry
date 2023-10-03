const content = `--[[
  Move job from active to a finished status (completed o failed)
  A job can only be moved to completed if it was active.
  The job must be locked before it can be moved to a finished status,
  and the lock must be released in this script.
     Input:
      KEYS[1] wait key
      KEYS[2] active key
      KEYS[3] priority key
      KEYS[4] stream events key
      KEYS[5] stalled key
      -- Rate limiting
      KEYS[6] rate limiter key
      KEYS[7] delayed key
      KEYS[8] paused key
      KEYS[9] completed/failed key
      KEYS[10] jobId key
      KEYS[11] meta key
      KEYS[12] metrics key
      ARGV[1]  jobId
      ARGV[2]  timestamp
      ARGV[3]  msg property
      ARGV[4]  return value / failed reason
      ARGV[5]  target (completed/failed)
      ARGV[6]  event data (? maybe just send jobid).
      ARGV[7]  fetch next?
      ARGV[8]  keys prefix
      ARGV[9] opts
     Output:
      0 OK
      -1 Missing key.
      -2 Missing lock.
      -3 Job not in active set
      -4 Job has pending dependencies
      -6 Lock is not owned by this client
     Events:
      'completed/failed'
]]
local rcall = redis.call
local waitKey = KEYS[1]
local activeKey = KEYS[2]
local priorityKey = KEYS[3]
local eventStreamKey = KEYS[4]
local stalledKey = KEYS[5]
local finishedKey = KEYS[9]
local jobIdKey = KEYS[10]
local metaKey = KEYS[11]
local timestamp = ARGV[2]
local prefixKey = ARGV[8]
local opts = cmsgpack.unpack(ARGV[9])
local token = opts['token']
local lockDuration = opts['lockDuration']
local attempts = opts['attempts']
local attemptsMade = opts['attemptsMade']
local maxMetricsSize = opts['maxMetricsSize']
--[[
  Functions to collect metrics based on a current and previous count of jobs.
  Granualarity is fixed at 1 minute.
]] 
--[[
  Function to loop in batches.
  Just a bit of warning, some commands as ZREM
  could receive a maximum of 7000 parameters per call.
]]
local function batches(n, batchSize)
  local i = 0
  return function()
    local from = i * batchSize + 1
    i = i + 1
    if (from <= n) then
      local to = math.min(from + batchSize - 1, n)
      return from, to
    end
  end
end
local function collectMetrics(metaKey, dataPointsList, maxDataPoints,
                                 timestamp)
    -- Increment current count
    local count = rcall("HINCRBY", metaKey, "count", 1) - 1
    -- Compute how many data points we need to add to the list, N.
    local prevTS = rcall("HGET", metaKey, "prevTS")
    if not prevTS then
        -- If prevTS is nil, set it to the current timestamp
        rcall("HSET", metaKey, "prevTS", timestamp, "prevCount", 0)
        return
    end
    local N = math.floor((timestamp - prevTS) / 60000)
    if N > 0 then
        local delta = count - rcall("HGET", metaKey, "prevCount")
        -- If N > 1, add N-1 zeros to the list
        if N > 1 then
            local points = {}
            points[1] = delta
            for i = 2, N do
                points[i] = 0
            end
            for from, to in batches(#points, 7000) do
                rcall("LPUSH", dataPointsList, unpack(points, from, to))
            end
        else
            -- LPUSH delta to the list
            rcall("LPUSH", dataPointsList, delta)
        end
        -- LTRIM to keep list to its max size
        rcall("LTRIM", dataPointsList, 0, maxDataPoints - 1)
        -- update prev count with current count
        rcall("HSET", metaKey, "prevCount", count, "prevTS", timestamp)
    end
end
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
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
  Function to recursively move from waitingChildren to failed.
]]
local function moveParentFromWaitingChildrenToFailed( parentQueueKey, parentKey, parentId, jobIdKey, timestamp)
  if rcall("ZREM", parentQueueKey .. ":waiting-children", parentId) == 1 then
    rcall("ZADD", parentQueueKey .. ":failed", timestamp, parentId)
    local failedReason = "child " .. jobIdKey .. " failed"
    rcall("HMSET", parentKey, "failedReason", failedReason, "finishedOn", timestamp)
    rcall("XADD", parentQueueKey .. ":events", "*", "event", "failed", "jobId", parentId, "failedReason",
      failedReason, "prev", "waiting-children")
    local rawParentData = rcall("HGET", parentKey, "parent")
    if rawParentData ~= false then
      local parentData = cjson.decode(rawParentData)
      if parentData['fpof'] then
        moveParentFromWaitingChildrenToFailed(
          parentData['queueKey'],
          parentData['queueKey'] .. ':' .. parentData['id'],
          parentData['id'],
          parentKey,
          timestamp
        )
      end
    end
  end
end
--[[
  Function to remove job.
]]
-- Includes
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
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
local function moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "wait", parentPrefix .. "paused")
  rcall("RPUSH", parentTarget, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey)
              rcall("DEL", parentKey, parentKey .. ':logs',
                parentKey .. ':dependencies', parentKey .. ':processed')
            else
              moveParentToWait(parentPrefix, parentId)
            end
          else
            moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
    end
  else
    local missedParentKey = rcall("HGET", jobKey, "parentKey")
    if( (type(missedParentKey) == "string") and missedParentKey ~= "" and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey)
                rcall("DEL", missedParentKey, missedParentKey .. ':logs',
                  missedParentKey .. ':dependencies', missedParentKey .. ':processed')
              else
                moveParentToWait(parentPrefix, parentId)
              end
            else
              moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
      end
    end
  end
end
local function removeJob(jobId, hard, baseKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  rcall("DEL", jobKey, jobKey .. ':logs',
    jobKey .. ':dependencies', jobKey .. ':processed')
end
--[[
  Functions to remove jobs by max age.
]]
-- Includes
local function removeJobsByMaxAge(timestamp, maxAge, targetSet, prefix)
  local start = timestamp - maxAge * 1000
  local jobIds = rcall("ZREVRANGEBYSCORE", targetSet, start, "-inf")
  for i, jobId in ipairs(jobIds) do
    removeJob(jobId, false, prefix)
  end
  rcall("ZREMRANGEBYSCORE", targetSet, "-inf", start)
end
--[[
  Functions to remove jobs by max count.
]]
-- Includes
local function removeJobsByMaxCount(maxCount, targetSet, prefix)
  local start = maxCount
  local jobIds = rcall("ZREVRANGE", targetSet, start, -1)
  for i, jobId in ipairs(jobIds) do
    removeJob(jobId, false, prefix)
  end
  rcall("ZREMRANGEBYRANK", targetSet, 0, -(maxCount + 1))
end
--[[
  Function to trim events, default 10000.
]]
local function trimEvents(metaKey, eventStreamKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if maxEvents ~= false then
    rcall("XTRIM", eventStreamKey, "MAXLEN", "~", maxEvents)
  else
    rcall("XTRIM", eventStreamKey, "MAXLEN", "~", 10000)
  end
end
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
local function decreaseGroupConcurrency(prefixKey, groupId, maxConcurrency)
    local activeCountKey = prefixKey .. "groups:active:count"
    local activeCount = rcall("HGET", activeCountKey, groupId)
    if activeCount then
        local count = rcall("HINCRBY", activeCountKey, groupId, -1)
        if count <= 0 then rcall("HDEL", activeCountKey, groupId) end
        -- We use maxConcurrency, in case the user decides to change it (lower it),
        -- we need to check it here so that we keep the group in active if necessary.
        if (count < maxConcurrency) and
            (rcall("ZSCORE", prefixKey .. "groups:max", groupId) ~= false) then
            rcall("ZREM", prefixKey .. "groups:max", groupId)
            if rcall("ZSCORE", prefixKey .. "groups:paused", groupId) == false then                
                local groupKey = prefixKey .. 'groups:' .. groupId
                local groupsKey = prefixKey .. 'groups'
                reinsertGroup(groupKey, groupsKey, groupId)
            end
        end
    end
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
-- Promote a rate-limited group (if any) so that it is not rate limited anymore
--[[
  If the wait list is empty we need to move a job from the
  promoted group to wait (so that we always have a job in wait).
]]
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
--[[
  Validate and move or add dependencies to parent.
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
local function addDelayMarkerIfNeeded(target, delayedKey)
  if rcall("LLEN", target) == 0 then
    local nextTimestamp = getNextDelayedTimestamp(delayedKey)
    if nextTimestamp ~= nil then
      rcall("LPUSH", target, "0:" .. nextTimestamp)
    end
  end
end
local function updateParentDepsIfNeeded(parentKey, parentQueueKey, parentDependenciesKey,
  parentId, jobIdKey, returnvalue, timestamp )
  local processedSet = parentKey .. ":processed"
  rcall("HSET", processedSet, jobIdKey, returnvalue)
  local activeParent = rcall("ZSCORE", parentQueueKey .. ":waiting-children", parentId)
  if rcall("SCARD", parentDependenciesKey) == 0 and activeParent then 
    rcall("ZREM", parentQueueKey .. ":waiting-children", parentId)
    local parentTarget = getTargetQueueList(parentQueueKey .. ":meta", parentQueueKey .. ":wait",
      parentQueueKey .. ":paused")
    local jobAttributes = rcall("HMGET", parentKey, "priority", "gid", "delay")
    local priority = tonumber(jobAttributes[1])
    local delay = tonumber(jobAttributes[3]) or 0
    -- Standard or priority add
    if delay > 0 then
      local delayedTimestamp = tonumber(timestamp) + delay 
      local score = delayedTimestamp * 0x1000
      local parentDelayedKey = parentQueueKey .. ":delayed" 
      rcall("ZADD", parentDelayedKey, score, parentId)
      addDelayMarkerIfNeeded(parentTarget, parentDelayedKey)
    elseif jobAttributes[2] then
      addToGroup(true, parentQueueKey, jobAttributes[2], parentId, parentTarget, timestamp)
    elseif priority == 0 then
      rcall("RPUSH", parentTarget, parentId)
    else
      addJobWithPriority(parentQueueKey .. ":priority", priority, parentTarget, parentId)
    end
    rcall("XADD", parentQueueKey .. ":events", "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local rateLimitedNextTtl = promoteRateLimitedGroups(prefixKey, waitKey,
                                                    timestamp)
if rcall("EXISTS", jobIdKey) == 1 then -- // Make sure job exists
    if token ~= "0" then
        local lockKey = jobIdKey .. ':lock'
        local lockToken = rcall("GET", lockKey)
        if lockToken == token then
            rcall("DEL", lockKey)
            local stalledKeyType = rcall("TYPE", stalledKey)
            if stalledKeyType["ok"] == "set" then
                rcall("SREM", stalledKey, ARGV[1])
            else
                rcall("ZREM", stalledKey, ARGV[1])
            end
        else
            if lockToken then
                -- Lock exists but token does not match
                return -6
            else
                -- Lock is missing completely
                return -2
            end
        end
    end
    if rcall("SCARD", jobIdKey .. ":dependencies") ~= 0 then -- // Make sure it does not have pending dependencies
        return -4
    end
    local parentReferences = rcall("HMGET", jobIdKey, "parentKey", "parent")
    local parentKey = parentReferences[1] or ""
    local parentId = ""
    local parentQueueKey = ""
    if parentReferences[2] ~= false then
        local jsonDecodedParent = cjson.decode(parentReferences[2])
        parentId = jsonDecodedParent['id']
        parentQueueKey = jsonDecodedParent['queueKey']
    end
    local jobId = ARGV[1]
    local timestamp = ARGV[2]
    -- Remove from active list (if not active we shall return error)
    local numRemovedElements = rcall("LREM", activeKey, -1, jobId)
    if (numRemovedElements < 1) then return -3 end
    -- Trim events before emiting them to avoid trimming events emitted in this script
    trimEvents(metaKey, eventStreamKey)
    -- Update the active group count and set.
    local jobKey = prefixKey .. jobId
    local groupId = rcall("HGET", jobKey, "gid")
    if groupId then
        local maxConcurrency = opts['group'] and opts['group']['concurrency']
        decreaseGroupConcurrency(prefixKey, groupId, maxConcurrency or 999999)
    end
    -- If job has a parent we need to 
    -- 1) remove this job id from parents dependencies
    -- 2) move the job Id to parent "processed" set
    -- 3) push the results into parent "results" list
    -- 4) if parent's dependencies is empty, then move parent to "wait/paused". Note it may be a different queue!.
    -- NOTE: Priorities not supported yet for parent jobs.
    -- local parentQueueKey = ARGV[13]
    if parentId == "" and parentKey ~= "" then
        parentId = getJobIdFromKey(parentKey)
        parentQueueKey = getJobKeyPrefix(parentKey, ":" .. parentId)
    end
    if parentId ~= "" then
        if ARGV[5] == "completed" then
            local dependenciesSet = parentKey .. ":dependencies"
            if rcall("SREM", dependenciesSet, jobIdKey) == 1 then
                updateParentDepsIfNeeded(parentKey, parentQueueKey, dependenciesSet,
                    parentId, jobIdKey, ARGV[4], timestamp)
            end
        elseif opts['fpof'] then
            moveParentFromWaitingChildrenToFailed(parentQueueKey, parentKey, parentId, jobIdKey, timestamp)
        end
    end
    -- Remove job?
    local maxCount = opts['keepJobs']['count']
    local maxAge = opts['keepJobs']['age']
    if maxCount ~= 0 then
        local targetSet = finishedKey
        -- Add to complete/failed set
        rcall("ZADD", targetSet, timestamp, jobId)
        rcall("HMSET", jobIdKey, ARGV[3], ARGV[4], "finishedOn", timestamp)
        -- "returnvalue" / "failedReason" and "finishedOn"
        -- Remove old jobs?
        if maxAge ~= nil then
            removeJobsByMaxAge(timestamp, maxAge, targetSet, prefixKey)
        end
        if maxCount ~= nil and maxCount > 0 then
            removeJobsByMaxCount(maxCount, targetSet, prefixKey)
        end
    else
        local jobLogKey = jobIdKey .. ':logs'
        local jobProcessedKey = jobIdKey .. ':processed'
        rcall("DEL", jobIdKey, jobLogKey, jobProcessedKey)
        if parentKey ~= "" then
            removeParentDependencyKey(jobIdKey, false, parentKey)
        end
    end
    rcall("XADD", eventStreamKey, "*", "event", ARGV[5], "jobId", jobId,
          ARGV[3], ARGV[4])
    if ARGV[5] == "failed" then
        if tonumber(attemptsMade) >= tonumber(attempts) then
            rcall("XADD", eventStreamKey, "*", "event", "retries-exhausted",
                  "jobId", jobId, "attemptsMade", attemptsMade)
        end
    end
    -- Collect metrics
    if maxMetricsSize ~= "" then
        collectMetrics(KEYS[12], KEYS[12] .. ':data', maxMetricsSize, timestamp)
    end
    -- Since there may not be a job in wait due to some BRPOPLPUSH stealing the job
    -- we must check if we need to prefetch the next one.
    local groupsKey = prefixKey .. 'groups'
    prefetchNextGroupJob(prefixKey, groupsKey, waitKey)
    -- Try to get next job to avoid an extra roundtrip if the queue is not closing,
    -- and not rate limited and not paused!
    local paused = rcall("HEXISTS", prefixKey .. "meta", "paused") == 1
    -- Check if there are delayed jobs that can be promoted
    promoteDelayedJobs(KEYS[7], waitKey, priorityKey, KEYS[8], KEYS[11], KEYS[4], ARGV[8], timestamp)
    if (ARGV[7] == "1" and not paused) then        
        -- Check if we are rate limited first.
        local pttl = getRateLimitTTL(opts, KEYS[6])
        if pttl > 0 then
            return { 0, 0, pttl }
        end
        jobId = rcall("RPOPLPUSH", waitKey, activeKey)
        local result
        -- If jobId is special ID 0:delay, then there is no job to process
        if jobId then 
            if string.sub(jobId, 1, 2) == "0:" then
                rcall("LREM", activeKey, 1, jobId)
                jobId = rcall("RPOPLPUSH", waitKey, activeKey)
            end
        end
        -- this script is not really moving, it is preparing the job for processing
        local result = moveJobToActive(jobId, rateLimitedNextTtl, prefixKey,
            opts, timestamp, KEYS)
        local resultType = type(result)
        local waitLen = rcall("LLEN", KEYS[1])
        if waitLen == 0 then
            local activeLen = rcall("LLEN", KEYS[2])
            if activeLen == 0 then
                rcall("XADD", KEYS[4], "*", "event", "drained")
            end
        end
        -- Return the timestamp for the next delayed job if any.
        local nextTimestamp = getNextDelayedTimestamp(KEYS[7])
        if (nextTimestamp ~= nil) then
            -- The result is guaranteed to be positive, since the
            -- ZRANGEBYSCORE command would have return a job otherwise.
            if resultType == "table" then
                if (result[4] or 0) > nextTimestamp then
                    return {result[1], result[2], result[3], nextTimestamp}
                end
                return {result[1], result[2], result[3], result[4] or nextTimestamp}
            else
                return {0, 0, 0, nextTimestamp}
            end
        end
        if resultType == 'nil' then
            return {0, 0, 0, rateLimitedNextTtl}
        end
        return result
    end
    return {0, 0, 0, rateLimitedNextTtl}
else
    return -1
end
`;
export const moveToFinished = {
    name: 'moveToFinished',
    content,
    keys: 12,
};
//# sourceMappingURL=moveToFinished-12.js.map