from django.contrib.auth import authenticate
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers

from sso_server.models import Access, PasswordRecovery
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
            raise serializers.ValidationError("BAD_CREDENTIALS")

        # Check if the user is allowed to access the given audience.
        if not Access.objects.filter(user=user, audience=data["audience"]).exists():
            raise serializers.ValidationError("UNAUTHORIZED_AUDIENCE")

        data["access"] = create_token_for_user(user, data["audience"])

        return data


class DecodeTokenSerializer(serializers.Serializer):
    """This Serializer decodes the provided token."""

    token = serializers.CharField()

    def validate(self, data):
        data = super(DecodeTokenSerializer, self).validate(data)
        data.update(decode_token(data["token"]))

        return data


class PasswordRecoverySerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordRecovery
        read_only_fields = ("id", "created_at")
        fields = read_only_fields + ("user",)

    def to_representation(self, instance):
        data = super(PasswordRecoverySerializer, self).to_representation(instance)

        data["email"] = data["user"]
        del data["user"]

        return data


class RequestPasswordRecoverySerializer(serializers.Serializer):
    email = serializers.EmailField()


class RecoverPasswordSerializer(serializers.Serializer):
    """
    This serializer gets a password and a token. Data will be validated iff the token matches
    a valid PasswordRecovery id.
    """

    token = serializers.UUIDField()
    password = serializers.CharField()

    def validate_token(self, value):
        try:
            password_recovery = PasswordRecovery.objects.get(id=value)
        except ObjectDoesNotExist:
            raise serializers.ValidationError("INVALID_TOKEN")

        if not password_recovery.is_valid:
            raise serializers.ValidationError("TOKEN_EXPIRED")

        return value
