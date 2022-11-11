from django.conf import settings
from django.forms.models import model_to_dict
from requests import post


class IdentityWebhookService:
    IDENTITY_WEBHOOK_URLS: dict = settings.IDENTITY_WEBHOOK_URLS
    IDENTITY_API_KEYS: dict = settings.IDENTITY_API_KEYS

    @classmethod
    def post_identity(self, user, audience):
        if (
            audience not in self.IDENTITY_WEBHOOK_URLS.keys()
            or audience not in self.IDENTITY_API_KEYS.keys()
        ):
            return

        minimal_identity = model_to_dict(
            user,
            fields=(
                "username",
                "is_staff",
                "is_active",
                "email",
                "first_name",
                "last_name",
            ),
        )
        minimal_identity["id"] = minimal_identity["username"]

        hook_url = self.IDENTITY_WEBHOOK_URLS[audience]
        api_key = self.IDENTITY_API_KEYS[audience]

        audience_response = post(
            hook_url, json=minimal_identity, headers={"X-Api-Key": api_key}
        )

        if audience_response.status_code == 201:
            print(
                f"Minimal identity created. Audience: {audience}. Response: {audience_response.text}"
            )
        else:
            print(
                f"Failed: minimal identity creation. Audience: {audience}. Response: {audience_response.status_code} {audience_response.text}"
            )
