--[[
  Moves job from active to delayed set.

  Input:
    KEYS[1] wait key
    KEYS[2] active key
    KEYS[3] priority key
    KEYS[4] delayed key
    KEYS[5] job key
    KEYS[6] events stream
    KEYS[7] paused key
    KEYS[8] meta key

    ARGV[1] key prefix
    ARGV[2] timestamp
    ARGV[3] delayedTimestamp
    ARGV[4] the id of the job
    ARGV[5] queue token
    ARGV[6] groupId
    ARGV[7] concurrency

  Output:
    0 - OK
   -1 - Missing job.
   -2 - Missing lock
   -3 - Job not in active set.

  Events:
    - delayed key.
]]
local rcall = redis.call

--- @include "<base>/includes/addDelayMarkerIfNeeded"
--- @include "<base>/includes/getTargetQueueList"
--- @include "includes/decreaseGroupConcurrency"
--- @include "includes/promoteDelayedJobs"

promoteDelayedJobs(KEYS[4], KEYS[1], KEYS[3], KEYS[7], KEYS[8], KEYS[6], ARGV[1], ARGV[2])

if rcall("EXISTS", KEYS[5]) == 1 then

  local delayedKey = KEYS[4]
  if ARGV[5] ~= "0" then
    local lockKey = KEYS[5] .. ':lock'
    if rcall("GET", lockKey) == ARGV[5] then
      rcall("DEL", lockKey)
    else
      return -2
    end
  end

  local jobId = ARGV[4]
  local score = tonumber(ARGV[3])
  local delayedTimestamp = (score / 0x1000)
  
  local numRemovedElements = rcall("LREM", KEYS[2], -1, jobId)

  if(numRemovedElements < 1) then
    return -3
  end

  -- Check if we need to push a marker job to wake up sleeping workers.
  local target = getTargetQueueList(KEYS[8], KEYS[1], KEYS[7])
  addDelayMarkerIfNeeded(target, delayedKey)

  rcall("ZADD", delayedKey, score, jobId)

  if ARGV[6] then
    decreaseGroupConcurrency(ARGV[1], ARGV[6], tonumber(ARGV[7] or 999999))
  end

  rcall("XADD", KEYS[6], "*", "event", "delayed", "jobId", jobId, "delay", delayedTimestamp);

  return 0
else
  return -1
end
