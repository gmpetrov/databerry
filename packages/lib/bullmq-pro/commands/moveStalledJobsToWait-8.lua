--[[
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
--- @include "<base>/includes/batches"
--- @include "<base>/includes/getTargetQueueList"
--- @include "<base>/includes/removeJob"
--- @include "<base>/includes/removeJobsByMaxAge"
--- @include "<base>/includes/removeJobsByMaxCount"
--- @include "<base>/includes/trimEvents"
--- @include "includes/addToGroup"
--- @include "includes/decreaseGroupConcurrency"

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
