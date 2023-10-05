--[[
  Get jobs count belonging to all groups. Since there could be thousands of
  groups, this call can be made iteratively.

  Input:
      KEYS[1] groupskey
      KEYS[2] rateLimitedGroupsKey
      KEYS[3] maxConcurrencyGroupsKey
      KEYS[4] pausedGroupsKey

      -- Arguments
      ARGV[1] start
      ARGV[2] end (special end value -1 is accepted meaning all groups)
      ARGV[3] cursor
]]
local rcall = redis.call

local startPos = tonumber(ARGV[1])
local endPos = tonumber(ARGV[2])

local mainGroupsCount = rcall("ZCARD", KEYS[1])
local rateLimitedGroupsCount = rcall("ZCARD", KEYS[2])
local maxConcurrencyGroupsCount = rcall("ZCARD", KEYS[3])
local pausedGroupsCount = rcall("ZCARD", KEYS[4])

-- Note, we do not need to consider the case where a group only has one job in the wait status,
-- we will consider this edge case as if that group does not exist anymore.

-- If endPos is -1 then we must return all groups
if endPos == -1 then
    return {
        rcall("ZRANGE", KEYS[1], startPos, -1),
        rcall("ZRANGE", KEYS[2], startPos, -1), 
        rcall("ZRANGE", KEYS[3], startPos, -1),
        rcall("ZRANGE", KEYS[4], startPos, -1)
    }
end

local groups = {}
if startPos < mainGroupsCount then
    groups = rcall("ZRANGE", KEYS[1], startPos, endPos)
    startPos = startPos + #groups
end

endPos = endPos - mainGroupsCount

local rateLimitedGroups = {}
if endPos > 0 then
    startPos = startPos - mainGroupsCount
    if startPos < rateLimitedGroupsCount then
        rateLimitedGroups = rcall("ZRANGE", KEYS[2], startPos, endPos)
        startPos = startPos + #rateLimitedGroups
    end
end

endPos = endPos - rateLimitedGroupsCount
local maxConcurrencyGroups = {}
if endPos > 0 then
    startPos = startPos - rateLimitedGroupsCount
    if startPos < maxConcurrencyGroupsCount then
        maxConcurrencyGroups = rcall("ZRANGE", KEYS[3], startPos, endPos)
    end
end

endPos = endPos - maxConcurrencyGroupsCount
local pausedGroups = {}
if endPos > 0 then
    startPos = startPos - maxConcurrencyGroupsCount
    if startPos < pausedGroupsCount then
        pausedGroups = rcall("ZRANGE", KEYS[4], startPos, endPos)
    end
end

return {groups, rateLimitedGroups, maxConcurrencyGroups, pausedGroups}
