--[[
  Delete jobs belonging to a given group.

  Input:
      KEYS[1] groupkey
      KEYS[2] groupsKey
      KEYS[3] waitkey

      -- Arguments
      ARGV[1] key prefix
      ARGV[2] group id
      ARGV[3] limit amount of jobs to delete
]]

local rcall = redis.call

--- @include "includes/deleteGroup"

local removedJobs, jobsLeft = deleteGroup(KEYS[2], KEYS[1], KEYS[3], ARGV[2], ARGV[1], ARGV[3])
return jobsLeft
