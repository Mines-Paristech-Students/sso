"""
Django settings for sso project.

Generated by 'django-admin startproject' using Django 2.2.6.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""

import os
from datetime import timedelta

import environ

env = environ.Env()
environ.Env.read_env()

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env.str("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool("DEBUG")

ALLOWED_HOSTS = ["localhost", "127.0.0.1"] + [env.str("PRODUCTION_DOMAIN")]

# Application definition

INSTALLED_APPS = [
    "sso_server",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

PRODUCTION_URL = (
    env.str("PRODUCTION_SUBDOMAIN") + "." + env.str("PRODUCTION_DOMAIN")
    if env.str("PRODUCTION_SUBDOMAIN")
    else env.str("PRODUCTION_DOMAIN")
)
CORS_ORIGIN_WHITELIST = (
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://" + PRODUCTION_URL,
)

ROOT_URLCONF = "sso.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

WSGI_APPLICATION = "sso.wsgi.application"

IDENTITY_WEBHOOK_URLS = env.dict("IDENTITY_WEBHOOK_URLS")
IDENTITY_API_KEYS = env.dict("IDENTITY_API_KEYS")

# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env.str("DATABASE_NAME"),
        "USER": env.str("DATABASE_USER"),
        "PASSWORD": env.str("DATABASE_PASSWORD"),
        "HOST": env.str("DATABASE_HOST"),
        "PORT": env.str("DATABASE_PORT"),
    }
}

EMAIL = {
    "ADDRESS": env.str("EMAIL_ADDRESS"),
    "PASSWORD": env.str("EMAIL_PASSWORD"),
    "HOST": env.str("EMAIL_HOST"),
    "PORT": env.str("EMAIL_PORT"),
}

FRONTEND_HOST = "http://localhost:3001"

# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 12},
    },
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

AUTH_USER_MODEL = "sso_server.User"

# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/

STATIC_URL = "/static/"

# JWT authentication settings.

JWT_AUTH_SETTINGS = {
    # Algorithm.
    # The keys can be generated by following the instructions at
    # https://rietta.com/blog/openssl-generating-rsa-key-from-command/.
    "ALGORITHM": "RS256",
    "PRIVATE_KEY": env.str("PRIVATE_KEY", multiline=True),
    "PUBLIC_KEY": env.str("PUBLIC_KEY", multiline=True),
    # Life time.
    "ACCESS_TOKEN_LIFETIME": timedelta(days=7),
    # Claims.
    "ISSUER": "sso_server",
    "USER_ID_CLAIM_NAME": "user",
    # Redirect URLs. The allowed audiences are automatically generated from this dict.
    "REDIRECT_URLS": env.dict("REDIRECT_URLS"),
    "GET_PARAMETER": "access",
}
