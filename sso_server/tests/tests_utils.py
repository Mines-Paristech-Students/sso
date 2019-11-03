from datetime import timedelta

from sso_server.token import create_token


def mess(s: str) -> str:
    """Replace the five last character of `s` by others."""

    if s[-5:] == "AAAAA":
        return s[:-5] + "BBBBB"
    else:
        return s[:-5] + "AAAAA"


def generate_fake_tokens(expected_audience: str, expected_username: str) -> dict:
    return {
        "INVALID_SIGNATURE_TOKEN": mess(  # Mess it!
            create_token(
                audience=expected_audience,
                username=expected_username,
                lifetime=timedelta(days=365 * 100),
            )
        ),
        "EXPIRED_TOKEN": create_token(
            audience=expected_audience,
            username=expected_username,
            lifetime=timedelta(days=-10),  # Wrong parameter.
        ),
        "INVALID_ISSUER_TOKEN": create_token(
            audience=expected_audience,
            username=expected_username,
            issuer="piche",  # Wrong parameter.
            lifetime=timedelta(days=365 * 100),
        ),
        "INVALID_AUDIENCE_TOKEN": create_token(
            audience="piche",  # Wrong parameter.
            username=expected_username,
            lifetime=timedelta(days=365 * 100),
        ),
        "VALID_PICHE_TOKEN": create_token(
            audience=expected_audience,
            username="piche",  # Wrong parameter.
            lifetime=timedelta(days=365 * 100),
        ),
        f"VALID_{expected_username.upper()}_TOKEN": create_token(
            audience=expected_audience,
            username=expected_username,
            lifetime=timedelta(days=365 * 100),
        ),
    }
