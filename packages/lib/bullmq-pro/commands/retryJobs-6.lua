--[[
  Attempts to retry all failed jobs

  Input:
    KEYS[1] base key
    KEYS[2] events stream
    KEYS[3] state key (failed, completed)
    KEYS[4] 'wait'
    KEYS[5] 'paused'
    KEYS[6] 'meta'

    ARGV[1] count
    ARGV[2] timestamp
    ARGV[3] prev state

  Output:
    1  means the operation is not completed
    0  means the operation is completed
]]
local maxCount = tonumber(ARGV[1])
local timestamp = tonumber(ARGV[2])

local rcall = redis.call;

-- Includes
--- @include "includes/reinsertGroup"
--- @include "includes/setGroupRateLimitedIfNeeded"
--- @include "<base>/includes/batches"
--- @include "<base>/includes/getTargetQueueList"

local function batchAddToGroup(prefixKey, groupId, jobsTable, waitKey, timestamp)
  local groupKey = prefixKey .. 'groups:' .. groupId
  for from, to in batches(#jobsTable, 7000) do
    rcall("LPUSH", groupKey, unpack(jobsTable, from, to))
  end

  --if group is paused we do not need to check for rate limit
  if rcall("ZSCORE", prefixKey .. 'groups:paused', groupId) ~= false then
    return
  else
    -- Has this group reached maximum concurrency?
    local hasReachedMaxConcurrency = rcall("ZSCORE", prefixKey .. 'groups:max', groupId) ~= false

    -- Is group rate limited?
    local groupRateLimitKey = groupKey .. ':limit'
    local ttl = tonumber(rcall("PTTL", groupRateLimitKey))
    local isRateLimited = ttl > 0

    local waitLen = rcall("LLEN", waitKey)
    
    if hasReachedMaxConcurrency or isRateLimited or waitLen > 0 then
      -- First item in a group, we need to add this groupId to the groupsIds zset
      -- or if rate limited to the groups rate limited zset.
      if not hasReachedMaxConcurrency then
        setGroupRateLimitedIfNeeded(prefixKey, groupId, isRateLimited, timestamp, ttl)
      end
    else
      local groupsKey = prefixKey .. 'groups'
      -- Perform standard add (and store this job's group id)
      rcall("SET", prefixKey .. 'groups-lid', groupId)
      rcall("RPOPLPUSH", groupKey, waitKey)
      reinsertGroup(groupKey, groupsKey, groupId)
    end
  end
end

local target = getTargetQueueList(KEYS[6], KEYS[4], KEYS[5])

local jobs = rcall('ZRANGEBYSCORE', KEYS[3], 0, timestamp, 'LIMIT', 0, maxCount)
if (#jobs > 0) then
  local nonGroupJobs = {}
  local groupJobs = {}
  for i, key in ipairs(jobs) do
    local jobKey = KEYS[1] .. key
    rcall("HDEL", jobKey, "finishedOn", "processedOn", "failedReason", "returnvalue")
    local groupId = rcall("HGET", jobKey, "gid")

    if groupId ~= false then
      if groupJobs[groupId] == nil then
        groupJobs[groupId] = {}
      end
      table.insert(groupJobs[groupId], key)
    else
      table.insert(nonGroupJobs, key)
    end

    -- Emit waiting event
    rcall("XADD", KEYS[2], "*", "event", "waiting", "jobId", key, "prev", ARGV[3]);
  end

  if #jobs == #nonGroupJobs then
    for from, to in batches(#jobs, 7000) do
      rcall("ZREM", KEYS[3], unpack(jobs, from, to))
      rcall("LPUSH", target, unpack(jobs, from, to))
    end
  else
    for from, to in batches(#jobs, 7000) do
      rcall("ZREM", KEYS[3], unpack(jobs, from, to))
    end

    for groupId, jobsTable in pairs(groupJobs) do
      batchAddToGroup(KEYS[1], groupId, jobsTable, target, timestamp)
    end

    for from, to in batches(#nonGroupJobs, 7000) do
      rcall("LPUSH", target, unpack(nonGroupJobs, from, to))
    end
  end
end

maxCount = maxCount - #jobs

if(maxCount <= 0) then
  return 1
end

return 0
