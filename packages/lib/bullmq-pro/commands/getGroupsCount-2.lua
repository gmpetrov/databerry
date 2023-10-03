--[[
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

--- @include "includes/getGroupCount"

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
