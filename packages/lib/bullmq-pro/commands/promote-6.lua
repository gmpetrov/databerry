--[[
  Promotes a job that is currently "delayed" to the "waiting" state

     Input:
      KEYS[1] 'delayed'
      KEYS[2] 'wait'
      KEYS[3] 'paused'
      KEYS[4] 'meta'
      KEYS[5] 'priority'
      KEYS[6] 'event stream'

      ARGV[1]  queue.toKey('')
      ARGV[2]  jobId
      ARGV[3]  timestamp

     Events:
      'waiting'
]]
local rcall = redis.call;
local jobId = ARGV[2]

-- Includes
--- @include "<base>/includes/addJobWithPriority"
--- @include "<base>/includes/getTargetQueueList"
--- @include "includes/addToGroup"

if rcall("ZREM", KEYS[1], jobId) == 1 then
  local jobAttributes = rcall("HMGET", ARGV[1] .. jobId, "priority", "gid")
  local priority = tonumber(jobAttributes[1]) or 0
  local target = getTargetQueueList(KEYS[4], KEYS[2], KEYS[3])

  -- Remove delayed "marker" from the wait list if there is any.
  -- Since we are adding a job we do not need the marker anymore.
  local marker = rcall("LINDEX", target, 0)
  if marker and string.sub(marker, 1, 2) == "0:" then
    rcall("LPOP", target)
  end

  if jobAttributes[2] then
    addToGroup(true, ARGV[1], jobAttributes[2], jobId, target, tonumber(ARGV[3]))
  elseif priority == 0 then
    -- LIFO or FIFO
    rcall("LPUSH", target, jobId)
  else
    -- Priority add
    addJobWithPriority(KEYS[5], priority, target, jobId)
  end

  -- Emit waiting event (wait..ing@token)
  rcall("XADD", KEYS[6], "*", "event", "waiting", "jobId", jobId, "prev", "delayed");

  rcall("HSET", ARGV[1] .. jobId, "delay", 0)

  return 0
else
  return -3
end