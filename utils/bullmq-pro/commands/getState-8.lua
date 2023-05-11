--[[
  Get a job state

  Input: 
    KEYS[1] 'completed' key,
    KEYS[2] 'failed' key
    KEYS[3] 'delayed' key
    KEYS[4] 'active' key
    KEYS[5] 'wait' key
    KEYS[6] 'paused' key
    KEYS[7] 'waiting-children' key
    KEYS[8] keys prefix

    ARGV[1] job id
  Output:
    'completed'
    'failed'
    'delayed'
    'active'
    'waiting'
    'waiting-children'
    'unknown'
]]
if redis.call("ZSCORE", KEYS[1], ARGV[1]) ~= false then
  return "completed"
end

if redis.call("ZSCORE", KEYS[2], ARGV[1]) ~= false then
  return "failed"
end

if redis.call("ZSCORE", KEYS[3], ARGV[1]) ~= false then
  return "delayed"
end

-- Includes
--- @include "<base>/includes/checkItemInList"

local active_items = redis.call("LRANGE", KEYS[4] , 0, -1)
if checkItemInList(active_items, ARGV[1]) ~= nil then
  return "active"
end

local wait_items = redis.call("LRANGE", KEYS[5] , 0, -1)
if checkItemInList(wait_items, ARGV[1]) ~= nil then
  return "waiting"
end

local paused_items = redis.call("LRANGE", KEYS[6] , 0, -1)
if checkItemInList(paused_items, ARGV[1]) ~= nil then
  return "waiting"
end

if redis.call("ZSCORE", KEYS[7], ARGV[1]) ~= false then
  return "waiting-children"
end

local groupId = redis.call("HGET", KEYS[8] .. ARGV[1], "gid")
if groupId then
  local groupKey = KEYS[8] .. 'groups:' .. groupId

  local group_items = redis.call("LRANGE", groupKey , 0, -1)
  if checkItemInList(group_items, ARGV[1]) ~= nil then
    return "waiting"
  end
end

return "unknown"
