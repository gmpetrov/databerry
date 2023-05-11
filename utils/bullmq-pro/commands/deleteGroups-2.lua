--[[
  Delete jobs belonging to a given group.

  Input:
      KEYS[1] groupsKey
      KEYS[2] waitkey

      -- Arguments
      ARGV[1] key prefix
      ARGV[2] limit amount of jobs to delete
]]

local rcall = redis.call

--- @include "includes/deleteGroups"

return deleteGroups(KEYS[1], KEYS[2], ARGV[1], tonumber(ARGV[2]))
