from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, ProfileSerializer

User = get_user_model()

def token_pair(user):
    refresh = RefreshToken.for_user(user)
    return {'refresh': str(refresh), 'access': str(refresh.access_token)}

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({'user': RegisterSerializer(user).data, 'tokens': token_pair(user)}, status=status.HTTP_201_CREATED)

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    def get_object(self):
        return self.request.user.profile

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email = request.data.get('email', '').lower()
        user = User.objects.filter(email=email).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            link = f"{settings.CORS_ALLOWED_ORIGINS[0]}/reset-password?uid={uid}&token={token}"
            send_mail('Reset your Life OS password', f'Reset your password: {link}', settings.DEFAULT_FROM_EMAIL, [email])
        return Response({'detail': 'If the email exists, a reset link has been sent.'})

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        uid = urlsafe_base64_decode(request.data.get('uid')).decode()
        user = User.objects.get(pk=uid)
        if not default_token_generator.check_token(user, request.data.get('token')):
            return Response({'detail': 'Invalid reset token.'}, status=400)
        user.set_password(request.data.get('password'))
        user.save(update_fields=['password'])
        return Response({'detail': 'Password reset complete.'})

class GoogleOAuthView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        credential = request.data.get('credential')
        info = id_token.verify_oauth2_token(credential, requests.Request(), settings.GOOGLE_CLIENT_ID)
        email = info['email'].lower()
        user, _ = User.objects.get_or_create(email=email, defaults={'username': email, 'first_name': info.get('given_name',''), 'last_name': info.get('family_name','')})
        user.profile.avatar_url = info.get('picture', '')
        user.profile.display_name = user.get_full_name() or email.split('@')[0]
        user.profile.save()
        return Response({'tokens': token_pair(user)})