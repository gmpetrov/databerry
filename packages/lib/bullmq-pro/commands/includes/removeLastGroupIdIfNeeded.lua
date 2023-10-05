--[[
  Function to remove last group id if needed.
  It will reinsert a group from groups zset
]]

--- @include "reinsertGroup"

local function removeLastGroupIdIfNeeded( groupsKey, lgidKey, currentGroupId)
  if rcall("GET", lgidKey) == currentGroupId then
    local groupIds = rcall("ZPOPMIN", groupsKey)
    if #groupIds > 0 then
      local groupId = groupIds[1]
      local groupKey = groupsKey .. ':' .. groupId
      reinsertGroup(groupKey, groupsKey, groupId)
      rcall("SET", lgidKey, groupId)
    else
      rcall("DEL", lgidKey)
    end
  end
end
