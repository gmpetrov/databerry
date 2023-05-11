const content = `--[[
  Move stalled jobs to wait.
    Input:
      KEYS[1] 'stalled' (SET)
      KEYS[2] 'wait',   (LIST)
      KEYS[3] 'active', (LIST)
      KEYS[4] 'failed', (ZSET)
      KEYS[5] 'stalled-check', (KEY)
      KEYS[6] 'meta', (KEY)
      KEYS[7] 'paused', (LIST)
      KEYS[8] 'event stream' (STREAM)
      ARGV[1]  Max stalled job count
      ARGV[2]  queue.toKey('')
      ARGV[3]  timestamp
      ARGV[4]  max check time
    Events:
      'stalled' with stalled job id.
]]
local rcall = redis.call
-- Includes
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
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
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
-- Check if we need to check for stalled jobs now.
if rcall("EXISTS", KEYS[5]) == 1 then return {{}, {}} end
rcall("SET", KEYS[5], ARGV[3], "PX", ARGV[4])
-- Trim events before emiting them to avoid trimming events emitted in this script
trimEvents(KEYS[6], KEYS[8])
local activeKey = KEYS[3]
-- Move all stalled jobs to wait
local stalling
local stalledKeyType = rcall("TYPE", KEYS[1])
if stalledKeyType["ok"] == "set" then
    stalling = rcall('SMEMBERS', KEYS[1])
else
    stalling = rcall('ZREVRANGEBYSCORE', KEYS[1], "inf", "-inf")
end
local stalled = {}
local failed = {}
if (#stalling > 0) then
    rcall('DEL', KEYS[1])
    local MAX_STALLED_JOB_COUNT = tonumber(ARGV[1])
    -- Remove from active list
    for i, jobId in ipairs(stalling) do
        if string.sub(jobId, 1, 2) == "0:" then
            -- If the jobId is a delay marker ID we just remove it.
            local removed = rcall("LREM", activeKey, 1, jobId)
        else
            local jobKey = ARGV[2] .. jobId
            -- Check that the lock is also missing, then we can handle this job as really stalled.
            if (rcall("EXISTS", jobKey .. ":lock") == 0) then
                --  Remove from the active queue.
                local removed = rcall("LREM", KEYS[3], 1, jobId)
                if (removed > 0) then
                    -- We must remove the group this job's belongs to from the "active" group list.
                    local groupId = rcall("HGET", jobKey, "gid")
                    if groupId then
                        -- we assume 999999 as inf concurrency.
                        decreaseGroupConcurrency(ARGV[2], groupId, 999999)
                    end
                    -- If this job has been stalled too many times, such as if it crashes the worker, then fail it.
                    local stalledCount = rcall("HINCRBY", jobKey, "stalledCounter",
                                            1)
                    if (stalledCount > MAX_STALLED_JOB_COUNT) then
                        local rawOpts = rcall("HGET",jobKey, "opts")
                        local opts = cjson.decode(rawOpts)
                        local removeOnFailType = type(opts["removeOnFail"])
                        rcall("ZADD", KEYS[4], ARGV[3], jobId)
                        local failedReason = "job stalled more than allowable limit"
                        rcall("HMSET", jobKey, "failedReason", failedReason,
                            "finishedOn", ARGV[3])
                        rcall("XADD", KEYS[8], "*", "event", "failed", "jobId",
                            jobId, 'prev', 'active', 'failedReason', failedReason)
                        if removeOnFailType == "number" then
                            removeJobsByMaxCount(opts["removeOnFail"], KEYS[4], ARGV[2])
                        elseif removeOnFailType == "boolean" then
                            if opts["removeOnFail"] then
                                removeJob(jobId, false, ARGV[2])
                                rcall("ZREM", KEYS[4], jobId)
                            end                  
                        elseif removeOnFailType ~= "nil" then
                            local maxAge = opts["removeOnFail"]["age"]
                            local maxCount = opts["removeOnFail"]["count"]
                            if maxAge ~= nil then
                                removeJobsByMaxAge(ARGV[3], maxAge, KEYS[4], ARGV[2])
                            end
                            if maxCount ~= nil and maxCount > 0 then
                                removeJobsByMaxCount(maxCount, KEYS[4], ARGV[2])
                            end
                        end
                        table.insert(failed, jobId)
                    else
                        local target = getTargetQueueList(KEYS[6], KEYS[2], KEYS[7])
                        -- If it is a grouped job we cannot always move to active in order to preserve
                        -- group order and rate limiter.
                        if groupId then
                            addToGroup(true, ARGV[2], groupId, jobId, target, tonumber(ARGV[3]))
                        else
                            -- Move the job back to the wait queue, to immediately be picked up by a waiting worker.
                            rcall("RPUSH", target, jobId)
                        end
                        rcall("XADD", KEYS[8], "*", "event", "waiting", "jobId",
                            jobId, 'prev', 'active')
                        -- Emit the stalled event
                        rcall("XADD", KEYS[8], "*", "event", "stalled", "jobId",
                            jobId)
                        table.insert(stalled, jobId)
                    end
                end
            end
        end
    end
end
-- Mark potentially stalled jobs
local active = rcall('LRANGE', KEYS[3], 0, -1)
if (#active > 0) then
    stalledKeyType = rcall("TYPE", KEYS[1])
    if stalledKeyType["ok"] == "zset" then
        for from, to in batches(#active, 3500) do
            local args = {}
            for i = from, to do
                table.insert(args, i)
                table.insert(args, active[i])
            end
            rcall('ZADD', KEYS[1], unpack(args))
        end
    else
        for from, to in batches(#active, 7000) do
            rcall('SADD', KEYS[1], unpack(active, from, to))
        end
    end
end
return {failed, stalled}
`;
export const moveStalledJobsToWait = {
    name: 'moveStalledJobsToWait',
    content,
    keys: 8,
};
//# sourceMappingURL=moveStalledJobsToWait-8.js.map