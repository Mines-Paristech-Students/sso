from datetime import timedelta

from django.test import TestCase

from sso_server.token import create_token

# Create your tests here.


def mess(s: str) -> str:
    """Replace the last character of `s` by another one."""

    if s[-1] != "A":
        return s[:-1] + "A"
    else:
        return s[:-1] + "B"


def generate_fake_tokens(expected_audience: str, expected_username: str) -> dict:
    return {
        "INVALID_SIGNATURE_TOKEN": mess(
            create_token(audience=expected_audience, username=expected_username)
        ),
        "EXPIRED_TOKEN": create_token(
            audience=expected_audience,
            username=expected_username,
            lifetime=timedelta(days=-10),
        ),
        "INVALID_ISSUER_TOKEN": create_token(
            audience=expected_audience, username=expected_username, issuer="piche"
        ),
        "INVALID_AUDIENCE_TOKEN": create_token(
            audience=mess(expected_audience), username=expected_username
        ),
        "INVALID_USER_TOKEN": create_token(
            audience=expected_audience, username=mess(expected_username)
        ),
        "VALID_TOKEN": create_token(
            audience=expected_audience, username=expected_username
        ),
    }
