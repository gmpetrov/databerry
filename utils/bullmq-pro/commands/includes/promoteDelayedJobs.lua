--[[
  Updates the delay set, by moving delayed jobs that should
  be processed now to "wait".

    Events:
      'waiting'
]]
local rcall = redis.call

-- Includes
--- @include "<base>/includes/addJobWithPriority"
--- @include "<base>/includes/getTargetQueueList"
--- @include "addToGroup"

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
