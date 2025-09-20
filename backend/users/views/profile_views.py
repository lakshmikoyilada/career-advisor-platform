from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from users.models.user import CustomUser
from users.serializers.user_serializer import UserSerializer

import logging
logger = logging.getLogger(__name__)

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint that allows users to view or update their profile.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
        
    def get(self, request, *args, **kwargs):
        try:
            logger.info(f"Fetching profile for user: {request.user.id}")
            return self.retrieve(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error fetching profile: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while fetching profile"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    def update(self, request, *args, **kwargs):
        try:
            logger.info(f"Updating profile for user: {request.user.id}")
            logger.debug(f"Request data: {request.data}")
            
            # Handle file uploads separately
            if 'resume' in request.FILES:
                request.data['resume'] = request.FILES['resume']
            
            # Set partial=True for PATCH requests
            partial = kwargs.pop('partial', False)
            
            # Get the user instance
            instance = self.get_object()
            
            # Create serializer with partial update support
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            
            # Save the user profile
            self.perform_update(serializer)
            
            # Get the updated user data
            if getattr(instance, '_prefetched_objects_cache', None):
                # If 'prefetch_related' has been applied to a queryset, we need to
                # forcibly invalidate the prefetch cache on the instance.
                instance._prefetched_objects_cache = {}
            
            logger.info(f"Profile updated successfully for user: {request.user.id}")
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error updating profile: {str(e)}", exc_info=True)
            error_message = str(e)
            if hasattr(e, 'detail') and isinstance(e.detail, dict):
                # Extract the first error message from the serializer errors
                for field, errors in e.detail.items():
                    if isinstance(errors, list):
                        error_message = f"{field}: {errors[0]}"
                        break
                    else:
                        error_message = f"{field}: {errors}"
                        break
            
            return Response(
                {"error": error_message},
                status=status.HTTP_400_BAD_REQUEST if 'not valid' in str(e).lower() else status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserProfileDetailView(generics.RetrieveAPIView):
    """
    API endpoint to view a user's public profile.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = CustomUser.objects.all()
    lookup_field = 'id'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context