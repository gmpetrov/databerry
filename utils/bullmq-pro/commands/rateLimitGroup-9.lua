--[[
  Function to dynamically rate limit a group.
  Note:
  This function is designed to be called from inside a worker processor
  when a job is being processed and the group it belongs to must be rate limited.

  Input:
    KEYS[1] active key    
    KEYS[2] stalled key
    KEYS[3] job lock key

    KEYS[4] group key
    KEYS[5] group rate limit key
    KEYS[6] group paused key
    KEYS[7] groupsKey
    KEYS[8] groupsRateLimitKey
    KEYS[9] wait key

    ARGV[1] job id
    ARGV[2] expirationTimeMs
    ARGV[3] timestamp
    ARGV[4] group id
    ARGV[5] prefix key
]]
local rcall = redis.call

--- @include "includes/prefetchNextGroupJob"
--- @include "includes/decreaseGroupConcurrency"

local groupId = ARGV[4]
local groupKey = KEYS[4]
local groupsKey = KEYS[7]

-- If group is paused we just return without doing anything.
if (rcall("ZSCORE", KEYS[6], groupId) ~= false) then
    return
else
    -- Move job back to the group it belongs to
    local jobId = ARGV[1]
    local removed = rcall("LREM", KEYS[1], 1, jobId)
    if (removed > 0) then
        -- Update the max key for the group
        -- We can use max concurrency 99999 because by definition, if we decrease the concurrency
        -- we will stop being maxed out.
        decreaseGroupConcurrency(ARGV[5], groupId, 99999)

        -- Mark this group has being rate limited.
        local expirationTimeMs = tonumber(ARGV[2])
        local timestamp = tonumber(ARGV[3])
        local nextTimestamp = timestamp + expirationTimeMs
        local groupRateLimitKey = KEYS[5]

        -- Set the rate limit key for the group
        rcall("SET", groupRateLimitKey, 1, "PX", ARGV[2])

        -- Since this group is rate limited, remove it from the groupsKey and
        -- add it to the limit set.
        rcall("ZREM", groupsKey, groupId)
        local groupsRateLimitKey = KEYS[8]
        rcall("ZADD", groupsRateLimitKey, nextTimestamp, groupId)

        -- Check if there is a job in the wait queue belonging to this group
        -- and if so move it back to the group.
        local waitKey = KEYS[9]
        local waitLen = rcall("LLEN", waitKey)
        if (waitLen > 0) then
            local prefixKey = ARGV[5]
            local waitJobId = rcall("LINDEX", waitKey, -1)
            local jobKey = prefixKey .. waitJobId
            local waitJobGroupId = rcall("HGET", jobKey, "gid")
            if (waitJobGroupId == groupId) then
                rcall("RPOP", waitKey)
                rcall("RPUSH", groupKey, waitJobId)

                -- Since we removed the job from the active queue we need to
                -- promote a another job from another group.
                prefetchNextGroupJob(prefixKey, groupsKey, waitKey)
            end
        end

        local stalledKey = KEYS[2]
        local stalledKeyType = rcall("TYPE", stalledKey)
        if stalledKeyType["ok"] == "set" then
            rcall("SREM", stalledKey , jobId)
        else
            rcall("ZREM", stalledKey, jobId)
        end
        rcall("RPUSH", groupKey, jobId);
        rcall("DEL", KEYS[3])
    end
end
