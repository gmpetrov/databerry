--[[
  Get count jobs belonging to a given group.
]]

local function getGroupCount(groupKey, waitKey, groupId, prefixKey)
    local count = rcall("LLEN", groupKey)

    -- Possibly get a grouped job in the waiting list
    local waitingJob = rcall("LRANGE", waitKey, -1, -1)
    if #waitingJob > 0 then
        local waitingJobId = waitingJob[1]
        local waitingJobKey = prefixKey .. waitingJob[1]
        local optsJson = rcall("HGET", waitingJobKey, "opts")
        local opts = cjson.decode(optsJson)

        if opts['group'] ~= nil and 
            ((opts['group']['id'] == groupId) or (opts['group']['id'] == tonumber(groupId))) then
            count = count + 1
        end
    end

    return count
end
