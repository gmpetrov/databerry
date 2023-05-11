const content = `--[[
  Get groups by key, including each group's jobs count.
  This command supports pagination.
  Input:
      KEYS[1] groupskey
      -- Arguments
      ARGV[1] prefix
      ARGV[2] start
      ARGV[3] end (special end value -1 is accepted meaning all groups)
]]
local rcall = redis.call
local prefix = ARGV[1]
local startPos = tonumber(ARGV[2])
local endPos = tonumber(ARGV[3])
local mainGroupsCount = rcall("ZCARD", KEYS[1])
-- Note, we do not need to consider the case where a group only has one job in the wait status,
-- we will consider this edge case as if that group does not exist anymore.
local groupIds = rcall("ZRANGE", KEYS[1], startPos, endPos)
local counts = {}
if #groupIds > 0 then
    for i, groupId in ipairs(groupIds) do
        local groupKey = prefix .. ":" .. groupId
        counts[i] = rcall("LLEN", groupKey)
    end
    return {groupIds, counts}
else
    return {}
end
`;
export const getGroupsByKey = {
    name: 'getGroupsByKey',
    content,
    keys: 1,
};
//# sourceMappingURL=getGroupsByKey-1.js.map