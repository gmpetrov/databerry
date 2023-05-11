local function rateLimitGroup(prefixKey, groupId, maxRate, rateDuration,
                              timestamp)
    if maxRate then
        local groupsKey = prefixKey .. 'groups'
        local groupKey = groupsKey .. ':' .. groupId
        local groupRateLimitKey = groupKey .. ':limit'

        -- Update limit key for this group, if rate-limited move the group to the rate limited zset
        local jobCounter = tonumber(rcall("INCR", groupRateLimitKey))
        if jobCounter == 1 then
            rcall("PEXPIRE", groupRateLimitKey, rateDuration)
        end

        -- -- check if rate limit hit
        if jobCounter >= maxRate then
            -- Since this group is rate limited, remove it from the groupsKey and
            -- add it to the limit set.
            rcall("ZREM", groupsKey, groupId)

            -- However, we should only add to the limited set groups that are not
            -- empty!
            if rcall("LLEN", groupKey) > 0 then
                local groupsRateLimitKey = prefixKey .. 'groups:limit'
                local nextTimestamp = timestamp + rateDuration
                rcall("ZADD", groupsRateLimitKey, nextTimestamp, groupId)
            end
            return true
        end
    end
    return false
end

-- TODO: We are missing the fact that if we get rate limited in "moveToActive" or "moveToFinished" we need
-- to also return the next TTL, so basically taking the min(promoted-TTL, newRateLimitedTTL)
