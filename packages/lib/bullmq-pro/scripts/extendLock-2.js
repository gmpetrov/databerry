const content = `--[[
  Extend lock and removes the job from the stalled set.
  Input:
    KEYS[1] 'lock',
    KEYS[2] 'stalled'
    ARGV[1]  token
    ARGV[2]  lock duration in milliseconds
    ARGV[3]  jobid
  Output:
    "1" if lock extented succesfully.
]]
local rcall = redis.call
if rcall("GET", KEYS[1]) == ARGV[1] then
  --   if rcall("SET", KEYS[1], ARGV[1], "PX", ARGV[2], "XX") then
  if rcall("SET", KEYS[1], ARGV[1], "PX", ARGV[2]) then
    local stalledKeyType = rcall("TYPE", KEYS[2])
    if stalledKeyType["ok"] == "set" then
      rcall("SREM", KEYS[2], ARGV[3])
    else
      rcall("ZREM", KEYS[2], ARGV[3])
    end
    return 1
  end
end
return 0
`;
export const extendLock = {
    name: 'extendLock',
    content,
    keys: 2,
};
//# sourceMappingURL=extendLock-2.js.map