const content = `--[[
  Function to dynamically rate limit a group.
  Note:
  This function is designed to be called from inside a worker processor
  when a job is being processed and the group it belongs to must be rate limited.
  Input:
    KEYS[1] active key    
    KEYS[2] stalled key
    KEYS[3] job lock key
    KEYS[4] group key
    KEYS[5] group rate limit key
    KEYS[6] group paused key
    KEYS[7] groupsKey
    KEYS[8] groupsRateLimitKey
    KEYS[9] wait key
    ARGV[1] job id
    ARGV[2] expirationTimeMs
    ARGV[3] timestamp
    ARGV[4] group id
    ARGV[5] prefix key
]]
local rcall = redis.call
--[[
    If there is no jobId in the wait list we will see if we can fetch a job from any of
    the groups.
    The "groupsKey" is a ZSET holding the group ids. An entry in the ZSET guarantees that there
    is a non empty list for that group (we must keep this guarantee at all times [1]).
    After getting the next jobId from the next group (the one with lowest score in the "groupsKey"),
    we need to check if we need to "reinsert" that group with the highest score. It is reinserted
    only if there are any other jobs left for that group, otherwise it is discarded
    (so that we can guarantee [1]).
    If the wait list is empty, since we always need to have 1 job in the wait list *if* there are group jobs
    in any of the groups (so that our blocking workers will pick the next job automatically),
    we try to get the next job from lowest scored group.
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
local function prefetchNextGroupJob(prefixKey, groupsKey, waitKey,
                                         timestamp)
    if rcall("LLEN", waitKey) == 0 then
        -- TODO: Investigate if we should not promote rate limited groups here as well.
        -- Try to move the next grouped job to wait list
        local groupIds = rcall("ZPOPMIN", groupsKey)
        if #groupIds > 0 then
            local groupsLastIdKey = prefixKey .. 'groups-lid'
            local lastGroupId = rcall("GET", groupsLastIdKey)
            local groupId = groupIds[1]
            local groupKey = groupsKey .. ':' .. groupId
            local numGroups = rcall("ZCARD", groupsKey)
            if lastGroupId ~= groupId or numGroups == 1 then
                local jobId = rcall("RPOPLPUSH", groupKey, waitKey)
                reinsertGroup(groupKey, groupsKey, groupId)
                rcall("SET", groupsLastIdKey, groupId)
            else
                reinsertGroup(groupKey, groupsKey, groupId)
                -- we take next group's job to avoid repeating last group
                local groupIds = rcall("ZPOPMIN", groupsKey)
                if #groupIds > 0 then
                    local groupId = groupIds[1]
                    local groupKey = groupsKey .. ':' .. groupId
                    rcall("RPOPLPUSH", groupKey, waitKey)
                    reinsertGroup(groupKey, groupsKey, groupId)
                    rcall("SET", groupsLastIdKey, groupId)
                end
            end
        end
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
local groupId = ARGV[4]
local groupKey = KEYS[4]
local groupsKey = KEYS[7]
-- If group is paused we just return without doing anything.
if (rcall("ZSCORE", KEYS[6], groupId) ~= false) then
    return
else
    -- Move job back to the group it belongs to
    local jobId = ARGV[1]
    local removed = rcall("LREM", KEYS[1], 1, jobId)
    if (removed > 0) then
        -- Update the max key for the group
        -- We can use max concurrency 99999 because by definition, if we decrease the concurrency
        -- we will stop being maxed out.
        decreaseGroupConcurrency(ARGV[5], groupId, 99999)
        -- Mark this group has being rate limited.
        local expirationTimeMs = tonumber(ARGV[2])
        local timestamp = tonumber(ARGV[3])
        local nextTimestamp = timestamp + expirationTimeMs
        local groupRateLimitKey = KEYS[5]
        -- Set the rate limit key for the group
        rcall("SET", groupRateLimitKey, 1, "PX", ARGV[2])
        -- Since this group is rate limited, remove it from the groupsKey and
        -- add it to the limit set.
        rcall("ZREM", groupsKey, groupId)
        local groupsRateLimitKey = KEYS[8]
        rcall("ZADD", groupsRateLimitKey, nextTimestamp, groupId)
        -- Check if there is a job in the wait queue belonging to this group
        -- and if so move it back to the group.
        local waitKey = KEYS[9]
        local waitLen = rcall("LLEN", waitKey)
        if (waitLen > 0) then
            local prefixKey = ARGV[5]
            local waitJobId = rcall("LINDEX", waitKey, -1)
            local jobKey = prefixKey .. waitJobId
            local waitJobGroupId = rcall("HGET", jobKey, "gid")
            if (waitJobGroupId == groupId) then
                rcall("RPOP", waitKey)
                rcall("RPUSH", groupKey, waitJobId)
                -- Since we removed the job from the active queue we need to
                -- promote a another job from another group.
                prefetchNextGroupJob(prefixKey, groupsKey, waitKey)
            end
        end
        local stalledKey = KEYS[2]
        local stalledKeyType = rcall("TYPE", stalledKey)
        if stalledKeyType["ok"] == "set" then
            rcall("SREM", stalledKey , jobId)
        else
            rcall("ZREM", stalledKey, jobId)
        end
        rcall("RPUSH", groupKey, jobId);
        rcall("DEL", KEYS[3])
    end
end
`;
export const rateLimitGroup = {
    name: 'rateLimitGroup',
    content,
    keys: 9,
};
//# sourceMappingURL=rateLimitGroup-9.js.map