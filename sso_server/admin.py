from django.contrib import admin

from sso_server.models import Access, PasswordRecovery, User

admin.site.register(User)
admin.site.register(Access)
admin.site.register(PasswordRecovery)
