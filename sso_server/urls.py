from django.urls import path

from rest_framework_sso.views import obtain_session_token, obtain_authorization_token

urlpatterns = [
    path("session/", obtain_session_token),
    path("authorize/", obtain_authorization_token),
]
