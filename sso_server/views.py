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
    ChangePasswordSerializer,
)


class LoginView(views.APIView):
    """
    Create a JWT token and set it as a cookie.
    Only accepts the POST method.

    Request:
        {
            "username": "",
            "password": "",
            "audience": ""
        }

    Errors:
        Return 401 and:
        {
            "error": {
                "code": "",
                "details": ""
            }
        }

        The code of the error can be:
            * INVALID_CREDENTIALS if username or password are missing or cannot authenticate an user.
            * INVALID_AUDIENCE if audience is missing or the user is not allowed to access the audience.
            * UNKNOWN_ERROR for another error. In that case, details will contain more information about the error.

    Success:
        Return 200 and:
         {
            "redirect": "https://…"
         }
    """

    permission_classes = ()
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        serializer = CreateTokenSerializer(data=request.data)

        if not serializer.is_valid():
            if "non_field_errors" in serializer.errors:
                error_code = serializer.errors["non_field_errors"][0]

                if error_code in ("INVALID_AUDIENCE", "INVALID_CREDENTIALS"):
                    return Response(
                        {"error": {"code": error_code, "details": ""}},
                        status=status.HTTP_401_UNAUTHORIZED,
                    )
            elif "audience" in serializer.errors:
                return Response(
                    {"error": {"code": "INVALID_AUDIENCE", "details": ""}},
                    status=status.HTTP_401_UNAUTHORIZED,
                )
            elif "username" in serializer.errors or "password" in serializer.errors:
                return Response(
                    {"error": {"code": "INVALID_CREDENTIALS", "details": ""}},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            return Response(
                {"error": {"code": "UNKNOWN_ERROR", "details": serializer.errors}},
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

    Errors:
        Return 400 and:
        {
            "error": {
                "code": "",
                "details": ""
            }
        }

        The code of the error can be:
            * INVALID_EMAIL: if email is missing or does not appear in the database (including if it is ill-formatted).
            * UNKNOWN_ERROR for another error. In that case, details will contain more information about the error.

    Success:
        Return 204 (no content).
    """

    permission_classes = ()
    authentication_classes = ()

    INVALID_EMAIL_ERROR = Response(
        {"error": {"code": "INVALID_EMAIL", "details": ""}},
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

        serializer.save(user=user)

        # TODO: actually send the email...

        # Return nothing.
        return Response(status=status.HTTP_204_NO_CONTENT)


class ResetPasswordView(views.APIView):
    """
    Set a new password after a password request.

    Request:
        {
            "token": "PasswordRecovery id",
            "password": "new_password"
        }

    Errors:
        Return 400 and:
        {
            "error": {
                "code": "",
                "details": ""
            }
        }

        The code of the error can be:
            * WEAK_PASSWORD if the password is too weak.
            * INVALID_TOKEN if the token does not exist in the database or has expired.
            * UNKNOWN_ERROR for another error. In that case, details will contain more information about the error.

    Success:
         Return 204 (no content).
    """

    permission_classes = ()
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        serializer = RecoverPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            if "token" in serializer.errors:
                return Response(
                    {"error": {"code": "INVALID_TOKEN", "details": ""}},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            elif "password" in serializer.errors:
                return Response(
                    {"error": {"code": "WEAK_PASSWORD", "details": ""}},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            return Response(
                {"error": {"code": "UNKNOWN_ERROR", "details": serializer.errors}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get the user, change their password.
        password_recovery = PasswordRecovery.objects.get(
            id=serializer.validated_data["token"]
        )
        password_recovery.user.set_password(serializer.validated_data["password"])
        password_recovery.user.save()

        # Set the password_recovery as `used`.
        password_recovery.used = True
        password_recovery.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(views.APIView):
    """
        Change an user password.

        Request:
            {
                "username": "",
                "old_password": "",
                "new_password": ""
            }

        Errors:
            Return 400 and:
            {
                "error": {
                    "code": "",
                    "details": ""
                }
            }

            The code of the error can be:
                * WEAK_PASSWORD if the password is too weak.
                * INVALID_CREDENTIALS if the pair username / password does not exist in the database.
                * UNKNOWN_ERROR for another error. In that case, details will contain more information about the error.

        Success:
             Return 204 (no content).
        """

    permission_classes = ()
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)

        if not serializer.is_valid():
            if "old_password" in serializer.errors or "username" in serializer.errors:
                return Response(
                    {"error": {"code": "INVALID_CREDENTIALS", "details": ""}},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            elif "new_password" in serializer.errors:
                return Response(
                    {"error": {"code": "WEAK_PASSWORD", "details": ""}},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            elif "non_field_errors" in serializer.errors:
                error = serializer.errors["non_field_errors"][0]

                if error in ("INVALID_CREDENTIALS", "WEAK_PASSWORD"):
                    return Response(
                        {"error": {"code": error, "details": ""}},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            return Response(
                {"error": {"code": "UNKNOWN_ERROR", "details": serializer.errors}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get the user, change their password.
        user = User.objects.get(username=serializer.validated_data["username"])

        user.set_password(serializer.validated_data["new_password"])
        user.save()

        return Response(status=status.HTTP_204_NO_CONTENT)
