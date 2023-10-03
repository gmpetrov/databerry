--[[
  Delete possible group job in the wait list
  Note: If the implementation of groups is correct,
  the job can only exist at the head of the wait list.
]]

-- Includes
--- @include "<base>/includes/removeJob"

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
