const content = `--[[
  Moves job from active to waiting children set.
  Input:
    KEYS[1] prefix key
    KEYS[2] lock key
    KEYS[3] active key
    KEYS[4] waitChildrenKey key
    KEYS[5] job key
    KEYS[6] groupId
    ARGV[1] token
    ARGV[2] child key
    ARGV[3] timestamp
    ARGV[4] the id of the job
    ARGV[5] concurrency
  Output:
    0 - OK
    1 - There are not pending dependencies.
   -1 - Missing job.
   -2 - Missing lock
   -3 - Job not in active set
]]
local rcall = redis.call
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
local function decreaseGroupConcurrency(prefixKey, groupId, maxConcurrency)
    local activeCountKey = prefixKey .. "groups:active:count"
    local activeCount = rcall("HGET", activeCountKey, groupId)
    if activeCount then
        local count = rcall("HINCRBY", activeCountKey, groupId, -1)
        if count <= 0 then rcall("HDEL", activeCountKey, groupId) end
        -- We use maxConcurrency, in case the user decides to change it (lower it),
        -- we need to check it here so that we keep the group in active if necessary.
        if (count < maxConcurrency) and
            (rcall("ZSCORE", prefixKey .. "groups:max", groupId) ~= false) then
            rcall("ZREM", prefixKey .. "groups:max", groupId)
            if rcall("ZSCORE", prefixKey .. "groups:paused", groupId) == false then                
                local groupKey = prefixKey .. 'groups:' .. groupId
                local groupsKey = prefixKey .. 'groups'
                reinsertGroup(groupKey, groupsKey, groupId)
            end
        end
    end
end
local function moveToWaitingChildren (activeKey, waitingChildrenKey, jobId,
  timestamp, lockKey, token, prefix, groupId, concurrency)
  if token ~= "0" then
    if rcall("GET", lockKey) == token then
      rcall("DEL", lockKey)
    else
      return -2
    end
  end
  local score = tonumber(timestamp)
  local numRemovedElements = rcall("LREM", activeKey, -1, jobId)
  if(numRemovedElements < 1) then
    return -3
  end
  rcall("ZADD", waitingChildrenKey, score, jobId)
  if groupId then
    decreaseGroupConcurrency(prefix, groupId, tonumber(concurrency or 999999))
  end
  return 0
end
if rcall("EXISTS", KEYS[5]) == 1 then
  if ARGV[2] ~= "" then
    if rcall("SISMEMBER", KEYS[5] .. ":dependencies", ARGV[2]) ~= 0 then
      return moveToWaitingChildren(KEYS[3], KEYS[4], ARGV[4],
              ARGV[3], KEYS[2], ARGV[1], KEYS[1], KEYS[6], ARGV[5])
    end
    return 1
  else
    if rcall("SCARD", KEYS[5] .. ":dependencies") ~= 0 then 
      return moveToWaitingChildren(KEYS[3], KEYS[4], ARGV[4],
              ARGV[3], KEYS[2], ARGV[1], KEYS[1], KEYS[6], ARGV[5])
    end
    return 1
  end
end
return -1
`;
export const moveToWaitingChildren = {
    name: 'moveToWaitingChildren',
    content,
    keys: 6,
};
//# sourceMappingURL=moveToWaitingChildren-6.js.map