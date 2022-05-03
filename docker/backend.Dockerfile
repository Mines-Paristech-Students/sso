# syntax=docker/dockerfile:1
FROM python:3.7
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /code

RUN pip install --upgrade pip>=21.2.4

COPY requirements.txt /code/
RUN pip install -r requirements.txt

COPY . /code/
