from .tests_utils import BaseTestCase


class TestLogin(BaseTestCase):
    fixtures = ["test_sso_server.yaml"]

    endpoint = "/login/"

    def test_no_other_method_than_post(self):
        for method in (self.get, self.patch, self.put, self.delete):
            method(self.endpoint)
            self.assertStatusCode(405)

    def test_unknown_user(self):
        payload = {"username": "17piche", "password": "password", "audience": "portail"}
        self.post(self.endpoint, payload)
        self.assertStatusCode(401)
        self.assertResponseDataEqual("BAD_CREDENTIALS")

    def test_bad_password(self):
        payload = {
            "username": "17admin",
            "password": "blablabla",
            "audience": "portail",
        }
        self.post(self.endpoint, payload)
        self.assertStatusCode(401)
        self.assertResponseDataEqual("BAD_CREDENTIALS")

    def test_unknown_audience(self):
        payload = {"username": "17portail", "password": "password", "audience": "piche"}
        self.post(self.endpoint, payload)
        self.assertStatusCode(401)
        self.assertResponseDataEqual("INVALID_AUDIENCE")

    def test_unauthorized_audience(self):
        payload = {"username": "17portail", "password": "password", "audience": "rezal"}
        self.post(self.endpoint, payload)
        self.assertStatusCode(401)
        self.assertResponseDataEqual("INVALID_AUDIENCE")

        payload = {"username": "17rezal", "password": "password", "audience": "portail"}
        self.post(self.endpoint, payload)
        self.assertStatusCode(401)
        self.assertResponseDataEqual("INVALID_AUDIENCE")

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
