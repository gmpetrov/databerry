--[[
  If the wait list is empty we need to move a job from the
  promoted group to wait (so that we always have a job in wait).
]]

--- @include "reinsertGroup"
local function moveJobToWaitFromGroup(prefixKey, waitKey, groupsKey, groupKey, groupId)
  if rcall("LLEN", waitKey) == 0 then
    local jobId = rcall("RPOPLPUSH", groupKey, waitKey)
    if jobId then
      rcall("SET", prefixKey .. 'groups-lid', groupId)
    end
  end

  reinsertGroup(groupKey, groupsKey, groupId)
end
