--- @include "increaseGroupConcurrency"
--- @include "moveJobToActiveFromGroup"
--- @include "prefetchNextGroupJob"
--- @include "promoteRateLimitedGroups"
--- @include "rateLimitGroup"
local function moveJobToActive(jobId, rateLimitedNextTtl, prefixKey, options, timestamp, keys)
    local waitKey = keys[1]
    local activeKey = keys[2]
    local groupsKey = prefixKey .. 'groups'

    local groupLimit
    local groupLimitDuration
    local groupMaxConcurrency

    -- Check if we need to perform global rate limiting
    -- TODO: Replace this rate limiting by same method used in groups.
    local maxJobs = options['limiter'] and options['limiter']['max'];
    local expireTime

    -- It is not enough to check if maxJobs is defined, since we can 
    -- activate the limiter dynamically.
    if jobId and maxJobs then
        local limitDuration = options['limiter']['duration'];
        local rateLimiterKey = keys[6];

        expireTime = tonumber(rcall("PTTL", rateLimiterKey))
        if expireTime <= 0 then
            rcall("DEL", rateLimiterKey)
        end      

        local jobCounter = tonumber(rcall("INCR", rateLimiterKey))
        -- check if rate limit hit

        if jobCounter == 1 then
            local limiterDuration = opts['limiter'] and opts['limiter']['duration']
            local integerDuration = math.floor(math.abs(limiterDuration))
            rcall("PEXPIRE", rateLimiterKey, integerDuration)
        end

        if jobCounter > maxJobs then
            expireTime = rcall("PTTL", rateLimiterKey)
            local jobKey = prefixKey .. jobId
            local groupId = rcall("HGET", jobKey, "gid")

            rcall("LREM", activeKey, 1, jobId)
            if groupId then
                local groupKey = prefixKey .. 'groups:' .. groupId

                -- Move the job back to the group it belongs to
                rcall("RPUSH", groupKey, jobId)
            else
                rcall("RPUSH", waitKey, jobId)
            end

            -- Return when we can process more jobs
            return {0, 0, expireTime}
        end
    end

    if options['group'] then
        if options['group']['limit'] then
            groupLimit = options['group']['limit']['max']
            groupLimitDuration = options['group']['limit']['duration']
        end
        groupMaxConcurrency = options['group']['concurrency']
    end

    local token = options['token']
    local lockDuration = options['lockDuration']

    if jobId and groupMaxConcurrency then
        local jobKey = prefixKey .. jobId
        local groupId = rcall("HGET", jobKey, "gid")
        if groupId then
            local groupKey = prefixKey .. 'groups:' .. groupId
            if rcall("ZSCORE", prefixKey .. 'groups:max', groupId) ~= false then
                -- Special Case for the max concurrency feature.
                -- Since the call to BRPOPLPUSH + this lua script is not atomic,
                -- we need to make sure that we have not reached the max concurrency
                -- for this group.
                -- Move the job back to the group it belongs to
                rcall("LREM", activeKey, -1, jobId)
                rcall("RPUSH", groupKey, jobId)
                jobId = nil
            else
                increaseGroupConcurrency(groupsKey, groupId, groupMaxConcurrency, timestamp)
            end
        end
    end

    if jobId then
        -- Check if the group this job belongs to has been rate limited
        -- NOTE: this handles the edge case where a group can be rate limited
        -- between the BRPOPLPUSH call and moveToActive.
        -- NOTE: Due to this edge case we cannot guarantee the order of rate limited jobs
        -- within a given group.
        local jobKey = prefixKey .. jobId
        local groupId = rcall("HGET", jobKey, "gid")

        if groupId then
            local groupKey = prefixKey .. 'groups:' .. groupId
            local groupRateLimitKey = groupKey .. ':limit'
            local ttl = tonumber(rcall("PTTL", groupRateLimitKey))

            if ttl > 0 then
                -- Remove from active and move back to the group to the "right" side,
                -- so that it gets picked up asap.
                rcall("LREM", activeKey, -1, jobId)
                rcall("RPUSH", groupKey, jobId)

                -- This could have been that last job in a group so lets re-add it just in case
                local nextTimestamp = timestamp + ttl
                local groupsRateLimitKey = groupsKey .. ':limit'
                rcall("ZADD", groupsRateLimitKey, nextTimestamp, groupId)

                -- Update the next ttl known
                if rateLimitedNextTtl then
                    rateLimitedNextTtl = math.min(rateLimitedNextTtl, ttl)
                else
                    rateLimitedNextTtl = ttl
                end

                jobId = nil
            else
                rateLimitGroup(prefixKey, groupId, groupLimit, groupLimitDuration, timestamp)
            end
        end
    end

    if not jobId then
        jobId = moveJobToActiveFromGroup(prefixKey, activeKey,
                    groupMaxConcurrency, groupLimit, groupLimitDuration, timestamp)
    end

    if jobId then
        local jobKey = prefixKey .. jobId

        prefetchNextGroupJob(prefixKey, groupsKey, waitKey)

        local lockKey = jobKey .. ':lock'

        -- get a lock
        rcall("SET", lockKey, token, "PX", lockDuration)
        rcall("ZREM", keys[3], jobId) -- remove from priority

        rcall("XADD", keys[4], "*", "event", "active", "jobId", jobId, "prev",
              "waiting")

        rcall("HSET", jobKey, "processedOn", timestamp)
        rcall("HINCRBY", jobKey, "attemptsMade", 1)
        -- This is a bit wrong actually, the queue could have jobs that are ratelimited or
        -- have reached max concurrency, so in that case we should not emit this.

        return {rcall("HGETALL", jobKey), jobId, expireTime or 0, rateLimitedNextTtl} -- get job data
    else
        -- We hint the worker when there will be groups not rate limited anymore.
        return {0, 0, expireTime or 0, rateLimitedNextTtl}
    end
end
