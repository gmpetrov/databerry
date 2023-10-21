# script used to migrate all services to EU servers

# Postgresql
# dump
# PGSSLMODE=allow pg_dump $DATABASE_URL > dump.sql

# restore
# PGSSLMODE=allow psql $NEW_DATABASE_URL --clean dump.sql

# patch 
# dotenv -e ../../.env.local tsx patch-s3-url.ts