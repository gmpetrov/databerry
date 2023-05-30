--[[
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
--- @include "includes/addToGroup"
--- @include "<base>/includes/addJobWithPriority"
--- @include "<base>/includes/getTargetQueueList"

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
