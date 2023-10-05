-- Promote a rate-limited group (if any) so that it is not rate limited anymore

--- @include "moveJobToWaitFromGroup"
local function promoteRateLimitedGroups(prefixKey, waitKey, timestamp)
    local groupsRateLimitKey = prefixKey .. 'groups:limit'
    local groupIds = rcall("ZPOPMIN", groupsRateLimitKey)
    if #groupIds > 0 then
        -- Is the group really limited?
        local groupRateLimitKey = prefixKey .. 'groups:' .. groupIds[1] .. ':limit'
        local ttl = tonumber(rcall("PTTL", groupRateLimitKey))

        local groupId = groupIds[1]

        if ttl <= 0 then
            -- remove the key manually if ttl is zero to avoid side effects.
            if ttl == 0 then rcall("DEL", groupRateLimitKey) end

            local groupsKey = prefixKey .. 'groups'

            if rcall("ZSCORE", groupsKey .. ':paused', groupId) == false then
                -- Group is not rate limited anymore so we promote it
                local groupKey = groupsKey .. ':' .. groupId

                moveJobToWaitFromGroup(prefixKey, waitKey, groupsKey, groupKey, groupId)
            end
        else
            -- Group is still rate limited, re-add with new score
            local nextTimestamp = timestamp + ttl
            rcall("ZADD", groupsRateLimitKey, nextTimestamp, groupId)
            return nextTimestamp
        end
    end
end
