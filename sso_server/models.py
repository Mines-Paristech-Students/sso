from django.conf import settings
from django.contrib.auth.models import User
from django.db import models


class Access(models.Model):
    """This model links an user to an audience."""

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    AUDIENCES = [(k, k) for k in settings.JWT_AUTH_SETTINGS["REDIRECT_URLS"].keys()]
    REDIRECT_URLS = settings.JWT_AUTH_SETTINGS["REDIRECT_URLS"]

    audience = models.CharField(
        max_length=10, choices=AUDIENCES, blank=True, default=""
    )
