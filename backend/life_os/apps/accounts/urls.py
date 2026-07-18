from django.urls import path
from .auth_views import (
    RegisterView, LoginView, LogoutView, ChangePasswordView,
    ForgotPasswordView, ResetPasswordView, UserProfileView
)
from .otp_views import (
    VerifyEmailOTPView, ResendEmailOTPView, ForgotPasswordOTPView,
    ResetPasswordWithOTPView
)
from .views import (
    ProfileView, ProfileDetailView, ProfileStatisticsView,
    AchievementListView, AchievementCheckView, MilestoneListView,
    ActivityHistoryView, SettingsView, ProfileExportView, ProfileImportView,
    PublicProfileView, ShareProfileView, GoogleOAuthView, GitHubOAuthView
)

urlpatterns = [
    # Authentication Endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('google/', GoogleOAuthView.as_view(), name='google-oauth'),
    path('github/', GitHubOAuthView.as_view(), name='github-oauth'),
    
    # OTP Endpoints
    path('verify-otp/', VerifyEmailOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendEmailOTPView.as_view(), name='resend-otp'),
    path('forgot-password-otp/', ForgotPasswordOTPView.as_view(), name='forgot-password-otp'),
    path('verify-reset-otp/', ResetPasswordWithOTPView.as_view(), name='verify-reset-otp'),
    
    # Profile Management
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/detail/', ProfileDetailView.as_view(), name='profile-detail'),
    path('profile/statistics/', ProfileStatisticsView.as_view(), name='profile-statistics'),
    path('profile/public/<str:username>/', PublicProfileView.as_view(), name='public-profile'),
    
    # Achievements & Milestones
    path('profile/achievements/', AchievementListView.as_view(), name='achievements-list'),
    path('profile/achievements/check/', AchievementCheckView.as_view(), name='achievements-check'),
    path('profile/milestones/', MilestoneListView.as_view(), name='milestones-list'),
    
    # Activity & Settings
    path('profile/activity/', ActivityHistoryView.as_view(), name='activity-history'),
    path('settings/', SettingsView.as_view(), name='settings'),
    
    # Data Management
    path('profile/export/', ProfileExportView.as_view(), name='profile-export'),
    path('profile/import/', ProfileImportView.as_view(), name='profile-import'),
    path('profile/share/', ShareProfileView.as_view(), name='share-profile'),
]