from datetime import timedelta

from django.utils import timezone

from sso_server.models import PasswordRecovery
from .tests_utils import BaseTestCase


class TestPasswordRecovery(BaseTestCase):
    fixtures = ["test_sso_server.yaml"]

    def test_if_too_old_then_not_valid(self):
        created_at = timezone.now() - timedelta(minutes=100)
        password_recovery = PasswordRecovery(created_at=created_at)
        self.assertEqual(password_recovery.created_at, created_at)
        self.assertFalse(password_recovery.is_valid)

    def test_if_used_then_not_valid(self):
        password_recovery = PasswordRecovery(used=True)
        self.assertTrue(password_recovery.used)
        self.assertFalse(password_recovery.is_valid)

    def test_if_recent_and_not_used_then_valid(self):
        for minutes in range(0, 60, 10):
            created_at = timezone.now() - timedelta(minutes=minutes)
            password_recovery = PasswordRecovery(created_at=created_at)

            self.assertEqual(password_recovery.created_at, created_at)
            self.assertFalse(password_recovery.used)

            self.assertTrue(password_recovery.is_valid)
