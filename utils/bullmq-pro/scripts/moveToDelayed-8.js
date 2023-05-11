const content = `--[[
  Moves job from active to delayed set.
  Input:
    KEYS[1] wait key
    KEYS[2] active key
    KEYS[3] priority key
    KEYS[4] delayed key
    KEYS[5] job key
    KEYS[6] events stream
    KEYS[7] paused key
    KEYS[8] meta key
    ARGV[1] key prefix
    ARGV[2] timestamp
    ARGV[3] delayedTimestamp
    ARGV[4] the id of the job
    ARGV[5] queue token
    ARGV[6] groupId
    ARGV[7] concurrency
  Output:
    0 - OK
   -1 - Missing job.
   -2 - Missing lock
   -3 - Job not in active set.
  Events:
    - delayed key.
]]
local rcall = redis.call
--[[
  Add delay marker if needed.
]]
-- Includes
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
local function addDelayMarkerIfNeeded(target, delayedKey)
  if rcall("LLEN", target) == 0 then
    local nextTimestamp = getNextDelayedTimestamp(delayedKey)
    if nextTimestamp ~= nil then
      rcall("LPUSH", target, "0:" .. nextTimestamp)
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
promoteDelayedJobs(KEYS[4], KEYS[1], KEYS[3], KEYS[7], KEYS[8], KEYS[6], ARGV[1], ARGV[2])
if rcall("EXISTS", KEYS[5]) == 1 then
  local delayedKey = KEYS[4]
  if ARGV[5] ~= "0" then
    local lockKey = KEYS[5] .. ':lock'
    if rcall("GET", lockKey) == ARGV[5] then
      rcall("DEL", lockKey)
    else
      return -2
    end
  end
  local jobId = ARGV[4]
  local score = tonumber(ARGV[3])
  local delayedTimestamp = (score / 0x1000)
  local numRemovedElements = rcall("LREM", KEYS[2], -1, jobId)
  if(numRemovedElements < 1) then
    return -3
  end
  -- Check if we need to push a marker job to wake up sleeping workers.
  local target = getTargetQueueList(KEYS[8], KEYS[1], KEYS[7])
  addDelayMarkerIfNeeded(target, delayedKey)
  rcall("ZADD", delayedKey, score, jobId)
  if ARGV[6] then
    decreaseGroupConcurrency(ARGV[1], ARGV[6], tonumber(ARGV[7] or 999999))
  end
  rcall("XADD", KEYS[6], "*", "event", "delayed", "jobId", jobId, "delay", delayedTimestamp);
  return 0
else
  return -1
end
`;
export const moveToDelayed = {
    name: 'moveToDelayed',
    content,
    keys: 8,
};
//# sourceMappingURL=moveToDelayed-8.js.map