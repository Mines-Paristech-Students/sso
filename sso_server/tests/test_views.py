from datetime import datetime, timezone

from django.contrib.auth import authenticate

from sso_server.models import PasswordRecovery
from .utils import BaseTestCase


class TestLogin(BaseTestCase):
    endpoint = "/login/"

    def test_no_other_method_than_post(self):
        for method in (self.get, self.patch, self.put, self.delete):
            method(self.endpoint)
            self.assertStatusCode(405)

    def test_incomplete_payload(self):
        for payload in [
            {},
            {"username": "17piche"},
            {"password": "password"},
            {"audience": "portail"},
            {"password": "password", "audience": "portail"},
            {"username": "17piche", "audience": "portail"},
            {"username": "17piche", "password": "password"},
            {"username": "17piche", "password": "password", "audience": "portail"},
        ]:
            self.post(self.endpoint, payload)
            self.assertStatusCode(401)

    def test_unknown_user(self):
        payload = {"username": "17piche", "password": "password", "audience": "portail"}
        self.post(self.endpoint, payload)
        self.assertStatusCode(401)
        self.assertResponseDataEqual(
            {"error": {"type": "INVALID_CREDENTIALS", "detail": ""}}
        )

    def test_bad_password(self):
        payload = {
            "username": "17admin",
            "password": "blablabla",
            "audience": "portail",
        }
        self.post(self.endpoint, payload)
        self.assertStatusCode(401)
        self.assertResponseDataEqual(
            {"error": {"type": "INVALID_CREDENTIALS", "detail": ""}}
        )

    def test_unknown_audience(self):
        payload = {"username": "17portail", "password": "password", "audience": "piche"}
        self.post(self.endpoint, payload)
        self.assertStatusCode(401)
        self.assertResponseDataEqual(
            {"error": {"type": "INVALID_AUDIENCE", "detail": ""}}
        )

    def test_unauthorized_audience(self):
        payload = {"username": "17portail", "password": "password", "audience": "rezal"}
        self.post(self.endpoint, payload)
        self.assertStatusCode(401)
        self.assertResponseDataEqual(
            {"error": {"type": "INVALID_AUDIENCE", "detail": ""}}
        )

        payload = {"username": "17rezal", "password": "password", "audience": "portail"}
        self.post(self.endpoint, payload)
        self.assertStatusCode(401)
        self.assertResponseDataEqual(
            {"error": {"type": "INVALID_AUDIENCE", "detail": ""}}
        )

    def test_successful_login(self):
        payload = {
            "username": "17portail",
            "password": "password",
            "audience": "portail",
        }
        res = self.post(self.endpoint, payload)
        self.assertStatusCode(200)
        self.assertSetEqual({"redirect"}, set(res.data.keys()))

        payload = {"username": "17rezal", "password": "password", "audience": "rezal"}
        res = self.post(self.endpoint, payload)
        self.assertStatusCode(200)
        self.assertSetEqual({"redirect"}, set(res.data.keys()))


class TestRequestPasswordRecovery(BaseTestCase):
    endpoint = "/password/recover/request/"

    def test_no_other_method_than_post(self):
        for method in (self.get, self.patch, self.put, self.delete):
            method(self.endpoint)
            self.assertStatusCode(405)

    def test_invalid_email(self):
        for payload in [
            {},
            {"email": ""},
            {"email": "17admin@mpt.fr; DROP DATABASE sso; --"},
        ]:
            self.post(self.endpoint, payload)
            self.assertStatusCode(400)
            self.assertResponseDataEqual(
                {"error": {"type": "INVALID_EMAIL", "detail": ""}}
            )

    def test_unknown_email(self):
        payload = {"email": "17unknown@mpt.fr"}
        self.post(self.endpoint, payload)
        self.assertStatusCode(400)
        self.assertResponseDataEqual({"error": {"type": "INVALID_EMAIL", "detail": ""}})

    def test_successful_request(self):
        payload = {"email": "17admin@mpt.fr"}
        res = self.post(self.endpoint, payload)
        self.assertStatusCode(200)

        self.assertEqual(1, PasswordRecovery.objects.count())

        # We DON'T want the token to be sent back to the client, only to the user's email address.
        self.assertNotIn("token", res.data)


class TestRecoverPassword(BaseTestCase):
    endpoint = "/password/recover/set_password/"
    request_endpoint = "/password/recover/request/"

    def get_token(self):
        payload = {"email": "17admin@mpt.fr"}
        return self.post(self.request_endpoint, payload).data["token"]

    def test_no_other_method_than_post(self):
        for method in (self.get, self.patch, self.put, self.delete):
            method(self.endpoint)
            self.assertStatusCode(405)

    def test_incomplete_payload(self):
        for payload in [
            {},
            {"token": "c8d9e171-2795-4eee-9ad5-ee3c71065f13"},
            {"password": "A password which should be more than twelve characters."},
        ]:
            self.post(self.endpoint, payload)
            self.assertStatusCode(400)

    def test_bad_token(self):
        for payload in [
            {
                "token": "This is definitely not an UUID.",
                "password": "A password which should be more than twelve characters.",
            },
            {"token": "c8d9e171-2795-4eee-9ad5-ee3c71065f13", "password": "password"},
        ]:
            self.post(self.endpoint, payload)
            self.assertStatusCode(400)
            self.assertResponseDataEqual(
                {"error": {"type": "INVALID_TOKEN", "detail": ""}}
            )

    def test_weak_password(self):
        payload = {"token": self.get_token(), "password": "short"}
        self.post(self.endpoint, payload)
        self.assertStatusCode(400)
        self.assertResponseDataEqual({"error": {"type": "WEAK_PASSWORD", "detail": ""}})
        self.assertIsNotNone(authenticate(username="17admin", password="password"))

    def test_can_set_password(self):
        payload = {"token": self.get_token(), "password": "mynewpasswordislong"}
        self.post(self.endpoint, payload)
        self.assertStatusCode(200)

        self.assertIsNone(authenticate(username="17admin", password="password"))
        self.assertIsNotNone(
            authenticate(username="17admin", password="mynewpasswordislong")
        )
