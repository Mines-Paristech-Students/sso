from django.urls import path

from sso_server.views import (
    LoginView,
    DecodeView,
    ResetPasswordView,
    RequestPasswordRecoveryView,
)

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("verify/", DecodeView.as_view()),
    path("password/recover/request/", RequestPasswordRecoveryView.as_view()),
    path("password/recover/reset/", ResetPasswordView.as_view()),
]
