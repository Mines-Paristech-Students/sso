from datetime import datetime
from uuid import uuid4

from django.conf import settings
from django.contrib.auth.models import User
import jwt

from sso_server.models import Access


def create_token(user: User, audience: str) -> str:
    """Return a Token granting the specified user access to the specified audience."""

    if audience not in (x[0] for x in Access.AUDIENCES):
        raise ValueError("The specified audience is incorrect.")

    payload = {
        "exp": int(
            (
                datetime.utcnow() + settings.JWT_AUTH_SETTINGS["ACCESS_TOKEN_LIFETIME"]
            ).timestamp()
        ),
        "iss": settings.JWT_AUTH_SETTINGS["ISSUER"],
        "aud": str(audience),
        "jti": uuid4().hex,
        settings.JWT_AUTH_SETTINGS["USER_ID_CLAIM_NAME"]: str(user.username),
    }

    return jwt.encode(
        payload=payload,
        key=settings.JWT_AUTH_SETTINGS["PRIVATE_KEY"],
        algorithm=settings.JWT_AUTH_SETTINGS["ALGORITHM"],
    ).decode(
        "utf-8"
    )  # jwt.encode returns a bytes object, it thus has to be decoded to a str.


def decode_token(token: str) -> dict:
    return jwt.decode(
        jwt=token,
        key=settings.JWT_AUTH_SETTINGS["PUBLIC_KEY"],
        algorithms=[settings.JWT_AUTH_SETTINGS["ALGORITHM"]],
        issuer=settings.JWT_AUTH_SETTINGS["ISSUER"],
        verify=False,
    )
