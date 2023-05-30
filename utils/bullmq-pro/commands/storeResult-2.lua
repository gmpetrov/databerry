--[[
  Adds a job to the queue by doing the following:
    - Increases the job counter if needed.
    - Creates a new job key with the job data.

    - if delayed:
      - computes timestamp.
      - adds to delayed zset.
      - Emits a global event 'delayed' if the job is delayed.
      - Adds the job to the "added" list so that workers gets notified.

    Input:
      KEYS[1] job key
      KEYS[2] lock key

      ARGV[1] token.
      ARGV[2] Json stringified result

      Output:
        1  - OK
        -2 - Missing token
]]
local jobIdKey = KEYS[1]
local rcall = redis.call

if ARGV[1] ~= "0" then
  if rcall("GET", KEYS[2]) ~= ARGV[1] then
    return -2
  end
end

rcall("HSET", jobIdKey, "returnvalue", ARGV[2])

return 1