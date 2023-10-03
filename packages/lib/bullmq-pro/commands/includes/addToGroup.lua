--- @include "setGroupRateLimitedIfNeeded"
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
