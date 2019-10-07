from django.contrib.auth import authenticate

from rest_framework import serializers

from sso_server.models import Access
from sso_server.token import create_token_for_user, decode_token


class CreateTokenSerializer(serializers.Serializer):
    """This serializer tries to authenticate the user with the provided password. Then, it returns a JWT."""

    username = serializers.CharField()
    password = serializers.CharField(style={"input_type": "password"}, write_only=True)
    audience = serializers.ChoiceField(choices=Access.AUDIENCES)

    def validate(self, data):
        data = super(CreateTokenSerializer, self).validate(data)

        # Check if the credentials are valid.
        user = authenticate(username=data["username"], password=data["password"])

        if user is None or not user.is_active:
            raise serializers.ValidationError(
                "No active account found with the given credentials"
            )

        # Check if the user is allowed to access the given audience.
        if not Access.objects.filter(user=user, audience=data["audience"]).exists():
            raise serializers.ValidationError(
                "This user is not allowed to access this audience."
            )

        data["access"] = create_token_for_user(user, data["audience"])

        return data


class DecodeTokenSerializer(serializers.Serializer):
    """This Serializer decodes the provided token."""

    token = serializers.CharField()

    def validate(self, data):
        data = super(DecodeTokenSerializer, self).validate(data)
        data.update(decode_token(data["token"]))

        return data
