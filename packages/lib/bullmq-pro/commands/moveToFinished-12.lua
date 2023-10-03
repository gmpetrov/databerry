--[[
  Move job from active to a finished status (completed o failed)
  A job can only be moved to completed if it was active.
  The job must be locked before it can be moved to a finished status,
  and the lock must be released in this script.

     Input:
      KEYS[1] wait key
      KEYS[2] active key
      KEYS[3] priority key
      KEYS[4] stream events key
      KEYS[5] stalled key

      -- Rate limiting
      KEYS[6] rate limiter key
      KEYS[7] delayed key

      KEYS[8] paused key
      KEYS[9] completed/failed key
      KEYS[10] jobId key
      KEYS[11] meta key
      KEYS[12] metrics key

      ARGV[1]  jobId
      ARGV[2]  timestamp
      ARGV[3]  msg property
      ARGV[4]  return value / failed reason
      ARGV[5]  target (completed/failed)
      ARGV[6]  event data (? maybe just send jobid).
      ARGV[7]  fetch next?
      ARGV[8]  keys prefix
      ARGV[9] opts
    
     Output:
      0 OK
      -1 Missing key.
      -2 Missing lock.
      -3 Job not in active set
      -4 Job has pending dependencies
      -6 Lock is not owned by this client

     Events:
      'completed/failed'
]]
local rcall = redis.call

local waitKey = KEYS[1]
local activeKey = KEYS[2]

local priorityKey = KEYS[3]
local eventStreamKey = KEYS[4]
local stalledKey = KEYS[5]

local finishedKey = KEYS[9]
local jobIdKey = KEYS[10]
local metaKey = KEYS[11]

local timestamp = ARGV[2]

local prefixKey = ARGV[8]

local opts = cmsgpack.unpack(ARGV[9])

local token = opts['token']
local lockDuration = opts['lockDuration']
local attempts = opts['attempts']
local attemptsMade = opts['attemptsMade']
local maxMetricsSize = opts['maxMetricsSize']

--- @include "<base>/includes/collectMetrics"
--- @include "<base>/includes/destructureJobKey"
--- @include "<base>/includes/getNextDelayedTimestamp"
--- @include "<base>/includes/getRateLimitTTL"
--- @include "<base>/includes/moveParentFromWaitingChildrenToFailed"
--- @include "<base>/includes/removeJob"
--- @include "<base>/includes/removeJobsByMaxAge"
--- @include "<base>/includes/removeJobsByMaxCount"
--- @include "<base>/includes/removeParentDependencyKey"
--- @include "<base>/includes/trimEvents"
--- @include "includes/decreaseGroupConcurrency"
--- @include "includes/moveJobToActive"
--- @include "includes/prefetchNextGroupJob"
--- @include "includes/promoteDelayedJobs"
--- @include "includes/promoteRateLimitedGroups"
--- @include "includes/rateLimitGroup"
--- @include "includes/updateParentDepsIfNeeded"
local rateLimitedNextTtl = promoteRateLimitedGroups(prefixKey, waitKey,
                                                    timestamp)

