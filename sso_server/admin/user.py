import ast
import pandas as pd
from django import forms, urls
from django.contrib import admin, messages
from django.http import HttpRequest
from django.shortcuts import redirect, render
from django.urls import path

from sso_server.models import Access, User
from django.db import transaction


class AccessInline(admin.TabularInline):
    model = Access
    extra = 0


class CsvImportForm(forms.Form):
    csv_file = forms.FileField()


class UserAdmin(admin.ModelAdmin):
    change_list_template = "admin/user_changelist.html"

    inlines = [
        AccessInline,
    ]

    def get_urls(self):
        urls = super().get_urls()
        my_urls = [
            path("import-csv/", self.import_csv),
        ]
        return my_urls + urls

    def import_csv(self, request: HttpRequest):
        if request.method == "POST":
            csv_file = request.FILES["csv_file"]

            try:
                df = pd.read_csv(csv_file, converters={"audience": ast.literal_eval})
                self.insert_users(df)

                self.message_user(request, "Your csv file has been imported!")
                return redirect(urls.reverse("admin:sso_server_user_changelist"))
            except Exception as e:
                print(e)
                self.message_user(
                    request,
                    "This file cannot be processed: try another",
                    level=messages.ERROR,
                )
                return redirect(request.path_info)

        form = CsvImportForm()
        payload = {"form": form}
        return render(request, "admin/csv_form.html", payload)

    def insert_users(self, df: pd.DataFrame):
        with transaction.atomic():
            User.objects.bulk_create(
                User(**vals)
                for vals in df.loc[:, df.columns != "audience"].to_dict("records")
            )
            # Bulk create does not trigger signals: https://docs.djangoproject.com/en/1.8/ref/models/querysets/#bulk-create
            # TODO: use this method when a bulk post identity route will be created on the portal side
            # Access.objects.bulk_create(
            #     Access(
            #         user=User.objects.get(username=user["username"]),
            #         audience=audience,
            #     )
            #     for user in df.to_dict("records")
            #     for audience in user["audience"]
            # )
            for user in df.to_dict("records"):
                for audience in user["audience"]:
                    access = Access(
                        user=User.objects.get(username=user["username"]),
                        audience=audience,
                    )
                    access.save()
