--[[
   Try to repair broken maxed groups.
   
   Input:
      KEYS[1]  active count key ("groups:active:count")
      KEYS[2]  groups max key ("groups:max")
      KEYS[3]  active key -- redis list of active jobs
      KEYS[4]  groups waiting key ("groups")

      ARGV[1] groupId
      ARGV[2] prefix
]]
local rcall = redis.call

-- Count all the active jobs that belong to the give group.
local activeCount = 0
local activeJobs = rcall("LRANGE", KEYS[3], 0, -1)
for _, jobId in ipairs(activeJobs) do
    local groupId = rcall("HGET", ARGV[2] .. jobId, "gid")
    if groupId == ARGV[1] then activeCount = activeCount + 1 end
end

-- If the active count does not match the stored active count for a group
-- we need to repair the group.
local activeCountKey = KEYS[1]
local expectedActiveCount = tonumber(rcall("HGET", activeCountKey, ARGV[1]))
if activeCount == expectedActiveCount then return end

rcall("HSET", activeCountKey, ARGV[1], activeCount)
if activeCount > expectedActiveCount then return end

if activeCount < expectedActiveCount then
    -- we assume the group should not be maxed, so we remove it from the maxed
    -- groups set.
    rcall("ZREM", KEYS[2], ARGV[1])

    -- And add it to the waiting groups set.
    rcall("ZADD", KEYS[4], 0, ARGV[1])
end
