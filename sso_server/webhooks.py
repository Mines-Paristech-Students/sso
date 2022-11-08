from django.conf import settings
from django.forms.models import model_to_dict
from requests import post


class IdentityWebhookService:
    IDENTITY_WEBHOOK_URLS = settings.IDENTITY_WEBHOOK_URLS
    AUDIENCES = IDENTITY_WEBHOOK_URLS.keys()

    @classmethod
    def post_identity(self, user, audience):
        if audience not in self.AUDIENCES:
            return

        hook_url = self.IDENTITY_WEBHOOK_URLS[audience]
        audience_response = post(
            hook_url,
            json=model_to_dict(
                user,
                fields=(
                    "id",
                    "username",
                    "is_staff",
                    "is_active",
                    "email",
                    "first_name",
                    "last_name",
                ),
            ),
        )

        if audience_response.status_code == 201:
            print(
                f"Minimal identity created. Audience: {audience}. Response: {audience_response.text}"
            )
        else:
            print(
                f"Failed: minimal identity creation. Audience: {audience}. Response: {audience_response.status_code} {audience_response.text}"
            )
