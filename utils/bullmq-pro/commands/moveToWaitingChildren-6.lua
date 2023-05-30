--[[
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

--- @include "includes/decreaseGroupConcurrency"

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
