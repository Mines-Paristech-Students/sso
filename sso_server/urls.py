from django.urls import path

from sso_server.views import LoginView, DecodeView

urlpatterns = [
    path("login/", LoginView.as_view()),
    path("verify/", DecodeView.as_view()),
]
