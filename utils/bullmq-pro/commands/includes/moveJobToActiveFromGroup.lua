--- @include "increaseGroupConcurrency"
--- @include "rateLimitGroup"
--- @include "reinsertGroup"

local function moveJobToActiveFromGroup(prefixKey, activeKey, groupMaxConcurrency,
    groupLimit, groupLimitDuration, timestamp)
    local groupsKey = prefixKey .. 'groups'
    local jobId

    -- Try to fetch next group's jobs
    local groupIds = rcall("ZPOPMIN", groupsKey)
    if #groupIds > 0 then
        local groupId = groupIds[1]
        local groupKey = groupsKey .. ':' .. groupId
        jobId = rcall("RPOPLPUSH", groupKey, activeKey)

        -- Handle maxGroupConcurrency
        if groupMaxConcurrency then
            if increaseGroupConcurrency(groupsKey, groupId, groupMaxConcurrency, timestamp) then
                return jobId
            end
        end

        if groupLimit then
            if rateLimitGroup(prefixKey, groupId, groupLimit, groupLimitDuration, timestamp) then
                return jobId
            end
        end

        reinsertGroup(groupKey, groupsKey, groupId)
    end

    return jobId
end
