const content = `--[[
    Remove a job from all the queues it may be in as well as all its data.
    In order to be able to remove a job, it cannot be active.
    Input:
      KEYS[1] queue prefix
      ARGV[1] jobId
    Events:
      'removed'
]]
local rcall = redis.call
-- Includes
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
  Function to recursively check if there are no locks
  on the jobs to be removed.
  returns:
    boolean
]]
local function isLocked( prefix, jobId)
  local jobKey = prefix .. jobId;
  -- Check if this job is locked
  local lockKey = jobKey .. ':lock'
  local lock = rcall("GET", lockKey)
  if not lock then
    local dependencies = rcall("SMEMBERS", jobKey .. ":dependencies")
    if (#dependencies > 0) then
      for i, childJobKey in ipairs(dependencies) do
        -- We need to get the jobId for this job.
        local childJobId = getJobIdFromKey(childJobKey)
        local childJobPrefix = getJobKeyPrefix(childJobKey, childJobId)
        local result = isLocked( childJobPrefix, childJobId )
        if result then
          return true
        end
      end
    end
    return false
  end
  return true
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
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
--[[
  Function to remove from any state.
  returns:
    prev state
]]
-- Includes
--[[
  Function to remove from any state.
  returns:
    prev state
]]
local function removeJobFromAnyState( prefix, jobId)
  -- We start with the ZSCORE checks, since they have O(1) complexity
  if rcall("ZSCORE", prefix .. "completed", jobId) then
    rcall("ZREM", prefix .. "completed", jobId)
    return "completed"
  elseif rcall("ZSCORE", prefix .. "waiting-children", jobId) then
    rcall("ZREM", prefix .. "waiting-children", jobId)
    return "waiting-children"
  elseif rcall("ZSCORE", prefix .. "delayed", jobId) then
    rcall("ZREM", prefix .. "delayed", jobId)
    return "delayed"
  elseif rcall("ZSCORE", prefix .. "failed", jobId) then
    rcall("ZREM", prefix .. "failed", jobId)
    return "failed"
  -- We remove only 1 element from the list, since we assume they are not added multiple times
  elseif rcall("LREM", prefix .. "wait", 1, jobId) == 1 then
    return "wait"
  elseif rcall("LREM", prefix .. "paused", 1, jobId) == 1 then
    return "paused"
  elseif rcall("LREM", prefix .. "active", 1, jobId) == 1 then
    return "active"
  end
  return "unknown"
end
--[[
  Function to remove last group id if needed.
  It will reinsert a group from groups zset
]]
-- Reinsert the group with the highest score so that it is moved to the last position
local function reinsertGroup(groupKey, groupsKey, groupId)
  if rcall("LLEN", groupKey) > 0 then
    local highscore = rcall("ZREVRANGE", groupsKey, 0, 0, "withscores")[2] or 0
    -- Note, this mechanism could keep increasing the score indefinetely.
    -- Score can represent 2^53 integers, so approximatelly 285 years adding 1M jobs/second
    -- before it starts misbehaving.
    rcall("ZADD", groupsKey, highscore + 1, groupId)
  end
end
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
local function removeJob( prefix, jobId, parentKey, groupId)
    local jobKey = prefix .. jobId;
    removeParentDependencyKey(jobKey, false, parentKey)
    -- Check if this job has children
    -- If so, we are going to try to remove the children recursively in deep first way because
    -- if some job is locked we must exit with and error.
    local processed = rcall("HGETALL", jobKey .. ":processed")
    if (#processed > 0) then
        for i = 1, #processed, 2 do
            local childJobId = getJobIdFromKey(processed[i])
            local childJobPrefix = getJobKeyPrefix(processed[i], childJobId)
            local childGroupId = rcall("HGET", processed[i], "gid")
            removeJob( childJobPrefix, childJobId, jobKey, childGroupId )
        end
    end
    local dependencies = rcall("SMEMBERS", jobKey .. ":dependencies")
    if (#dependencies > 0) then
        for i, childJobKey in ipairs(dependencies) do
            -- We need to get the jobId for this job.
            local childJobId = getJobIdFromKey(childJobKey)
            local childJobPrefix = getJobKeyPrefix(childJobKey, childJobId)
            local childGroupId = rcall("HGET", childJobKey, "gid")
            removeJob( childJobPrefix, childJobId, jobKey, childGroupId )
        end
    end
    local prev = removeJobFromAnyStateOrGroup(prefix, jobId, groupId)
    rcall("ZREM", prefix .. "priority", jobId)
    rcall("DEL", jobKey, jobKey .. ":logs", jobKey .. ":dependencies", jobKey .. ":processed")
    rcall("XADD", prefix .. "events", "*", "event", "removed", "jobId", jobId, "prev", prev);
end
local prefix = KEYS[1]
if not isLocked(prefix, ARGV[1]) then
    local groupId = rcall("HGET", prefix .. ARGV[1], "gid")
    removeJob(prefix, ARGV[1], nil, groupId)
    return 1
end
return 0
`;
export const removeJob = {
    name: 'removeJob',
    content,
    keys: 1,
};
//# sourceMappingURL=removeJob-1.js.map