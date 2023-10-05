
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
