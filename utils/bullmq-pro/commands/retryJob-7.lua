--[[
  Retries a failed job by moving it back to the wait queue.

    Input:
      KEYS[1] prefix key
      KEYS[2] 'active',
      KEYS[3] 'wait'
      KEYS[4] 'paused'
      KEYS[5] 'id'
      KEYS[6] 'meta'
      KEYS[7] events stream

      ARGV[1] pushCmd
      ARGV[2] jobId
      ARGV[3] token
      ARGV[4] groupId
      ARGV[5] concurrency
      ARGV[6] timestamp

    Events:
      'waiting'

    Output:
     0  - OK
     -1 - Missing key
     -2 - Missing lock
]]
local rcall = redis.call

-- Includes
--- @include "<base>/includes/getTargetQueueList"
--- @include "includes/addToGroup"
--- @include "includes/decreaseGroupConcurrency"

if rcall("EXISTS", KEYS[5]) == 1 then

  if ARGV[3] ~= "0" then
    local lockKey = KEYS[5] .. ':lock'
    if rcall("GET", lockKey) == ARGV[3] then
      rcall("DEL", lockKey)
    else
      return -2
    end
  end

  rcall("LREM", KEYS[2], 0, ARGV[2])

  local target = getTargetQueueList(KEYS[6], KEYS[3], KEYS[4])

  if ARGV[4] then
    decreaseGroupConcurrency(KEYS[1], ARGV[4], tonumber(ARGV[5] or 999999))
    addToGroup(false, KEYS[1], ARGV[4], ARGV[2], target, tonumber(ARGV[6]))
  else
    rcall(ARGV[1], target, ARGV[2])
  end

  -- Emit waiting event
  rcall("XADD", KEYS[7], "*", "event", "waiting", "jobId", ARGV[2], "prev", "failed");
  
  return 0
else
  return -1
end
