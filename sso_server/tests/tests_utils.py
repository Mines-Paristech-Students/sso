from datetime import timedelta

from rest_framework.test import APITestCase

from sso_server.token import create_token


class BaseTestCase(APITestCase):
    """
        This test base provides convenient `get`, `post`, etc. shortcut methods to the corresponding
        `self.client.xxx` methods.
        When using these methods, the URLs must be shortened from `/api/v1/some/endpoint/` to `/some/endpoint/`.
    """

    api_base = "/api/v1"

    def __init__(self, *args, **kwargs):
        super(BaseTestCase, self).__init__(*args, **kwargs)
        self._res = None

    def _prepare_message(self, user_msg):
        msg = ""

        if hasattr(self._res, "url"):
            msg += f"URL: {self._res.url}\n"
        if hasattr(self._res, "content"):
            msg += f"Content: {self._res.content}\n"

        return msg + f"\n{user_msg}"

    def assertStatusCode(self, status_code, user_msg=""):
        self.assertIsNotNone(self._res, msg="No request was made.")

        self.assertEqual(
            self._res.status_code, status_code, msg=self._prepare_message(user_msg)
        )

    def assertStatusCodeIn(self, status_codes, user_msg=""):
        self.assertIsNotNone(self._res, msg="No request was made.")

        self.assertIn(
            self._res.status_code, status_codes, msg=self._prepare_message(user_msg)
        )

    def assertResponseDataEqual(self, data, user_msg=""):
        self.assertIsNotNone(self._res, msg="No request was made.")
        self.assertEqual(self._res.data, data, msg=self._prepare_message(user_msg))

    def get(self, url, data=None):
        self._res = self.client.get(self.api_base + url, data)
        return self._res

    def post(self, url, data=None, format="json"):
        self._res = self.client.post(self.api_base + url, data, format=format)
        return self._res

    def patch(self, url, data=None, format="json"):
        self._res = self.client.patch(self.api_base + url, data, format=format)
        return self._res

    def put(self, url, data=None, format="json"):
        self._res = self.client.put(self.api_base + url, data, format=format)
        return self._res

    def delete(self, url):
        self._res = self.client.delete(self.api_base + url)
        return self._res

    def head(self, url, data=None):
        self._res = self.client.head(self.api_base + url, data)
        return self._res

    def options(self, url, data=None):
        self._res = self.client.options(self.api_base + url, data)
        return self._res


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
