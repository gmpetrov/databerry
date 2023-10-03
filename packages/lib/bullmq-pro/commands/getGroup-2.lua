--[[
  Get jobs belonging to a given group.

  Input:
      KEYS[1] groupkey
      KEYS[2] waitkey

      -- Arguments
      ARGV[1] key prefix
      ARGV[2] group id
      ARGV[3] start
      ARGV[4] end
]]

local rcall = redis.call

--- @include "includes/getGroup"

return getGroup(KEYS[1], KEYS[2], ARGV[2], ARGV[1], ARGV[3], ARGV[4])
