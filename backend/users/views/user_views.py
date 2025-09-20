from rest_framework import generics
from rest_framework.permissions import AllowAny # Or IsAuthenticated, depending on your needs
from users.models.user import CustomUser
from users.serializers.user_serializer import UserSerializer

class UserListView(generics.ListAPIView):
    """
    API view to list all CustomUser instances.
    """
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # For testing, allowing any access. Consider IsAuthenticated for production.