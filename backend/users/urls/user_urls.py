# users/urls/user_urls.py
from django.urls import path
from ..views.auth_views import SignupView, LoginView
from users.views.user_views import UserListView
from users.views.profile_views import UserProfileView, UserProfileDetailView

urlpatterns = [
    # Authentication
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    
    # User management
    path("users/", UserListView.as_view(), name="user-list"),
    
    # Profile management
    path("profile/", UserProfileView.as_view(), name="user-profile"),
    path("profile/<int:id>/", UserProfileDetailView.as_view(), name="user-profile-detail"),
]