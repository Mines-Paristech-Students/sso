from datetime import datetime

from django.conf import settings

from sso_server.token import create_token, create_token_for_user, decode_token
from .utils import BaseTestCase


class TestToken(BaseTestCase):
    fixtures = ["test_sso_server.yaml"]

    def test_create_token_decode_token(self):
        """Check if a token created by `create_token` can be decoded with the same payload."""

        expected_payload = {
            "exp": (
                datetime.utcnow() + settings.JWT_AUTH_SETTINGS["ACCESS_TOKEN_LIFETIME"]
            ).timestamp(),
            "iss": "piche",
            "aud": "piche",
            settings.JWT_AUTH_SETTINGS["USER_ID_CLAIM_NAME"]: "17piche",
        }

        expected_token = create_token(
            audience=expected_payload["aud"],
            username=expected_payload[settings.JWT_AUTH_SETTINGS["USER_ID_CLAIM_NAME"]],
            lifetime=settings.JWT_AUTH_SETTINGS["ACCESS_TOKEN_LIFETIME"],
            issuer=expected_payload["iss"],
        )

        payload = decode_token(expected_token)

        # Hopefully, less than three seconds will elapse between the definition of `expected_payload` and the definition
        # of `payload`.
        self.assertAlmostEqual(expected_payload["exp"], payload["exp"], delta=3)
        self.assertEqual(expected_payload["iss"], payload["iss"])
        self.assertEqual(expected_payload["aud"], payload["aud"])
        self.assertEqual(
            expected_payload[settings.JWT_AUTH_SETTINGS["USER_ID_CLAIM_NAME"]],
            payload[settings.JWT_AUTH_SETTINGS["USER_ID_CLAIM_NAME"]],
        )

    def test_if_unknown_audience_then_cannot_create_token(self):
        self.assertRaises(
            ValueError, create_token_for_user, user="piche", audience="piche"
        )
