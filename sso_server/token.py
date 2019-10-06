from datetime import datetime
from uuid import uuid4

from django.contrib.auth.models import User
import jwt

from sso_server.models import Access
from sso_server.settings import API_SETTINGS


def create_token(user: User, audience: str) -> str:
    """Return a Token granting the specified user access to the specified audience."""

    if audience not in (x[0] for x in Access.AUDIENCES):
        raise ValueError("The specified audience is incorrect.")

    payload = {
        "exp": int(
            (datetime.utcnow() + API_SETTINGS["ACCESS_TOKEN_LIFETIME"]).timestamp()
        ),
        "iss": API_SETTINGS["ISSUER_CLAIM"],
        "aud": str(audience),
        "jti": uuid4().hex,
        API_SETTINGS["USER_ID_CLAIM_NAME"]: str(user.username),
    }

    return jwt.encode(
        payload=payload,
        key=API_SETTINGS["PRIVATE_KEY"],
        algorithm=API_SETTINGS["ALGORITHM"],
    ).decode(
        "utf-8"
    )  # jwt.encode returns a bytes object, it thus has to be decoded to a str.


def decode_token(token: str) -> dict:
    return jwt.decode(
        jwt=token,
        key=API_SETTINGS["PUBLIC_KEY"],
        algorithm=API_SETTINGS["ALGORITHM"],
        verify=False,
    )
