from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta
import requests
import json

from .serializers import (
    RegisterSerializer, LoginSerializer, ChangePasswordSerializer,
    UserSerializer, ProfileSerializer
)
from .models import TokenBlacklist, AccountActivity, EmailOTP
from .email_utils import send_otp_email

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token)
    }

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')

# ------------ REGISTER VIEW------------ #

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        

        user = serializer.save()
        user.is_active = False
        user.save(update_fields=['is_active'])
        
        # Generate and send OTP
        from datetime import timedelta
        from .models import EmailOTP
        from .email_utils import send_otp_email
        
        otp_code = EmailOTP.generate_otp()
        otp_expires_at = timezone.now() + timedelta(minutes=10)
        
        EmailOTP.objects.create(
            email=user.email,
            otp=otp_code,
            purpose='verify',
            user=user,
            expires_at=otp_expires_at
        )
        
        try:
            send_otp_email(user.email, otp_code, 'verify')
            print(f"✅ OTP email sent successfully to {user.email}")
        except Exception as e:
            print(f"❌ ERROR sending OTP email to {user.email}: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
        
        # Log activity
        AccountActivity.objects.create(
            user=user,
            activity_type=AccountActivity.ActivityType.LOGIN,
            description='Account created - waiting for email verification',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            'success': True,
            'message': 'Registration successful! OTP has been sent to your email.',
            'data': {
                'email': user.email,
                'message': 'Please verify your email using the OTP sent to your email address.'
            }
        }, status=status.HTTP_201_CREATED)
    
# ------------ LOGIN VIEW------------ #

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        tokens = get_tokens_for_user(user)
        
        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        # Log activity
        AccountActivity.objects.create(
            user=user,
            activity_type=AccountActivity.ActivityType.LOGIN,
            description='User logged in',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            'success': True,
            'message': 'Login successful.',
            'tokens': tokens,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    
# ------------ LOGOUT VIEW------------ #

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            
            if refresh_token:
                token = RefreshToken(refresh_token)
                TokenBlacklist.objects.create(
                    token=str(refresh_token),
                    user=request.user,
                    expires_at=timezone.now() + timedelta(days=14)
                )
            
            # Log activity
            AccountActivity.objects.create(
                user=request.user,
                activity_type=AccountActivity.ActivityType.LOGOUT,
                description='User logged out',
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({
                'success': True,
                'message': 'Logout successful.'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
        
# ------------ CHANGE PASSWORD VIEW------------ #

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        # Log activity
        AccountActivity.objects.create(
            user=user,
            activity_type=AccountActivity.ActivityType.PASSWORD_CHANGE,
            description='Password changed',
            ip_address=get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({
            'success': True,
            'message': 'Password changed successfully.'
        }, status=status.HTTP_200_OK)

# ------------ FORGOT PASSWORD VIEW------------ #

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email', '').lower()
        
        if not email:
            return Response({
                'success': False,
                'errors': {'email': ['Email is required.']}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.filter(email=email).first()
        
        if user:
            try:
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                reset_link = f"{settings.CORS_ALLOWED_ORIGINS[0]}/reset-password?uid={uid}&token={token}"
                
                # Send email with reset link
                from .email_utils import send_password_reset_email
                send_password_reset_email(user.email, reset_link)
                
            except Exception as e:
                return Response({
                    'success': False,
                    'errors': {'detail': 'Error sending email.'}
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': True,
            'message': 'If account exists, password reset link has been sent.'
        }, status=status.HTTP_200_OK)

# ------------ RESET PASSWORD VIEW------------ #

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        try:
            uid = request.data.get('uid')
            token = request.data.get('token')
            password = request.data.get('password')
            confirm_password = request.data.get('confirm_password')
            
            if not all([uid, token, password, confirm_password]):
                return Response({
                    'success': False,
                    'errors': {'detail': 'Missing required fields.'}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if password != confirm_password:
                return Response({
                    'success': False,
                    'errors': {'confirm_password': ['Passwords do not match.']}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)
            
            if not default_token_generator.check_token(user, token):
                return Response({
                    'success': False,
                    'errors': {'token': ['Invalid or expired token.']}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(password)
            user.save(update_fields=['password'])
            
            # Log activity
            AccountActivity.objects.create(
                user=user,
                activity_type=AccountActivity.ActivityType.PASSWORD_CHANGE,
                description='Password reset via email link',
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({
                'success': True,
                'message': 'Password reset successful.'
            }, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({
                'success': False,
                'errors': {'detail': 'Invalid token.'}
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'success': False,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)
        
# ------------ pROFILE VIEW------------ #

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        return Response({
            'success': True,
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
