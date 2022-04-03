rmdir /S /Q sso_server\migrations

@REM python manage.py reset_db --noinput

python manage.py makemigrations sso_server

python manage.py migrate

python manage.py loaddata test_sso_server
