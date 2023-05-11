const content = `--[[
  Adds a job to the queue by doing the following:
    - Increases the job counter if needed.
    - Creates a new job key with the job data.
    - if delayed:
      - computes timestamp.
      - adds to delayed zset.
      - Emits a global event 'delayed' if the job is delayed.
    - if not delayed
      - Adds the jobId to the wait/paused list in one of three ways:
         - LIFO
         - FIFO
         - prioritized.
      - Adds the job to the "added" list so that workers gets notified.
    Input:
      KEYS[1] 'wait',
      KEYS[2] 'paused'
      KEYS[3] 'meta'
      KEYS[4] 'id'
      KEYS[5] 'delayed'
      KEYS[6] 'priority'
      KEYS[7] 'completed'
      KEYS[8] events stream key
      ARGV[1] msgpacked arguments array
            [1]  key prefix,
            [2]  custom id (will not generate one automatically)
            [3]  name
            [4]  timestamp
            [5]  parentKey?
            [6]  waitChildrenKey key.
            [7]  parent dependencies key.
            [8]  parent? {id, queueKey}
            [9]  repeat job key
      ARGV[2] Json stringified job data
      ARGV[3] msgpacked options
      Output:
        jobId  - OK
        -5     - Missing parent key
]]
local jobId
local jobIdKey
local rcall = redis.call
local args = cmsgpack.unpack(ARGV[1])
local data = ARGV[2]
local opts = cmsgpack.unpack(ARGV[3])
local prefixKey = args[1]
local parentKey = args[5]
local repeatJobKey = args[9]
local parent = args[8]
local parentData
-- Includes
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
if parentKey ~= nil then
    if rcall("EXISTS", parentKey) ~= 1 then return -5 end
    parentData = cjson.encode(parent)
end
local jobCounter = rcall("INCR", KEYS[4])
-- Includes
--[[
  Validate and move or add dependencies to parent.
]]
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
-- Trim events before emiting them to avoid trimming events emitted in this script
trimEvents(KEYS[3], KEYS[8])
local timestamp = args[4]
local parentDependenciesKey = args[7]
if args[2] == "" then
    jobId = jobCounter
    jobIdKey = prefixKey .. jobId
else
    jobId = args[2]
    jobIdKey = prefixKey .. jobId
    if rcall("EXISTS", jobIdKey) == 1 then
        if parentKey ~= nil then
            if rcall("ZSCORE", KEYS[7], jobId) ~= false then
                local returnvalue = rcall("HGET", jobIdKey, "returnvalue")
                updateParentDepsIfNeeded(parentKey, parent['queueKey'],
                    parentDependenciesKey, parent['id'], jobIdKey, returnvalue,
                    timestamp)
            else
                if parentDependenciesKey ~= nil then
                    rcall("SADD", parentDependenciesKey, jobIdKey)
                end
            end
            rcall("HMSET", jobIdKey, "parentKey", parentKey, "parent",
                  parentData)
        end
        rcall("XADD", KEYS[8], "*", "event", "duplicated", "jobId", jobId)
        return jobId .. "" -- convert to string
    end
end
local function addToWait(opts, jobId, waitKey)
    -- LIFO or FIFO
    local pushCmd = opts['lifo'] and 'RPUSH' or 'LPUSH';
    rcall(pushCmd, waitKey, jobId)
end
-- Includes
-- Store the job.
local jsonOpts = cjson.encode(opts)
local delay = opts['delay'] or 0
local priority = opts['priority'] or 0
local optionalValues = {}
if parentKey ~= nil then
  table.insert(optionalValues, "parentKey")
  table.insert(optionalValues, parentKey)
  table.insert(optionalValues, "parent")
  table.insert(optionalValues, parentData)
end
if repeatJobKey ~= nil then
  table.insert(optionalValues, "rjk")
  table.insert(optionalValues, repeatJobKey)
end
rcall("HMSET", jobIdKey, "name", args[3], "data", ARGV[2], "opts", jsonOpts,
    "timestamp", timestamp, "delay", delay, "priority", priority, unpack(optionalValues))
-- TODO: do not send data and opts to the event added (for performance reasons).
rcall("XADD", KEYS[8], "*", "event", "added", "jobId", jobId, "name", args[3],
      "data", ARGV[2], "opts", jsonOpts)
-- Check if job is delayed
local delayedTimestamp = (delay > 0 and (timestamp + delay)) or 0
-- Check if job is a parent, if so add to the parents set
local waitChildrenKey = args[6]
if waitChildrenKey ~= nil then
    rcall("ZADD", waitChildrenKey, timestamp, jobId)
    rcall("XADD", KEYS[8], "*", "event", "waiting-children", "jobId", jobId)
elseif (delayedTimestamp ~= 0) then
    local group = opts['group']
    if group ~= nil then
        local groupId = group['id']
        rcall("HSET", jobIdKey, "gid", groupId)
    end
    local score = delayedTimestamp * 0x1000 + bit.band(jobCounter, 0xfff)
    rcall("ZADD", KEYS[5], score, jobId)
    rcall("XADD", KEYS[8], "*", "event", "delayed", "jobId", jobId, "delay",
          delayedTimestamp)
    -- If wait list is empty, and this delayed job is the next one to be processed,
    -- then we need to signal the workers by adding a dummy job (jobId 0:delay) to the wait list.
    local target = getTargetQueueList(KEYS[3], KEYS[1], KEYS[2])
    addDelayMarkerIfNeeded(target, KEYS[5])
else
    local target = getTargetQueueList(KEYS[3], KEYS[1], KEYS[2])
    -- Standard or priority add
    if priority == 0 then
        -- Groups
        local group = opts['group']
        if group ~= nil then
            local groupId = group['id']
            rcall("HSET", jobIdKey, "gid", groupId)
            addToGroup(opts['lifo'], prefixKey, groupId, jobId, target, timestamp)
        else
            addToWait(opts, jobId, target)
        end
    else
        -- Priority add
        addJobWithPriority(KEYS[6], priority, target, jobId)
    end
    -- Emit waiting event
    rcall("XADD", KEYS[8], "*", "event", "waiting", "jobId", jobId)
end
-- Check if this job is a child of another job, if so add it to the parents dependencies
-- TODO: Should not be possible to add a child job to a parent that is not in the "waiting-children" status.
-- fail in this case.
if parentDependenciesKey ~= nil then
    rcall("SADD", parentDependenciesKey, jobIdKey)
end
return jobId .. "" -- convert to string
`;
export const addJob = {
    name: 'addJob',
    content,
    keys: 8,
};
//# sourceMappingURL=addJob-8.js.map