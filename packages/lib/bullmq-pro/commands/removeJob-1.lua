--[[
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
--- @include "<base>/includes/destructureJobKey"
--- @include "<base>/includes/isLocked"
--- @include "<base>/includes/removeParentDependencyKey"
--- @include "includes/removeJobFromAnyStateOrGroup"

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
