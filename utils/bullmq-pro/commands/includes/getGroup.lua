--[[
  Get jobs belonging to a given group.
]]

local function getGroup(groupKey, waitKey, groupId, prefixKey, start, endIndex)
    endIndex = tonumber(endIndex)
    local jobIds = rcall("LRANGE", groupKey, start, endIndex)

    -- Possibly get a grouped job in the waiting list
    if endIndex == -1 or endIndex >= rcall("LLEN", groupKey) then
        local waitingJob = rcall("LRANGE", waitKey, -1, -1)
        if #waitingJob > 0 then
            local waitingJobId = waitingJob[1]
            local waitingJobKey = prefixKey .. waitingJob[1]
            local optsJson = rcall("HGET", waitingJobKey, "opts")
            local opts = cjson.decode(optsJson)

            if opts['group'] ~= nil and 
               ((opts['group']['id'] == groupId) or (opts['group']['id'] == tonumber(groupId))) then
                table.insert(jobIds, waitingJobId)
            end
        end
    end

    return jobIds
end
