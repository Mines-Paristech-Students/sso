import uuid
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(blank=False, unique=True)


class Access(models.Model):
    """This model links an user to an audience."""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    AUDIENCES = [(k, k) for k in settings.JWT_AUTH_SETTINGS["REDIRECT_URLS"].keys()]
    REDIRECT_URLS = settings.JWT_AUTH_SETTINGS["REDIRECT_URLS"]

    audience = models.CharField(
        max_length=10, choices=AUDIENCES, blank=True, default=""
    )


class PasswordRecovery(models.Model):
    """
    This model represents a password recovery attempt.
    It links an user and a UUID, which will be sent to the user in the password recovery email, and has to be submitted
    in order to change the password.
    """

    TOKEN_LIFETIME = timedelta(minutes=60)

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, to_field="email", on_delete=models.CASCADE
    )

    created_at = models.DateTimeField(editable=False, default=timezone.now)

    @property
    def is_valid(self) -> bool:
        return self.created_at + self.TOKEN_LIFETIME > timezone.now()
