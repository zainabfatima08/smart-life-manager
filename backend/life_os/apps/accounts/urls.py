from django.urls import path
from .views import RegisterView, ProfileView, ForgotPasswordView, ResetPasswordView, GoogleOAuthView
urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('forgot-password/', ForgotPasswordView.as_view()),
    path('reset-password/', ResetPasswordView.as_view()),
    path('google/', GoogleOAuthView.as_view()),
]