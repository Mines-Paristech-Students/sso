# syntax=docker/dockerfile:1
FROM python:3.7
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY . .

RUN pip install --upgrade pip>=21.2.4

RUN pip install -r requirements.txt

RUN chmod +x ./cli/create_and_populate_database.bash

EXPOSE 8001

CMD ./cli/create_and_populate_database.bash ; python manage.py runserver 0.0.0.0:8001