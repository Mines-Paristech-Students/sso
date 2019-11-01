from django.conf import settings
from rest_framework import views, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from sso_server.serializers import CreateTokenSerializer, DecodeTokenSerializer


class LoginView(views.APIView):
    """Create a JWT token and set it as a cookie."""

    permission_classes = ()
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        serializer = CreateTokenSerializer(data=request.data)
        if not serializer.is_valid():
            # This will return BAD_CREDENTIALS or UNAUTHORIZED_AUDIENCE.
            if (
                    "non_field_errors" in serializer.errors
                    and len(serializer.errors["non_field_errors"]) > 0
            ):
                return Response(
                    serializer.errors["non_field_errors"][0],
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            elif "audience" in serializer.errors and len(serializer.errors["audience"]) > 0:
                raise ValidationError("INVALID_AUDIENCE")
            else:
                raise ValidationError("UNKNOWN_ERROR")

        audience = serializer.validated_data["audience"]
        access = serializer.validated_data["access"]  # The JWT token.

        # Compute the redirect URL with the JWT token as a GET parameter.
        base_url = settings.JWT_AUTH_SETTINGS["REDIRECT_URLS"][audience]
        parameter = f"{settings.JWT_AUTH_SETTINGS['GET_PARAMETER']}={access}"
        redirect_url = f"{base_url}?{parameter}"

        return Response({"redirect": redirect_url}, status=status.HTTP_200_OK)


class DecodeView(views.APIView):
    """Decode a JWT token."""

    permission_classes = ()
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        serializer = DecodeTokenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)
