--[[
  Delete all groups and their jobs up to the given limit.

  Returns true when all groups have been deleted.
]]

-- Includes
--- @include "<base>/includes/removeJob"
--- @include "deletePossibleGroupJobInWait"

local function deleteGroup(groupsSetKey, groupKey, waitKey, groupId, prefixKey, limit, score)
  local jobIds = rcall("LRANGE", groupKey, 0, limit - 1)
  rcall("LTRIM", groupKey, limit, -1)

  if (#jobIds > 0) then
    for i, jobId in ipairs(jobIds) do
      removeJob(jobId, true, prefixKey)
    end 

    local jobsLeft = rcall("LLEN", groupKey)
    if jobsLeft == 0 then
      deletePossibleGroupJobInWait(waitKey, prefixKey, groupId)
    else
      rcall("ZADD", groupsSetKey, score, groupId)
    end
    return #jobIds, jobsLeft
  end
  return 0, 0
end

local function deleteGroupInSet(groupsSetKey, waitKey, prefixKey, limit)
  local currentGroup = rcall("ZPOPMIN", groupsSetKey)
  local currentLimit = limit
  if currentGroup[1] ~= nil then
    local groupKey = prefixKey .. 'groups:' .. currentGroup[1]
    local removedJobs, jobsLeft = deleteGroup(groupsSetKey, groupKey, waitKey,
      currentGroup[1], prefixKey, limit, currentGroup[2])
    currentLimit = currentLimit - removedJobs
  end

  return currentGroup[1], currentLimit
end

local function deleteGroups(groupsKey, waitKey, prefixKey, limit)
  local groupId
  repeat
    groupId, limit =  deleteGroupInSet(groupsKey, waitKey, prefixKey, limit)
  until groupId == nil or limit <= 0

  local groupsRateLimitKey = groupsKey .. ':limit'

  if groupId == nil and limit > 0 then
    repeat
      groupId, limit =  deleteGroupInSet(groupsRateLimitKey, waitKey, prefixKey, limit)
    until groupId == nil or limit <= 0
  end

  local groupsMaxConcurrencyKey = groupsKey .. ':max'

  if groupId == nil and limit > 0 then
    repeat
      groupId, limit =  deleteGroupInSet(groupsMaxConcurrencyKey, waitKey, prefixKey, limit)
    until groupId == nil or limit <= 0
  end

  local groupsPausedKey = groupsKey .. ':paused'

  if groupId == nil and limit > 0 then
    repeat
      groupId, limit =  deleteGroupInSet(groupsPausedKey, waitKey, prefixKey, limit)
    until groupId == nil or limit <= 0
  end

  return groupId == nil
end
