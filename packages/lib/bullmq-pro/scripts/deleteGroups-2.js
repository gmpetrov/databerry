const content = `--[[
  Delete jobs belonging to a given group.
  Input:
      KEYS[1] groupsKey
      KEYS[2] waitkey
      -- Arguments
      ARGV[1] key prefix
      ARGV[2] limit amount of jobs to delete
]]
local rcall = redis.call
--[[
  Delete all groups and their jobs up to the given limit.
  Returns true when all groups have been deleted.
]]
-- Includes
--[[
  Function to remove job.
]]
-- Includes
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, waitKey, pausedKey)
  if rcall("HEXISTS", queueMetaKey, "paused") ~= 1 then
    return waitKey
  else
    return pausedKey
  end
end
local function moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "wait", parentPrefix .. "paused")
  rcall("RPUSH", parentTarget, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey)
              rcall("DEL", parentKey, parentKey .. ':logs',
                parentKey .. ':dependencies', parentKey .. ':processed')
            else
              moveParentToWait(parentPrefix, parentId)
            end
          else
            moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
    end
  else
    local missedParentKey = rcall("HGET", jobKey, "parentKey")
    if( (type(missedParentKey) == "string") and missedParentKey ~= "" and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey)
                rcall("DEL", missedParentKey, missedParentKey .. ':logs',
                  missedParentKey .. ':dependencies', missedParentKey .. ':processed')
              else
                moveParentToWait(parentPrefix, parentId)
              end
            else
              moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
      end
    end
  end
end
local function removeJob(jobId, hard, baseKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  rcall("DEL", jobKey, jobKey .. ':logs',
    jobKey .. ':dependencies', jobKey .. ':processed')
end
--[[
  Delete possible group job in the wait list
  Note: If the implementation of groups is correct,
  the job can only exist at the head of the wait list.
]]
-- Includes
local function deletePossibleGroupJobInWait(waitKey, prefixKey, groupId)
  local waitingJob = rcall("LRANGE", waitKey, -1, -1)
  if #waitingJob > 0 then
    local waitingJobKey = prefixKey .. waitingJob[1]
    local currentGroupId = rcall("HGET", waitingJobKey, "gid")
    if currentGroupId ~= false and currentGroupId == groupId then 
      removeJob(waitingJob[1], true, prefixKey)
      rcall("RPOP", waitKey)
    end
  end
end
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
return deleteGroups(KEYS[1], KEYS[2], ARGV[1], tonumber(ARGV[2]))
`;
export const deleteGroups = {
    name: 'deleteGroups',
    content,
    keys: 2,
};
//# sourceMappingURL=deleteGroups-2.js.map