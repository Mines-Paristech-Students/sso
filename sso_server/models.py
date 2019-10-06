from django.contrib.auth.models import User
from django.db import models

from sso_server.settings import API_SETTINGS


class Access(models.Model):
    """This model links an user to an audience."""

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    AUDIENCES = [(k, k) for k in API_SETTINGS["REDIRECT_URLS"].keys()]
    REDIRECT_URLS = API_SETTINGS["REDIRECT_URLS"]

    audience = models.CharField(
        max_length=10, choices=AUDIENCES, blank=True, default=""
    )
