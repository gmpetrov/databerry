--[[
  Move next job to be processed to active, lock it and fetch its data. The job
  may be delayed, in that case we need to move it to the delayed set instead.

  This operation guarantees that the worker owns the job during the lock
  expiration time. The worker is responsible of keeping the lock fresh
  so that no other worker picks this job again.

  Input:
      KEYS[1] wait key
      KEYS[2] active key
      KEYS[3] priority key
      KEYS[4] stream events key
      KEYS[5] stalled key

      -- Rate limiting
      KEYS[6] rate limiter key
      KEYS[7] delayed key

      -- Promote delayed jobs
      KEYS[8] paused key
      KEYS[9] meta key

      -- Arguments
      ARGV[1] key prefix
      ARGV[2] timestamp
      ARGV[3] optional job Id
      ARGV[4] options
]]
local rcall = redis.call
local jobId
local waitKey = KEYS[1]
local activeKey = KEYS[2]
local prefixKey = ARGV[1]
local timestamp = tonumber(ARGV[2])
local opts = cmsgpack.unpack(ARGV[4])

--- @include "<base>/includes/getNextDelayedTimestamp"
--- @include "<base>/includes/getRateLimitTTL"
--- @include "includes/promoteDelayedJobs"
--- @include "includes/promoteRateLimitedGroups"

-- Check if there are delayed jobs that we can move to wait.
promoteDelayedJobs(KEYS[7], KEYS[1], KEYS[3], KEYS[8], KEYS[9], KEYS[4], ARGV[1], timestamp)

local rateLimitedNextTtl = promoteRateLimitedGroups(prefixKey, waitKey, timestamp)

if (ARGV[3] ~= "") then
    jobId = ARGV[3]

    -- clean stalled key
    local stalledKeyType = rcall("TYPE", KEYS[5])
    if stalledKeyType["ok"] == "set" then
        rcall("SREM", KEYS[5], jobId)
    else
        rcall("ZREM", KEYS[5], jobId)
    end
else
    -- Check if we are rate limited first.
    local pttl = getRateLimitTTL(opts, KEYS[6])
    if pttl > 0 then
        return { 0, 0, pttl }
    end

    -- If the queue is paused we should just return.
    local paused = rcall("HEXISTS", prefixKey .. "meta", "paused") == 1
    if paused then return end

    -- no job ID, try non-blocking move from wait to active
    -- note, an empty wait list will return false instead of nil
    jobId = rcall("RPOPLPUSH", waitKey, activeKey)
end

--- @include "includes/moveJobToActive"

-- If jobId is special ID 0:delay, then there is no job to process
if jobId then 
    if string.sub(jobId, 1, 2) == "0:" then
        rcall("LREM", activeKey, 1, jobId)
        -- Move again since we just got the marker job.
        jobId = rcall("RPOPLPUSH", waitKey, activeKey)

        if jobId and string.sub(jobId, 1, 2) == "0:" then
            rcall("LREM", activeKey, 1, jobId)
            jobId = nil
        end
    end
end

-- this script is not really moving, it is preparing the job for processing
local result = moveJobToActive(jobId, rateLimitedNextTtl, prefixKey, opts, timestamp,
    KEYS)

local resultType = type(result) 
-- Return the timestamp for the next delayed job if any.
local nextTimestamp = getNextDelayedTimestamp(KEYS[7])
if (nextTimestamp ~= nil) then
    if resultType == "table" then
        if (result[4] or 0) > nextTimestamp then
            return { result[1], result[2], result[3], nextTimestamp}
        end

        return {result[1], result[2], result[3], result[4] or nextTimestamp}
    else
        return { 0, 0, 0, nextTimestamp}
    end
end

if resultType == 'nil' then
    return {0, 0, 0, rateLimitedNextTtl}
end

return result
