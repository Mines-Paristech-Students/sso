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

from sso_server.mail import EmailSender


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
                "type": "",
                "detail": ""
            }
        }

        The type of the error can be:
            * INVALID_CREDENTIALS if username or password are missing or cannot authenticate an user.
            * INVALID_AUDIENCE if audience is missing or the user is not allowed to access the audience.
            * UNKNOWN_ERROR for another error. In that case, detail will contain more information about the error.

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
            print(serializer.errors)
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

    Errors:
        Return 400 and:
        {
            "error": {
                "type": "",
                "detail": ""
            }
        }

        The type of the error can be:
            * INVALID_EMAIL: if email is missing or does not appear in the database (including if it is ill-formatted).
            * UNKNOWN_ERROR for another error. In that case, detail will contain more information about the error.

    Success:
        Return 200 and that's all.
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

            # Cancel other PasswordRecovery
            PasswordRecovery.objects.all().update(used=1)

        # Create a PasswordRecovery.
        serializer = PasswordRecoverySerializer(data={"user": user.email})

        if not serializer.is_valid():
            return self.INVALID_EMAIL_ERROR

        passwordrecovery = serializer.save(user=user)

        # SEND THE EMAIL
        email_server = EmailSender("Rezal")
        email_server.connect()
        email_server.send_passwordrecovery_link(user.email, user.first_name + " " + user.last_name,
                                                str(passwordrecovery.id))
        email_server.close()

        # Return nothing.
        return Response("", status=status.HTTP_200_OK)


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
                "type": "",
                "detail": ""
            }
        }

        The type of the error can be:
            * WEAK_PASSWORD if the password is too weak.
            * INVALID_TOKEN if the token does not exist in the database or has expired.
            * UNKNOWN_ERROR for another error. In that case, detail will contain more information about the error.

    Success:
         Return 200 and "".
    """

    permission_classes = ()
    authentication_classes = ()

    def post(self, request, *args, **kwargs):
        serializer = RecoverPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            if "token" in serializer.errors:
                return Response(
                    {"error": {"type": "INVALID_TOKEN", "detail": ""}},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            elif "password" in serializer.errors:
                return Response(
                    {"error": {"type": "WEAK_PASSWORD", "detail": ""}},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            return Response(
                {"error": {"type": "UNKNOWN_ERROR", "detail": serializer.errors}},
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

        return Response("", status=status.HTTP_200_OK)
