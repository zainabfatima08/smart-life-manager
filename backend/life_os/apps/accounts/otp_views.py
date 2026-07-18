from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EmailOTP
from .serializers import (
    VerifyOTPSerializer, ResendOTPSerializer, 
    ForgotPasswordOTPSerializer, ResetPasswordWithOTPSerializer
)
from .email_utils import send_otp_email
from .auth_views import get_tokens_for_user

User = get_user_model()

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')

class VerifyEmailOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email'].lower()
        otp = serializer.validated_data['otp']
        
        try:
            email_otp = EmailOTP.objects.filter(
                email=email,
                purpose='verify',
                is_active=True
            ).latest('created_at')

            if not email_otp.is_valid_for_verification():
                if email_otp.is_expired():
                    return Response({
                        'success': False,
                        'errors': {'otp': ['OTP has expired. Please request a new one.']}
                    }, status=status.HTTP_400_BAD_REQUEST)
                elif email_otp.attempt_count >= email_otp.max_attempts:
                    email_otp.is_active = False
                    email_otp.save()
                    return Response({
                        'success': False,
                        'errors': {'otp': ['Maximum verification attempts exceeded. Please resend OTP.']}
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if OTP matches
            if email_otp.otp != otp:
                email_otp.increment_attempt()
                remaining_attempts = email_otp.max_attempts - email_otp.attempt_count
                return Response({
                    'success': False,
                    'errors': {'otp': [f'Invalid OTP. {remaining_attempts} attempts remaining.']}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # OTP is correct
            email_otp.is_verified = True
            email_otp.verified_at = timezone.now()
            email_otp.save()
            
            # Mark user's email as verified
            user = User.objects.get(email=email)
            user.is_active = True
            user.save(update_fields=['is_active'])
            
            # Get tokens for user
            tokens = get_tokens_for_user(user)
            
            return Response({
                'success': True,
                'message': 'Email verified successfully.',
                'tokens': tokens,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                }
            }, status=status.HTTP_200_OK)
        
        except EmailOTP.DoesNotExist:
            return Response({
                'success': False,
                'errors': {'email': ['No OTP found for this email. Please register first.']}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except User.DoesNotExist:
            return Response({
                'success': False,
                'errors': {'email': ['User not found.']}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({
                'success': False,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_400_BAD_REQUEST)


class ResendEmailOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email'].lower()
        purpose = serializer.validated_data['purpose']
        
        try:
            user = User.objects.get(email=email) if purpose == 'verify' else None
            
            recent_otps = EmailOTP.objects.filter(
                email=email,
                purpose=purpose,
                created_at__gte=timezone.now() - timedelta(hours=1),
                is_active=True
            ).count()
            
            if recent_otps >= 3:
                return Response({
                    'success': False,
                    'errors': {'email': ['Too many OTP requests. Please try again later.']}
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Deactivate previous active OTPs
            EmailOTP.objects.filter(
                email=email,
                purpose=purpose,
                is_active=True
            ).update(is_active=False)
            
            # Generate new OTP
            otp_code = EmailOTP.generate_otp()
            otp_expires_at = timezone.now() + timedelta(minutes=10)
            
            # Create OTP record
            email_otp = EmailOTP.objects.create(
                email=email,
                otp=otp_code,
                purpose=purpose,
                user=user,
                expires_at=otp_expires_at
            )
            
            # Send OTP email
            send_otp_email(email, otp_code, purpose)
            
            return Response({
                'success': True,
                'message': f'OTP sent to {email}. Valid for 10 minutes.'
            }, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            if purpose == 'verify':
                return Response({
                    'success': False,
                    'errors': {'email': ['User not found. Please register first.']}
                }, status=status.HTTP_400_BAD_REQUEST)
            else:

                otp_code = EmailOTP.generate_otp()
                otp_expires_at = timezone.now() + timedelta(minutes=10)
                EmailOTP.objects.create(
                    email=email,
                    otp=otp_code,
                    purpose=purpose,
                    expires_at=otp_expires_at
                )
                send_otp_email(email, otp_code, purpose)
                
                return Response({
                    'success': True,
                    'message': f'If an account exists, OTP has been sent.'
                }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ForgotPasswordOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ForgotPasswordOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email'].lower()
        
        try:

            EmailOTP.objects.filter(
                email=email,
                purpose='reset',
                is_active=True
            ).update(is_active=False)
            
            # Generate new OTP
            otp_code = EmailOTP.generate_otp()
            otp_expires_at = timezone.now() + timedelta(minutes=10)
            
            # Create OTP record
            EmailOTP.objects.create(
                email=email,
                otp=otp_code,
                purpose='reset',
                expires_at=otp_expires_at
            )
            
            # Send OTP email
            send_otp_email(email, otp_code, 'reset')
            
            return Response({
                'success': True,
                'message': 'If an account exists, OTP has been sent to the email.'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'success': False,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResetPasswordWithOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordWithOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email'].lower()
        otp = serializer.validated_data['otp']
        password = serializer.validated_data['password']
        
        try:
            email_otp = EmailOTP.objects.filter(
                email=email,
                purpose='reset',
                is_active=True
            ).latest('created_at')
            
            # Check if OTP is valid
            if not email_otp.is_valid_for_verification():
                if email_otp.is_expired():
                    return Response({
                        'success': False,
                        'errors': {'otp': ['OTP has expired. Please request a new one.']}
                    }, status=status.HTTP_400_BAD_REQUEST)
                elif email_otp.attempt_count >= email_otp.max_attempts:
                    email_otp.is_active = False
                    email_otp.save()
                    return Response({
                        'success': False,
                        'errors': {'otp': ['Maximum verification attempts exceeded. Please resend OTP.']}
                    }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if OTP matches
            if email_otp.otp != otp:
                email_otp.increment_attempt()
                remaining_attempts = email_otp.max_attempts - email_otp.attempt_count
                return Response({
                    'success': False,
                    'errors': {'otp': [f'Invalid OTP. {remaining_attempts} attempts remaining.']}
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # OTP is correct - update password
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            
            # Mark OTP as verified
            email_otp.is_verified = True
            email_otp.verified_at = timezone.now()
            email_otp.save()
            
            EmailOTP.objects.filter(
                email=email,
                purpose='reset',
                is_active=True
            ).update(is_active=False)
            
            return Response({
                'success': True,
                'message': 'Password reset successfully. You can now login with your new password.'
            }, status=status.HTTP_200_OK)
        
        except EmailOTP.DoesNotExist:
            return Response({
                'success': False,
                'errors': {'otp': ['No valid OTP found. Please request a new one.']}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except User.DoesNotExist:
            return Response({
                'success': False,
                'errors': {'email': ['User not found.']}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response({
                'success': False,
                'errors': {'detail': str(e)}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
