from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.core.validators import EmailValidator
from rest_framework import views, status
from rest_framework.response import Response

from sso_server.models import PasswordRecovery, User
from sso_server.serializers import (
    CreateTokenSerializer,
    DecodeTokenSerializer,
    RecoverPasswordSerializer,
    PasswordRecoverySerializer,
)


class LoginView(views.APIView):
    """
    Create a JWT token and set it as a cookie.

    Request:
        {
            "username": "username",
            "password": "password",
            "audience": "audience"
        }

    Return:
         * INVALID_CREDENTIALS if the password does not match.
         * INVALID_AUDIENCE if the user is not allowed to access the audience.
         * UNKNOWN_ERROR for all the other errors (often when a field is missing).
         * {"redirect": "https://…"} if the login is successful.
    """

    permission_classes = ()
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        serializer = CreateTokenSerializer(data=request.data)

        if not serializer.is_valid():
            if "non_field_errors" in serializer.errors:
                error_type = serializer.errors["non_field_errors"][0]

                if error_type in ("INVALID_AUDIENCE", "INVALID_CREDENTIALS"):
                    return Response(
                        {"error": {"type": error_type, "detail": ""}},
                        status=status.HTTP_401_UNAUTHORIZED,
                    )
            elif "audience" in serializer.errors:
                return Response(
                    {"error": {"type": "INVALID_AUDIENCE", "detail": ""}},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            elif "username" in serializer.errors or "password" in serializer.errors:
                return Response(
                    {"error": {"type": "INVALID_CREDENTIALS", "detail": ""}},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            return Response(
                {"error": {"type": "UNKNOWN_ERROR", "detail": serializer.errors}},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        audience = serializer.validated_data["audience"]
        token = serializer.validated_data["token"]  # The JWT token.

        # Compute the redirect URL with the JWT token as a GET parameter.
        base_url = settings.JWT_AUTH_SETTINGS["REDIRECT_URLS"][audience]
        parameter = f"?{settings.JWT_AUTH_SETTINGS['GET_PARAMETER']}={token}"
        redirect_url = base_url + parameter

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


class RequestPasswordRecoveryView(views.APIView):
    """
    Create a password recovery request.

    Request:
        {
            "email": "email"
        }

    Return:
        * INVALID_EMAIL: if the email does not appear in the database (including if it is ill-formatted).
        * UNKNOWN_ERROR.
    """

    permission_classes = ()
    authentication_classes = ()

    INVALID_EMAIL_ERROR = Response(
        {"error": {"type": "INVALID_EMAIL", "detail": ""}},
        status=status.HTTP_400_BAD_REQUEST,
    )

    def post(self, request, *args, **kwargs):
        email = request.data.get("email", None)

        # Validate the email address.
        try:
            EmailValidator(email)
        except ValidationError:
            return self.INVALID_EMAIL_ERROR

        # Retrieve the user linked to this email address.
        try:
            user = User.objects.get(email=email)
        except ObjectDoesNotExist:
            return self.INVALID_EMAIL_ERROR

        # Create a PasswordRecovery.
        serializer = PasswordRecoverySerializer(data={"user": user.email})

        if not serializer.is_valid():
            return self.INVALID_EMAIL_ERROR

        password_recovery = serializer.save(user=user)

        # TODO: actually send the email...

        # Return the new PasswordRecovery.
        return Response(
            serializer.to_representation(password_recovery), status=status.HTTP_200_OK
        )


class RecoverPasswordView(views.APIView):
    """
    Set a new password after a password request.

    Request:
        {
            "token": "PasswordRecovery id",
            "password": "new_password"
        }

    Return:
         * WEAK_PASSWORD if the password is too weak.
         * INVALID_TOKEN if the token does not exist in the database.
         * TOKEN_EXPIRED if the token is expired.
         * UNKNOWN_ERROR for all the other errors.
         * PASSWORD_CHANGED if the password has been successfully changed.
    """

    permission_classes = ()
    authentication_classes = ()

    WEAK_PASSWORD_ERROR = Response(
        {"error": {"type": "WEAK_PASSWORD", "detail": ""}},
        status=status.HTTP_400_BAD_REQUEST,
    )
    INVALID_TOKEN_ERROR = Response(
        {"error": {"type": "INVALID_TOKEN", "detail": ""}},
        status=status.HTTP_400_BAD_REQUEST,
    )
    TOKEN_EXPIRED_ERROR = Response(
        {"error": {"type": "TOKEN_EXPIRED", "detail": ""}},
        status=status.HTTP_400_BAD_REQUEST,
    )
    UNKNOWN_ERROR = Response(
        {"error": {"type": "UNKNOWN_ERROR", "detail": ""}},
        status=status.HTTP_400_BAD_REQUEST,
    )
    PASSWORD_CHANGED = Response(
        {"result": "PASSWORD_CHANGED"}, status=status.HTTP_200_OK
    )

    def post(self, request, *args, **kwargs):
        serializer = RecoverPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            if "token" in serializer.errors:
                if serializer.errors["token"][0] in (
                    "Must be a valid UUID.",
                    "INVALID_TOKEN",
                ):
                    return self.INVALID_TOKEN_ERROR
                elif serializer.errors["token"][0] in ("TOKEN_EXPIRED",):
                    return self.TOKEN_EXPIRED_ERROR
            elif "password" in serializer.errors:
                if serializer.errors["password"][0] in ("WEAK_PASSWORD",):
                    return self.WEAK_PASSWORD_ERROR

            return self.UNKNOWN_ERROR

        # Get the user, change their password.
        password_recovery = PasswordRecovery.objects.get(
            id=serializer.validated_data["token"]
        )
        password_recovery.user.set_password(serializer.validated_data["password"])
        password_recovery.user.save()

        # Set the password_recovery as `used`.
        password_recovery.used = True
        password_recovery.save()

        return self.PASSWORD_CHANGED
