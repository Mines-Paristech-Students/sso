from django.contrib import admin

from sso_server.admin.user import UserAdmin
from sso_server.models import Access, PasswordRecovery, User

admin.site.register(User, UserAdmin)
admin.site.register(Access)
admin.site.register(PasswordRecovery)
