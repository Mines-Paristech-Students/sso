#!/bin/bash
set -e

# Server database
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER root WITH PASSWORD 'password';
    CREATE DATABASE sso OWNER root;
    ALTER USER root WITH SUPERUSER;
EOSQL