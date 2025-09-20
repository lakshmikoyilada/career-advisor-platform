# users/views/auth_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import transaction
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers
from users.models.user import CustomUser

class SignupView(APIView):
    permission_classes = [AllowAny]
    
    class SignupSerializer(serializers.Serializer):
        name = serializers.CharField(max_length=100)
        email = serializers.EmailField()
        password = serializers.CharField(write_only=True)
    
    @transaction.atomic
    def post(self, request):
        serializer = self.SignupSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        
        # Check if user already exists
        if CustomUser.objects.filter(email=data["email"].lower()).exists():
            return Response(
                {"error": "Email already registered"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create user
            user = CustomUser.objects.create_user(
                email=data["email"].lower(),
                name=data["name"],
                password=data["password"]
            )
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "message": "User created successfully",
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email
                },
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token)
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    class LoginSerializer(serializers.Serializer):
        email = serializers.EmailField()
        password = serializers.CharField()
    
    def post(self, request):
        serializer = self.LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"error": "Invalid data", "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        email = data["email"].lower()
        password = data["password"]
        
        try:
            user = CustomUser.objects.get(email=email)
            if not user.check_password(password):
                raise CustomUser.DoesNotExist
                
            refresh = RefreshToken.for_user(user)
            
            from users.serializers.user_serializer import UserSerializer
            
            # Serialize the user data
            user_data = UserSerializer(user).data
            
            # Add tokens to the response
            response_data = {
                "user": user_data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token)
                }
            }
            
            return Response(response_data)
            
        except CustomUser.DoesNotExist:
            return Response(
                {"error": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )