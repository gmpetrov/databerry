const content = `--[[
  Get jobs count belonging to all groups. Since there could be thousands of
  groups, this call can be made iteratively.
  Input:
      KEYS[1] groupskey
      KEYS[2] waitkey
      -- Arguments
      ARGV[1] key prefix
      ARGV[2] start
      ARGV[3] end
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
local count = 0
local groupIds = rcall("ZRANGE", KEYS[1], ARGV[2], ARGV[3]);
if #groupIds > 0 then
    for i, groupId in ipairs(groupIds) do
        local groupKey = KEYS[1] .. ":" .. groupId
        count = count + getGroupCount(groupKey, KEYS[2], groupId, ARGV[1])
    end
    return count
else
    return nil
end
`;
export const getGroupsCount = {
    name: 'getGroupsCount',
    content,
    keys: 2,
};
//# sourceMappingURL=getGroupsCount-2.js.map