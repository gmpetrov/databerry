const content = `--[[
  Updates the delay set, by picking a delayed job that should
  be processed now.
    Input:
      KEYS[1] 'delayed'
      KEYS[2] 'wait'
      KEYS[3] 'priority'
      KEYS[4] 'paused'
      KEYS[5] 'meta'
      KEYS[6] event's stream
      KEYS[7] delayed stream
      ARGV[1] queue.toKey('')
      ARGV[2] delayed timestamp
     Events:
      'waiting'
]]
local rcall = redis.call
-- Try to get as much as 1000 jobs at once
local jobs = rcall("ZRANGEBYSCORE", KEYS[1], 0, tonumber(ARGV[2]) * 0x1000,
                   "LIMIT", 0, 1000)
-- Includes
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
if (#jobs > 0) then
    rcall("ZREM", KEYS[1], unpack(jobs))
    -- check if we need to use push in paused instead of waiting
    local target = getTargetQueueList(KEYS[5], KEYS[2], KEYS[4])
    for _, jobId in ipairs(jobs) do
        local jobKey = ARGV[1] .. jobId
        local priority =
            tonumber(rcall("HGET", jobKey, "priority")) or 0
        if priority == 0 then
            local groupId = rcall("HGET", jobKey, "gid")
            -- Groups
            if groupId ~= false then
                addToGroup(false, ARGV[1], groupId, jobId, target, tonumber(ARGV[2]))
            else
                rcall("LPUSH", target, jobId)
            end
        else
            -- Priority add
            addJobWithPriority(KEYS[3], priority, target, jobId)
        end
        -- Emit waiting event
        rcall("XADD", KEYS[6], "*", "event", "waiting", "jobId", jobId, "prev",
              "delayed")
        rcall("HSET", ARGV[1] .. jobId, "delay", 0)
    end
end
local nextTimestamp = rcall("ZRANGE", KEYS[1], 0, 0, "WITHSCORES")[2]
local id
if (nextTimestamp ~= nil) then
    nextTimestamp = nextTimestamp / 0x1000
    id = rcall("XADD", KEYS[7], "*", "nextTimestamp", nextTimestamp)
end
return {nextTimestamp, id}
`;
export const updateDelaySet = {
    name: 'updateDelaySet',
    content,
    keys: 7,
};
//# sourceMappingURL=updateDelaySet-7.js.map