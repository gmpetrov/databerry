const content = `--[[
  Get count of jobs belonging to a given group.
  Input:
      KEYS[1] groupkey
      KEYS[2] waitkey
      -- Arguments
      ARGV[1] key prefix
      ARGV[2] group id
]]
local rcall = redis.call
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
return getGroupCount(KEYS[1], KEYS[2], ARGV[2], ARGV[1])
`;
export const getGroupCount = {
    name: 'getGroupCount',
    content,
    keys: 2,
};
//# sourceMappingURL=getGroupCount-2.js.map