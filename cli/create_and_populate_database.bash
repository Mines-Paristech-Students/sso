#!/usr/bin/env bash
# erases the database, creates a new one and loads fixtures in it

rm -Rf sso_server/migrations/*

# python manage.py reset_db --noinput

python manage.py makemigrations sso_server

python manage.py migrate

python manage.py loaddata test_sso_server
