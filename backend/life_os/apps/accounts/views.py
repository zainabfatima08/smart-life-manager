from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
from django.utils import timezone
from django.db.models import Count, Q, Sum, Avg
from google.auth.transport import requests
from google.oauth2 import id_token
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import timedelta
import csv
import json
from io import StringIO, BytesIO
import requests as http_requests

from .serializers import (
    RegisterSerializer, ProfileSerializer, ProfileDetailSerializer,
    AchievementSerializer, MilestoneSerializer, AccountActivitySerializer,
    PublicProfileSerializer
)
from .models import Profile, Achievement, Milestone, AccountActivity

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
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile

class ProfileDetailView(generics.RetrieveUpdateAPIView):
    """Get and update detailed user profile with all settings"""
    serializer_class = ProfileDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile
    
    def perform_update(self, serializer):
        serializer.save()
        # Record activity
        AccountActivity.objects.create(
            user=self.request.user,
            activity_type=AccountActivity.ActivityType.PROFILE_UPDATE,
            description='Profile updated',
            ip_address=self.get_client_ip(),
            user_agent=self.request.META.get('HTTP_USER_AGENT', '')
        )
    
    def get_client_ip(self):
        """Get client IP from request"""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return self.request.META.get('REMOTE_ADDR')

class ProfileStatisticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        from apps.trackers.models import (
            Habit, HabitCompletion, Book, ReadingLog, MoodEntry,
            SleepEntry, FocusSession, Goal, JournalEntry, ExpenseEntry
        )
        
        # Calculate habit statistics
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)
        
        habits = Habit.objects.filter(user=user, is_active=True).count()
        habit_completions_today = HabitCompletion.objects.filter(
            user=user, completed_on=today
        ).count()
        habit_completions_week = HabitCompletion.objects.filter(
            user=user, completed_on__gte=week_ago
        ).count()
        
        # Calculate longest streak
        longest_streak = self._calculate_longest_streak(user)
        current_streak = self._calculate_current_streak(user)
        
        # Books statistics
        books_total = Book.objects.filter(user=user).count()
        books_completed = Book.objects.filter(user=user, finished_on__isnull=False).count()
        pages_read_month = ReadingLog.objects.filter(
            user=user, read_on__gte=month_ago
        ).aggregate(total=Sum('pages_read'))['total'] or 0
        
        # Mood statistics
        mood_avg = MoodEntry.objects.filter(
            user=user, logged_on__gte=week_ago
        ).aggregate(avg=Avg('score'))['avg'] or 0
        
        # Sleep statistics
        sleep_avg = SleepEntry.objects.filter(
            user=user, slept_on__gte=week_ago
        ).aggregate(avg=Avg('duration_minutes'))['avg'] or 0
        
        # Focus statistics
        focus_sessions = FocusSession.objects.filter(
            user=user, started_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        focus_completed = FocusSession.objects.filter(
            user=user, completed=True, started_at__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        # Goals statistics
        goals_active = Goal.objects.filter(user=user, status='in_progress').count()
        goals_completed = Goal.objects.filter(user=user, status='completed').count()
        
        # Journal statistics
        journal_entries = JournalEntry.objects.filter(user=user).count()
        journal_words = JournalEntry.objects.filter(user=user).aggregate(
            total=Sum('word_count')
        )['total'] or 0
        
        # Expense statistics
        expenses_month = ExpenseEntry.objects.filter(
            user=user, entry_type='expense', occurred_on__gte=month_ago
        ).aggregate(total=Sum('amount'))['total'] or 0
        income_month = ExpenseEntry.objects.filter(
            user=user, entry_type='income', occurred_on__gte=month_ago
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        return Response({
            'habits': {
                'total': habits,
                'completed_today': habit_completions_today,
                'completed_this_week': habit_completions_week,
                'longest_streak': longest_streak,
                'current_streak': current_streak,
            },
            'reading': {
                'books_total': books_total,
                'books_completed': books_completed,
                'pages_read_this_month': pages_read_month,
            },
            'wellness': {
                'mood_score_week_avg': round(mood_avg, 1),
                'sleep_hours_week_avg': round(sleep_avg / 60, 1),
            },
            'focus': {
                'sessions_this_month': focus_sessions,
                'sessions_completed': focus_completed,
                'completion_rate': round((focus_completed / focus_sessions * 100) if focus_sessions > 0 else 0, 1),
            },
            'goals': {
                'active': goals_active,
                'completed': goals_completed,
            },
            'journal': {
                'entries': journal_entries,
                'total_words': journal_words,
            },
            'finance': {
                'expenses_month': float(expenses_month),
                'income_month': float(income_month),
                'net_month': float(income_month - expenses_month),
            }
        })
    
    def _calculate_longest_streak(self, user):
        """Calculate longest habit streak"""
        from apps.trackers.models import HabitCompletion
        
        completions = HabitCompletion.objects.filter(
            user=user
        ).order_by('completed_on').values_list('completed_on', flat=True)
        
        if not completions:
            return 0
        
        longest = 1
        current = 1
        prev_date = completions[0]
        
        for date in completions[1:]:
            if (date - prev_date).days == 1:
                current += 1
                longest = max(longest, current)
            else:
                current = 1
            prev_date = date
        
        return longest
    
    def _calculate_current_streak(self, user):
        """Calculate current habit streak"""
        from apps.trackers.models import HabitCompletion
        
        today = timezone.now().date()
        completions = list(HabitCompletion.objects.filter(
            user=user, completed_on__lte=today
        ).order_by('-completed_on').values_list('completed_on', flat=True)[:30])
        
        if not completions:
            return 0
        
        streak = 0
        expected_date = today
        
        for completion_date in completions:
            if completion_date == expected_date:
                streak += 1
                expected_date -= timedelta(days=1)
            else:
                break
        
        return streak

class AchievementListView(generics.ListAPIView):
    """List all achievements for user"""
    serializer_class = AchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Achievement.objects.filter(user=self.request.user)

class AchievementCheckView(APIView):
    """Check and unlock achievements"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        unlocked = []
        
        # Get all user achievements
        achievements = Achievement.objects.filter(user=user, is_unlocked=False)
        
        for achievement in achievements:
            if self._check_achievement(user, achievement):
                achievement.is_unlocked = True
                achievement.unlocked_at = timezone.now()
                achievement.save()
                unlocked.append(AchievementSerializer(achievement).data)
        
        return Response({
            'unlocked_count': len(unlocked),
            'new_achievements': unlocked
        })
    
    def _check_achievement(self, user, achievement):
        """Check if achievement conditions are met"""
        from apps.trackers.models import Habit, Book, Goal, MoodEntry
        
        condition = achievement.unlock_condition
        achievement_type = achievement.achievement_type
        
        if achievement_type == 'habit':
            if condition.get('type') == 'completions':
                count = Habit.objects.filter(user=user, is_active=True).count()
                return count >= condition.get('value', 0)
        
        elif achievement_type == 'reading':
            if condition.get('type') == 'books_completed':
                count = Book.objects.filter(user=user, finished_on__isnull=False).count()
                return count >= condition.get('value', 0)
        
        elif achievement_type == 'goal':
            if condition.get('type') == 'goals_completed':
                count = Goal.objects.filter(user=user, status='completed').count()
                return count >= condition.get('value', 0)
        
        elif achievement_type == 'mood':
            if condition.get('type') == 'mood_entries':
                count = MoodEntry.objects.filter(user=user).count()
                return count >= condition.get('value', 0)
        
        return False

class MilestoneListView(generics.ListAPIView):
    """Get user's milestone journey"""
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Milestone.objects.filter(user=self.request.user)

class ActivityHistoryView(generics.ListAPIView):
    """Get account activity history"""
    serializer_class = AccountActivitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return AccountActivity.objects.filter(user=self.request.user)

class SettingsView(generics.RetrieveUpdateAPIView):
    """Get and update user settings (subset of profile settings)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        profile = request.user.profile
        settings_data = {
            'theme': profile.theme,
            'accent_color': profile.accent_color,
            'selected_companion': profile.selected_companion,
            'show_companion': profile.show_companion,
            'companion_speech_bubbles': profile.companion_speech_bubbles,
            'companion_animation_speed': profile.companion_animation_speed,
            'companion_sound_effects': profile.companion_sound_effects,
            'email_notifications': profile.email_notifications,
            'browser_notifications': profile.browser_notifications,
            'habit_reminders': profile.habit_reminders,
            'goal_reminders': profile.goal_reminders,
            'reading_reminders': profile.reading_reminders,
            'budget_alerts': profile.budget_alerts,
            'weekly_reports': profile.weekly_reports,
            'monthly_reports': profile.monthly_reports,
            'habit_reminder_time': profile.habit_reminder_time,
            'goal_reminder_time': profile.goal_reminder_time,
            'reading_reminder_time': profile.reading_reminder_time,
            'dashboard_layout': profile.dashboard_layout,
            'show_widgets': profile.show_widgets,
            'animations_enabled': profile.animations_enabled,
            'public_profile': profile.public_profile,
            'show_achievements_public': profile.show_achievements_public,
            'show_stats_public': profile.show_stats_public,
            'show_reading_public': profile.show_reading_public,
            'font_size': profile.font_size,
            'reduced_motion': profile.reduced_motion,
            'high_contrast': profile.high_contrast,
        }
        return Response(settings_data)
    
    def put(self, request):
        profile = request.user.profile
        data = request.data
        
        # Update settings
        settable_fields = [
            'theme', 'accent_color', 'selected_companion', 'show_companion',
            'companion_speech_bubbles', 'companion_animation_speed', 'companion_sound_effects',
            'email_notifications', 'browser_notifications', 'habit_reminders', 'goal_reminders',
            'reading_reminders', 'budget_alerts', 'weekly_reports', 'monthly_reports',
            'habit_reminder_time', 'goal_reminder_time', 'reading_reminder_time',
            'dashboard_layout', 'show_widgets', 'animations_enabled',
            'public_profile', 'show_achievements_public', 'show_stats_public', 'show_reading_public',
            'font_size', 'reduced_motion', 'high_contrast'
        ]
        
        for field in settable_fields:
            if field in data:
                setattr(profile, field, data[field])
        
        profile.save()
        
        # Record activity
        AccountActivity.objects.create(
            user=request.user,
            activity_type=AccountActivity.ActivityType.SETTINGS_CHANGE,
            description='Settings updated',
            ip_address=self._get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        return Response({'detail': 'Settings updated successfully'})
    
    def _get_client_ip(self, request):
        """Get client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

class ProfileExportView(APIView):
    """Export user data in CSV, JSON, or PDF format"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        format_type = request.data.get('format', 'json')
        
        if format_type == 'json':
            return self._export_json(request.user)
        elif format_type == 'csv':
            return self._export_csv(request.user)
        elif format_type == 'pdf':
            return self._export_pdf(request.user)
        else:
            return Response({'error': 'Invalid format'}, status=400)
    
    def _export_json(self, user):
        """Export user data as JSON"""
        from apps.trackers.models import (
            Habit, Book, Goal, JournalEntry, ExpenseEntry, MoodEntry
        )
        
        # Get or create profile
        profile, _ = Profile.objects.get_or_create(user=user)
        
        export_data = {
            'user': {
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined.isoformat(),
            },
            'profile': {
                'display_name': profile.display_name,
                'bio': profile.bio,
                'country': profile.country,
                'timezone': profile.timezone,
                'created_at': profile.created_at.isoformat(),
            },
            'habits': list(Habit.objects.filter(user=user).values()),
            'books': list(Book.objects.filter(user=user).values()),
            'goals': list(Goal.objects.filter(user=user).values()),
            'journal_entries': list(JournalEntry.objects.filter(user=user).values()),
            'expenses': list(ExpenseEntry.objects.filter(user=user).values()),
            'mood_entries': list(MoodEntry.objects.filter(user=user).values()),
        }
        
        response = Response(export_data, status=200)
        response['Content-Disposition'] = f'attachment; filename="life_os_export_{user.id}.json"'
        return response
    
    def _export_csv(self, user):
        """Export user profile and stats as CSV"""
        # Get or create profile
        profile, _ = Profile.objects.get_or_create(user=user)
        
        output = StringIO()
        writer = csv.writer(output)
        
        writer.writerow(['User Data Export', timezone.now().strftime('%Y-%m-%d %H:%M:%S')])
        writer.writerow([])
        writer.writerow(['User Information'])
        writer.writerow(['Email', user.email])
        writer.writerow(['Username', user.username])
        writer.writerow(['Display Name', profile.display_name])
        writer.writerow(['Bio', profile.bio])
        writer.writerow(['Country', profile.country])
        writer.writerow(['Date Joined', user.date_joined.strftime('%Y-%m-%d')])
        
        response = Response(output.getvalue(), status=200)
        response['Content-Type'] = 'text/csv'
        response['Content-Disposition'] = f'attachment; filename="life_os_export_{user.id}.csv"'
        return response
    
    def _export_pdf(self, user):
        # Get or create profile
        profile, _ = Profile.objects.get_or_create(user=user)
        
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.pdfgen import canvas
            from io import BytesIO
            
            buffer = BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            
            # Title and metadata
            p.setFont("Helvetica-Bold", 16)
            p.drawString(50, 750, "Life OS - User Data Export")
            
            p.setFont("Helvetica", 10)
            p.drawString(50, 720, f"Generated: {timezone.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
            # User Information Section
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, 680, "User Information")
            p.setFont("Helvetica", 10)
            
            y_position = 660
            p.drawString(60, y_position, f"Email: {user.email}")
            y_position -= 15
            p.drawString(60, y_position, f"Username: {user.username}")
            y_position -= 15
            p.drawString(60, y_position, f"Name: {user.first_name} {user.last_name}".strip())
            y_position -= 15
            p.drawString(60, y_position, f"Member Since: {user.date_joined.strftime('%Y-%m-%d')}")
            
            # Profile Information Section
            y_position -= 25
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y_position, "Profile Information")
            p.setFont("Helvetica", 10)
            
            y_position -= 15
            p.drawString(60, y_position, f"Display Name: {profile.display_name or '(not set)'}")
            y_position -= 15
            p.drawString(60, y_position, f"Country: {profile.country or '(not set)'}")
            y_position -= 15
            p.drawString(60, y_position, f"Timezone: {profile.timezone}")
            y_position -= 20
            p.drawString(50, y_position, f"Bio: {profile.bio or '(no bio)'}")
            
            p.showPage()
            p.save()
            
            buffer.seek(0)
            response = Response(buffer.getvalue(), status=200)
            response['Content-Type'] = 'application/pdf'
            response['Content-Disposition'] = f'attachment; filename="life_os_export_{user.id}.pdf"'
            return response
        except ImportError:
            return Response(
                {
                    'error': 'PDF export requires reportlab package',
                    'message': 'PDF export is currently unavailable. Please use JSON or CSV format instead.',
                    'alternatives': ['Use JSON export for complete data', 'Use CSV export for spreadsheet format'],
                },
                status=400
            )
        except Exception as e:
            return Response(
                {'error': f'PDF generation failed: {str(e)}'},
                status=500
            )

class ProfileImportView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=400)
        
        try:
            content = file.read().decode('utf-8')
            data = json.loads(content)
            
            # Validate and import data
            user = request.user
            if data.get('user', {}).get('email') != user.email:
                return Response({'error': 'Email mismatch'}, status=400)
            
            # Record import activity
            AccountActivity.objects.create(
                user=user,
                activity_type=AccountActivity.ActivityType.PROFILE_UPDATE,
                description='Data imported from backup',
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({'detail': 'Data imported successfully'})
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON file'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    def _get_client_ip(self, request):
        """Get client IP from request"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

class PublicProfileView(APIView):
    """Get public profile view for a user"""
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, username):
        try:
            profile = Profile.objects.get(username=username, public_profile=True)
        except Profile.DoesNotExist:
            return Response({'error': 'Profile not found or not public'}, status=404)
        
        serializer = PublicProfileSerializer(profile)
        return Response(serializer.data)


class ShareProfileView(APIView):
    """Generate and manage profile sharing"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Generate a shareable link for the profile"""
        user = request.user
        
        # Update or create profile with public_profile=True
        profile, _ = Profile.objects.get_or_create(user=user)
        profile.public_profile = True
        profile.save()
        
        share_token = f"{user.id}-{user.username}"
        
        # Return share URL
        share_url = f"/public-profile/{user.username}"
        
        return Response({
            'share_url': share_url,
            'share_token': share_token,
            'message': 'Profile is now shareable'
        }, status=status.HTTP_200_OK)

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        email = request.data.get('email', '').lower()
        user = User.objects.filter(email=email).first()
        if user:
            try:
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                link = f"{settings.CORS_ALLOWED_ORIGINS[0]}/reset-password?uid={uid}&token={token}"
                send_mail('Reset your Life OS password', f'Reset your password: {link}', settings.DEFAULT_FROM_EMAIL, [email])
            except Exception as e:
                print(f'Email send error: {str(e)}')
                pass
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
        code = request.data.get('code')
        
        if credential:
            info = id_token.verify_oauth2_token(credential, requests.Request(), settings.GOOGLE_CLIENT_ID)
            email = info['email'].lower()
        elif code:
            # Explicit authorization code flow
            try:
                token_url = 'https://oauth2.googleapis.com/token'
                token_data = {
                    'client_id': settings.GOOGLE_CLIENT_ID,
                    'client_secret': settings.GOOGLE_CLIENT_SECRET,
                    'code': code,
                    'grant_type': 'authorization_code',
                    'redirect_uri': request.data.get('redirect_uri', f"http://localhost:3000/auth/callback"),
                }
                
                token_response = http_requests.post(token_url, data=token_data)
                token_response.raise_for_status()
                token_info = token_response.json()
                
                if 'error' in token_info:
                    return Response(
                        {'error': f"Google OAuth error: {token_info.get('error_description', 'Unknown error')}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                id_token_str = token_info.get('id_token')
                if not id_token_str:
                    return Response(
                        {'error': 'Failed to obtain Google ID token'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Verify the ID token
                info = id_token.verify_oauth2_token(id_token_str, requests.Request(), settings.GOOGLE_CLIENT_ID)
                email = info['email'].lower()
            
            except http_requests.exceptions.RequestException as e:
                return Response(
                    {'error': f'Google API error: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            except Exception as e:
                return Response(
                    {'error': f'OAuth error: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            return Response(
                {'error': 'Either credential or code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create or get user
        user, _ = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': info.get('given_name', ''),
                'last_name': info.get('family_name', '')
            }
        )
        
        # Update user profile
        user.profile.avatar_url = info.get('picture', '')
        user.profile.display_name = user.get_full_name() or email.split('@')[0]
        user.profile.save()
        
        return Response({'tokens': token_pair(user)})


class GitHubOAuthView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        code = request.data.get('code')
        if not code:
            return Response(
                {'error': 'GitHub authorization code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Exchange code for access token
            token_url = 'https://github.com/login/oauth/access_token'
            token_data = {
                'client_id': settings.GITHUB_CLIENT_ID,
                'client_secret': settings.GITHUB_CLIENT_SECRET,
                'code': code,
            }
            token_headers = {'Accept': 'application/json'}
            
            token_response = http_requests.post(token_url, data=token_data, headers=token_headers)
            token_response.raise_for_status()
            token_info = token_response.json()
            
            if 'error' in token_info:
                return Response(
                    {'error': f"GitHub OAuth error: {token_info.get('error_description', 'Unknown error')}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            access_token = token_info.get('access_token')
            if not access_token:
                return Response(
                    {'error': 'Failed to obtain GitHub access token'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Fetch user profile from GitHub API
            user_url = 'https://api.github.com/user'
            user_headers = {
                'Authorization': f'token {access_token}',
                'Accept': 'application/json'
            }
            
            user_response = http_requests.get(user_url, headers=user_headers)
            user_response.raise_for_status()
            github_user = user_response.json()
            
            email = github_user.get('email')
            if not email:
                # Fetch user emails if primary email not set
                emails_url = 'https://api.github.com/user/emails'
                emails_response = http_requests.get(emails_url, headers=user_headers)
                emails_response.raise_for_status()
                emails_data = emails_response.json()
                
                for email_entry in emails_data:
                    if email_entry.get('primary') or email_entry.get('verified'):
                        email = email_entry.get('email')
                        break
                
                if not email and emails_data:
                    email = emails_data[0].get('email')
            
            if not email:
                return Response(
                    {'error': 'Could not retrieve email from GitHub account. Please ensure your GitHub email is public or verify an email in GitHub settings.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            email = email.lower()
            github_username = github_user.get('login', '')
            github_name = github_user.get('name', '')
            avatar_url = github_user.get('avatar_url', '')
            
            # Create or get user
            user, _ = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'first_name': github_name.split()[0] if github_name else github_username,
                    'last_name': ' '.join(github_name.split()[1:]) if github_name and len(github_name.split()) > 1 else '',
                }
            )
            
            # Update user profile with GitHub info
            user.profile.avatar_url = avatar_url
            user.profile.display_name = github_name or github_username or email.split('@')[0]
            user.profile.save()
            
            # Return JWT tokens
            return Response({'tokens': token_pair(user)})
        
        except http_requests.exceptions.RequestException as e:
            return Response(
                {'error': f'GitHub API error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {'error': f'OAuth error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )