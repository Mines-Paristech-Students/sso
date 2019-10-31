from django.conf import settings
from rest_framework import generics, status
from rest_framework.response import Response

from sso_server.serializers import CreateTokenSerializer, DecodeTokenSerializer


class LoginView(generics.GenericAPIView):
    """Create a JWT token and set it as a cookie."""

    serializer_class = CreateTokenSerializer
    permission_classes = ()
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            if (
                "non_field_errors" in serializer.errors
                and len(serializer.errors["non_field_errors"]) > 0
            ):
                return Response(
                    serializer.errors["non_field_errors"][0],
                    status=status.HTTP_401_UNAUTHORIZED,
                )

        audience = serializer.validated_data["audience"]
        access = serializer.validated_data["access"]  # The JWT token.

        # Compute the redirect URL with the JWT token as a GET parameter.
        base_url = settings.JWT_AUTH_SETTINGS["REDIRECT_URLS"][audience]
        parameter = f"{settings.JWT_AUTH_SETTINGS['GET_PARAMETER']}={access}"
        redirect_url = f"{base_url}?{parameter}"

        return Response({"redirect": redirect_url}, status=status.HTTP_200_OK)


class DecodeView(generics.GenericAPIView):
    """Decode a JWT token."""

    serializer_class = DecodeTokenSerializer
    permission_classes = ()
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)
