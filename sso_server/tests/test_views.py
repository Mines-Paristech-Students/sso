from datetime import datetime, timezone

from .utils import BaseTestCase
from sso_server.models import PasswordRecovery


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

        password_recovery = PasswordRecovery.objects.last()
        self.assertEqual(res.data["id"], str(password_recovery.id))
        self.assertEqual(res.data["email"], password_recovery.user.email)
        self.assertEqual(
            datetime.strptime(res.data["created_at"], "%Y-%m-%dT%H:%M:%S.%fZ")
            .replace(tzinfo=timezone.utc)
            .timestamp(),
            password_recovery.created_at.timestamp(),
        )
