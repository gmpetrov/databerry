
local function increaseGroupConcurrency(groupsKey, groupId, maxConcurrency, timestamp)
  local count = rcall("HINCRBY", prefixKey .. 'groups:active:count', groupId, 1)
  if count >= maxConcurrency then
    rcall("ZADD", prefixKey .. 'groups:max', timestamp, groupId)
    rcall("ZREM", groupsKey, groupId)
    return true
  end
end
