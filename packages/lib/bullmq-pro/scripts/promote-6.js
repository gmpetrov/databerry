const content = `--[[
  Promotes a job that is currently "delayed" to the "waiting" state
     Input:
      KEYS[1] 'delayed'
      KEYS[2] 'wait'
      KEYS[3] 'paused'
      KEYS[4] 'meta'
      KEYS[5] 'priority'
      KEYS[6] 'event stream'
      ARGV[1]  queue.toKey('')
      ARGV[2]  jobId
      ARGV[3]  timestamp
     Events:
      'waiting'
]]
local rcall = redis.call;
local jobId = ARGV[2]
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
if rcall("ZREM", KEYS[1], jobId) == 1 then
  local jobAttributes = rcall("HMGET", ARGV[1] .. jobId, "priority", "gid")
  local priority = tonumber(jobAttributes[1]) or 0
  local target = getTargetQueueList(KEYS[4], KEYS[2], KEYS[3])
  -- Remove delayed "marker" from the wait list if there is any.
  -- Since we are adding a job we do not need the marker anymore.
  local marker = rcall("LINDEX", target, 0)
  if marker and string.sub(marker, 1, 2) == "0:" then
    rcall("LPOP", target)
  end
  if jobAttributes[2] then
    addToGroup(true, ARGV[1], jobAttributes[2], jobId, target, tonumber(ARGV[3]))
  elseif priority == 0 then
    -- LIFO or FIFO
    rcall("LPUSH", target, jobId)
  else
    -- Priority add
    addJobWithPriority(KEYS[5], priority, target, jobId)
  end
  -- Emit waiting event (wait..ing@token)
  rcall("XADD", KEYS[6], "*", "event", "waiting", "jobId", jobId, "prev", "delayed");
  rcall("HSET", ARGV[1] .. jobId, "delay", 0)
  return 0
else
  return -3
end`;
export const promote = {
    name: 'promote',
    content,
    keys: 6,
};
//# sourceMappingURL=promote-6.js.map