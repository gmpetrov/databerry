--[[
  Function to remove from any state.

  returns:
    prev state
]]

-- Includes
--- @include "<base>/includes/removeJobFromAnyState"
--- @include "removeLastGroupIdIfNeeded"

local function removeJobFromAnyStateOrGroup( prefix, jobId, groupId)
  local state = removeJobFromAnyState(prefix, jobId)
  if groupId ~= false and  state == "unknown" then
    local groupKey = prefix .. "groups:" .. groupId
    if rcall("LREM", groupKey, 0, jobId) == 1 then
      local groupLen = rcall("LLEN", groupKey)
      local groupsKey = prefix .. "groups"
      if groupLen == 0 then
        rcall("ZREM", groupKey, groupId)
      end
      removeLastGroupIdIfNeeded(groupsKey, prefix .. "groups-lid", groupId)
      if rcall("ZSCORE", prefix .. "groups:paused", groupId) ~= false then
        return "paused"
      else
        return "wait"
      end
    end
  end

  return state
end
