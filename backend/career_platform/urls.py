# career_platform/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include([
        path("auth/", include([
            path("", include("users.urls.user_urls")),  # This will include the login and signup URLs
            path("login/", include("users.urls.user_urls")),  # This will include the login URL
            path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
        ])),
    ])),
]