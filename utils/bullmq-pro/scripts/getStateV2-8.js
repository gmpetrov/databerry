const content = `--[[
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
if redis.call("LPOS", KEYS[4] , ARGV[1]) ~= false then
  return "active"
end
if redis.call("LPOS", KEYS[5] , ARGV[1]) ~= false then
  return "waiting"
end
if redis.call("LPOS", KEYS[6] , ARGV[1]) ~= false then
  return "waiting"
end
if redis.call("ZSCORE", KEYS[7] , ARGV[1]) ~= false then
  return "waiting-children"
end
local groupId = redis.call("HGET", KEYS[8] .. ARGV[1], "gid")
if groupId then
  local groupKey = KEYS[8] .. 'groups:' .. groupId
  if redis.call("LPOS", groupKey , ARGV[1]) ~= false then
    return "waiting"
  end
end
return "unknown"
`;
export const getStateV2 = {
    name: 'getStateV2',
    content,
    keys: 8,
};
//# sourceMappingURL=getStateV2-8.js.map