if rcall("EXISTS", jobIdKey) == 1 then -- // Make sure job exists
    if token ~= "0" then
        local lockKey = jobIdKey .. ':lock'
        local lockToken = rcall("GET", lockKey)
        if lockToken == token then
            rcall("DEL", lockKey)
            local stalledKeyType = rcall("TYPE", stalledKey)
            if stalledKeyType["ok"] == "set" then
                rcall("SREM", stalledKey, ARGV[1])
            else
                rcall("ZREM", stalledKey, ARGV[1])
            end
        else
            if lockToken then
                -- Lock exists but token does not match
                return -6
            else
                -- Lock is missing completely
                return -2
            end
        end
    end

    if rcall("SCARD", jobIdKey .. ":dependencies") ~= 0 then -- // Make sure it does not have pending dependencies
        return -4
    end

    local parentReferences = rcall("HMGET", jobIdKey, "parentKey", "parent")
    local parentKey = parentReferences[1] or ""
    local parentId = ""
    local parentQueueKey = ""
    if parentReferences[2] ~= false then
        local jsonDecodedParent = cjson.decode(parentReferences[2])
        parentId = jsonDecodedParent['id']
        parentQueueKey = jsonDecodedParent['queueKey']
    end

    local jobId = ARGV[1]
    local timestamp = ARGV[2]

    -- Remove from active list (if not active we shall return error)
    local numRemovedElements = rcall("LREM", activeKey, -1, jobId)
    if (numRemovedElements < 1) then return -3 end

    -- Trim events before emiting them to avoid trimming events emitted in this script
    trimEvents(metaKey, eventStreamKey)

    -- Update the active group count and set.
    local jobKey = prefixKey .. jobId
    local groupId = rcall("HGET", jobKey, "gid")

    if groupId then
        local maxConcurrency = opts['group'] and opts['group']['concurrency']
        decreaseGroupConcurrency(prefixKey, groupId, maxConcurrency or 999999)
    end

    -- If job has a parent we need to 
    -- 1) remove this job id from parents dependencies
    -- 2) move the job Id to parent "processed" set
    -- 3) push the results into parent "results" list
    -- 4) if parent's dependencies is empty, then move parent to "wait/paused". Note it may be a different queue!.
    -- NOTE: Priorities not supported yet for parent jobs.

    -- local parentQueueKey = ARGV[13]
    if parentId == "" and parentKey ~= "" then
        parentId = getJobIdFromKey(parentKey)
        parentQueueKey = getJobKeyPrefix(parentKey, ":" .. parentId)
    end
    if parentId ~= "" then
        if ARGV[5] == "completed" then
            local dependenciesSet = parentKey .. ":dependencies"
            if rcall("SREM", dependenciesSet, jobIdKey) == 1 then
                updateParentDepsIfNeeded(parentKey, parentQueueKey, dependenciesSet,
                    parentId, jobIdKey, ARGV[4], timestamp)
            end
        elseif opts['fpof'] then
            moveParentFromWaitingChildrenToFailed(parentQueueKey, parentKey, parentId, jobIdKey, timestamp)
        end
    end

    -- Remove job?
    local maxCount = opts['keepJobs']['count']
    local maxAge = opts['keepJobs']['age']
    if maxCount ~= 0 then
        local targetSet = finishedKey
        -- Add to complete/failed set
        rcall("ZADD", targetSet, timestamp, jobId)
        rcall("HMSET", jobIdKey, ARGV[3], ARGV[4], "finishedOn", timestamp)
        -- "returnvalue" / "failedReason" and "finishedOn"

        -- Remove old jobs?
        if maxAge ~= nil then
            removeJobsByMaxAge(timestamp, maxAge, targetSet, prefixKey)
        end

        if maxCount ~= nil and maxCount > 0 then
            removeJobsByMaxCount(maxCount, targetSet, prefixKey)
        end
    else
        local jobLogKey = jobIdKey .. ':logs'
        local jobProcessedKey = jobIdKey .. ':processed'
        rcall("DEL", jobIdKey, jobLogKey, jobProcessedKey)
        if parentKey ~= "" then
            removeParentDependencyKey(jobIdKey, false, parentKey)
        end
    end

    rcall("XADD", eventStreamKey, "*", "event", ARGV[5], "jobId", jobId,
          ARGV[3], ARGV[4])

    if ARGV[5] == "failed" then
        if tonumber(attemptsMade) >= tonumber(attempts) then
            rcall("XADD", eventStreamKey, "*", "event", "retries-exhausted",
                  "jobId", jobId, "attemptsMade", attemptsMade)
        end
    end

    -- Collect metrics
    if maxMetricsSize ~= "" then
        collectMetrics(KEYS[12], KEYS[12] .. ':data', maxMetricsSize, timestamp)
    end

    -- Since there may not be a job in wait due to some BRPOPLPUSH stealing the job
    -- we must check if we need to prefetch the next one.
    local groupsKey = prefixKey .. 'groups'
    prefetchNextGroupJob(prefixKey, groupsKey, waitKey)

    -- Try to get next job to avoid an extra roundtrip if the queue is not closing,
    -- and not rate limited and not paused!
    local paused = rcall("HEXISTS", prefixKey .. "meta", "paused") == 1

    -- Check if there are delayed jobs that can be promoted
    promoteDelayedJobs(KEYS[7], waitKey, priorityKey, KEYS[8], KEYS[11], KEYS[4], ARGV[8], timestamp)

    if (ARGV[7] == "1" and not paused) then        
        
        -- Check if we are rate limited first.
        local pttl = getRateLimitTTL(opts, KEYS[6])
        if pttl > 0 then
            return { 0, 0, pttl }
        end

        jobId = rcall("RPOPLPUSH", waitKey, activeKey)

        local result
        -- If jobId is special ID 0:delay, then there is no job to process
        if jobId then 
            if string.sub(jobId, 1, 2) == "0:" then
                rcall("LREM", activeKey, 1, jobId)
                jobId = rcall("RPOPLPUSH", waitKey, activeKey)
            end
        end

        -- this script is not really moving, it is preparing the job for processing
        local result = moveJobToActive(jobId, rateLimitedNextTtl, prefixKey,
            opts, timestamp, KEYS)

        local resultType = type(result)
        local waitLen = rcall("LLEN", KEYS[1])
        if waitLen == 0 then
            local activeLen = rcall("LLEN", KEYS[2])
    
            if activeLen == 0 then
                rcall("XADD", KEYS[4], "*", "event", "drained")
            end
        end

        -- Return the timestamp for the next delayed job if any.
        local nextTimestamp = getNextDelayedTimestamp(KEYS[7])

        if (nextTimestamp ~= nil) then
            -- The result is guaranteed to be positive, since the
            -- ZRANGEBYSCORE command would have return a job otherwise.
            if resultType == "table" then
                if (result[4] or 0) > nextTimestamp then
                    return {result[1], result[2], result[3], nextTimestamp}
                end

                return {result[1], result[2], result[3], result[4] or nextTimestamp}
            else
                return {0, 0, 0, nextTimestamp}
            end
        end

        if resultType == 'nil' then
            return {0, 0, 0, rateLimitedNextTtl}
        end

        return result
    end

    return {0, 0, 0, rateLimitedNextTtl}
else
    return -1
end
