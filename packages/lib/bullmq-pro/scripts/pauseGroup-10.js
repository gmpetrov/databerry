const content = `--[[
  Pauses or resumes a group globably.
   Input:
      KEYS[1]  prefix key
      KEYS[2]  wait key
      KEYS[3]  group key
      KEYS[4]  groups key
      KEYS[5]  paused groups key
      KEYS[6]  group rate limit key
      KEYS[7]  groups rate limit key
      KEYS[8]  groups last id key
      KEYS[9]  groups max key
      KEYS[10] events stream key
      ARGV[1] groupId
      ARGV[2] '1' resume or '0' pause
      ARGV[3] timestamp
    Event:
      publish paused or resumed event.
]]
local rcall = redis.call
--[[
  If the wait list is empty we need to move a job from the
  promoted group to wait (so that we always have a job in wait).
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
local function moveJobToWaitFromGroup(prefixKey, waitKey, groupsKey, groupKey, groupId)
  if rcall("LLEN", waitKey) == 0 then
    local jobId = rcall("RPOPLPUSH", groupKey, waitKey)
    if jobId then
      rcall("SET", prefixKey .. 'groups-lid', groupId)
    end
  end
  reinsertGroup(groupKey, groupsKey, groupId)
end
--[[
  Function to remove last group id if needed.
  It will reinsert a group from groups zset
]]
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
if ARGV[2] == '1' then
  if rcall("ZREM", KEYS[5], ARGV[1]) == 1 then
    -- Is group rate limited?
    local ttl = tonumber(rcall("PTTL", KEYS[6]))
    local isRateLimited = ttl > 0
    if not isRateLimited and rcall("ZSCORE", KEYS[9], ARGV[1]) == false then
      rcall("ZREM", KEYS[7], ARGV[1])
      moveJobToWaitFromGroup(KEYS[1], KEYS[2], KEYS[4], KEYS[3], ARGV[1])
    end
    rcall("XADD", KEYS[10], "*", "event", "groups:resumed", "groupId", ARGV[1]);
    return 0
  end
  return 1
end
if ARGV[2] == '0' then
  if rcall("ZADD", KEYS[5], ARGV[3], ARGV[1]) == 0 then
    return 1
  end
  if rcall("ZREM", KEYS[4], ARGV[1]) == 1
    or rcall("ZSCORE", KEYS[9], ARGV[1]) ~= false
    or rcall("ZSCORE", KEYS[7], ARGV[1]) ~= false then
    removeLastGroupIdIfNeeded(KEYS[4], KEYS[8], ARGV[1])
  end
  rcall("XADD", KEYS[10], "*", "event", "groups:paused", "groupId", ARGV[1]);
  return 0
end
`;
export const pauseGroup = {
    name: 'pauseGroup',
    content,
    keys: 10,
};
//# sourceMappingURL=pauseGroup-10.js.map