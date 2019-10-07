from datetime import datetime, timedelta
from uuid import uuid4

from django.conf import settings
from django.contrib.auth.models import User
import jwt

from sso_server.models import Access


def create_token(
    audience: str,
    username: str,
    lifetime: timedelta = settings.JWT_AUTH_SETTINGS["ACCESS_TOKEN_LIFETIME"],
    jti: str = uuid4().hex,
    issuer: str = settings.JWT_AUTH_SETTINGS["ISSUER"],
    key: bytes = settings.JWT_AUTH_SETTINGS["PRIVATE_KEY"],
    algorithm: str = settings.JWT_AUTH_SETTINGS["ALGORITHM"],
):
    payload = {
        "exp": (datetime.utcnow() + lifetime).timestamp(),
        "iss": issuer,
        "aud": audience,
        "jti": jti,
        settings.JWT_AUTH_SETTINGS["USER_ID_CLAIM_NAME"]: username,
    }

    return jwt.encode(payload=payload, key=key, algorithm=algorithm).decode(
        "utf-8"
    )  # jwt.encode returns a bytes object, it thus has to be decoded to a str.


def create_token_for_user(user: User, audience: str) -> str:
    """Return a Token granting the specified user access to the specified audience."""

    if audience not in (x[0] for x in Access.AUDIENCES):
        raise ValueError("The specified audience is incorrect.")

    return create_token(audience=str(audience), username=str(user.username))


def decode_token(token: str) -> dict:
    return jwt.decode(
        jwt=token,
        key=settings.JWT_AUTH_SETTINGS["PUBLIC_KEY"],
        algorithms=[settings.JWT_AUTH_SETTINGS["ALGORITHM"]],
        issuer=settings.JWT_AUTH_SETTINGS["ISSUER"],
        verify=False,
    )
