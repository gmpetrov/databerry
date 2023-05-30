--[[
    If there is no jobId in the wait list we will see if we can fetch a job from any of
    the groups.

    The "groupsKey" is a ZSET holding the group ids. An entry in the ZSET guarantees that there
    is a non empty list for that group (we must keep this guarantee at all times [1]).
    
    After getting the next jobId from the next group (the one with lowest score in the "groupsKey"),
    we need to check if we need to "reinsert" that group with the highest score. It is reinserted
    only if there are any other jobs left for that group, otherwise it is discarded
    (so that we can guarantee [1]).

    If the wait list is empty, since we always need to have 1 job in the wait list *if* there are group jobs
    in any of the groups (so that our blocking workers will pick the next job automatically),
    we try to get the next job from lowest scored group.
]]

--- @include "reinsertGroup"
local function prefetchNextGroupJob(prefixKey, groupsKey, waitKey,
                                         timestamp)
    if rcall("LLEN", waitKey) == 0 then
        -- TODO: Investigate if we should not promote rate limited groups here as well.

        -- Try to move the next grouped job to wait list
        local groupIds = rcall("ZPOPMIN", groupsKey)
        if #groupIds > 0 then
            local groupsLastIdKey = prefixKey .. 'groups-lid'
            local lastGroupId = rcall("GET", groupsLastIdKey)
            local groupId = groupIds[1]
            local groupKey = groupsKey .. ':' .. groupId

            local numGroups = rcall("ZCARD", groupsKey)
            if lastGroupId ~= groupId or numGroups == 1 then
                local jobId = rcall("RPOPLPUSH", groupKey, waitKey)
                reinsertGroup(groupKey, groupsKey, groupId)
                rcall("SET", groupsLastIdKey, groupId)
            else
                reinsertGroup(groupKey, groupsKey, groupId)

                -- we take next group's job to avoid repeating last group
                local groupIds = rcall("ZPOPMIN", groupsKey)
                if #groupIds > 0 then
                    local groupId = groupIds[1]
                    local groupKey = groupsKey .. ':' .. groupId
                    rcall("RPOPLPUSH", groupKey, waitKey)
                    reinsertGroup(groupKey, groupsKey, groupId)
                    rcall("SET", groupsLastIdKey, groupId)
                end
            end
        end
    end
end
