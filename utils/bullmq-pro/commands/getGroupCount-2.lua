--[[
  Get count of jobs belonging to a given group.

  Input:
      KEYS[1] groupkey
      KEYS[2] waitkey

      -- Arguments
      ARGV[1] key prefix
      ARGV[2] group id
]]

local rcall = redis.call

--- @include "includes/getGroupCount"

return getGroupCount(KEYS[1], KEYS[2], ARGV[2], ARGV[1])
