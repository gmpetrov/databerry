--[[
  Delete jobs belonging to a given group.
]]

-- Includes
--- @include "<base>/includes/removeJob"
--- @include "deletePossibleGroupJobInWait"

local function deleteGroup(groupsKey, groupKey, waitKey, groupId, prefixKey, limit)
  local jobIds = rcall("LRANGE", groupKey, 0, limit - 1)
  rcall("LTRIM", groupKey, limit, -1)

  if (#jobIds > 0) then
    for i, jobId in ipairs(jobIds) do
      removeJob(jobId, true, prefixKey)
    end 

    local jobsLeft = rcall("LLEN", groupKey)
    if jobsLeft == 0 then
      local groupsRateLimitKey = groupsKey .. ':limit'
      local groupsMaxConcurrencyKey = groupsKey .. ':max'
      local groupsPausedKey = groupsKey .. ':paused'

      rcall("ZREM", groupsKey, groupId)
      rcall("ZREM", groupsRateLimitKey, groupId)
      rcall("ZREM", groupsMaxConcurrencyKey, groupId)
      rcall("ZREM", groupsPausedKey, groupId)

      deletePossibleGroupJobInWait(waitKey, prefixKey, groupId)
    end
    return #jobIds, jobsLeft
  end
  return 0, 0
end
