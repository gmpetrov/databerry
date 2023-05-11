local function setGroupRateLimitedIfNeeded(prefixKey, groupId, isRateLimited, timestamp, ttl)
  local groupsKey = prefixKey .. 'groups'
  if not isRateLimited then
    local highscore = rcall("ZREVRANGE", groupsKey, 0, 0,
                            "withscores")[2] or 0
    rcall("ZADD", groupsKey, highscore + 1, groupId)
  else
    local groupsRateLimitKey = groupsKey .. ':limit'
    local nextTimestamp = timestamp + ttl
    rcall("ZADD", groupsRateLimitKey, nextTimestamp, groupId)
  end
end
