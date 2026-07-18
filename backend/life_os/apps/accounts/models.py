from django.conf import settings
from django.db import models
from django.utils import timezone
from rest_framework_simplejwt.tokens import Token
import random
import string

class TokenBlacklist(models.Model):
    token = models.TextField(unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='blacklisted_tokens')
    blacklisted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-blacklisted_at']
    
    def __str__(self):
        return f"Token blacklist for {self.user.email}"

class EmailOTP(models.Model):
    EMAIL_PURPOSE_CHOICES = [
        ('verify', 'Email Verification'),
        ('reset', 'Password Reset'),
    ]
    
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=EMAIL_PURPOSE_CHOICES, default='verify')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='email_otps', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    verified_at = models.DateTimeField(null=True, blank=True)
    attempt_count = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=5)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'purpose']),
            models.Index(fields=['otp']),
        ]
    
    def __str__(self):
        return f"OTP for {self.email} ({self.purpose})"
    
    @staticmethod
    def generate_otp():
        return ''.join(random.choices(string.digits, k=6))
    
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    def is_valid_for_verification(self):
        return (
            self.is_active and
            not self.is_expired() and
            self.attempt_count < self.max_attempts and
            not self.is_verified
        )
    
    def increment_attempt(self):
        self.attempt_count += 1
        self.save(update_fields=['attempt_count'])

class Profile(models.Model):
    class Theme(models.TextChoices):
        LIGHT = 'light', 'Light'
        DARK = 'dark', 'Dark'
        SYSTEM = 'system', 'System'
    
    class AccentColor(models.TextChoices):
        BLUE = 'blue', 'Blue'
        INDIGO = 'indigo', 'Indigo'
        PURPLE = 'purple', 'Purple'
        PINK = 'pink', 'Pink'
        GREEN = 'green', 'Green'
    
    # Basic Info
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=120, blank=True)
    username = models.CharField(max_length=120, unique=True, blank=True, null=True)
    bio = models.TextField(max_length=500, blank=True)
    avatar_url = models.URLField(blank=True)
    banner_url = models.URLField(blank=True)
    
    # Profile Details
    country = models.CharField(max_length=120, blank=True)
    timezone = models.CharField(max_length=64, default='UTC')
    preferred_language = models.CharField(max_length=10, default='en')
    
    # Preferences
    theme = models.CharField(max_length=32, choices=Theme.choices, default=Theme.LIGHT)
    accent_color = models.CharField(max_length=32, choices=AccentColor.choices, default=AccentColor.BLUE)
    
    # Companion Settings
    selected_companion = models.CharField(max_length=32, default='astro', choices=[('astro', 'Astro'), ('nova', 'Nova'), ('ember', 'Ember')])
    show_companion = models.BooleanField(default=True)
    companion_speech_bubbles = models.BooleanField(default=True)
    companion_animation_speed = models.IntegerField(default=1, choices=[(1, 'Normal'), (2, 'Fast'), (3, 'Faster')])
    companion_sound_effects = models.BooleanField(default=True)
    
    # Notification Preferences
    email_notifications = models.BooleanField(default=True)
    browser_notifications = models.BooleanField(default=True)
    habit_reminders = models.BooleanField(default=True)
    goal_reminders = models.BooleanField(default=True)
    reading_reminders = models.BooleanField(default=True)
    budget_alerts = models.BooleanField(default=True)
    weekly_reports = models.BooleanField(default=True)
    monthly_reports = models.BooleanField(default=True)
    
    # Notification Times
    habit_reminder_time = models.TimeField(default='09:00')
    goal_reminder_time = models.TimeField(default='18:00')
    reading_reminder_time = models.TimeField(default='20:00')
    
    # Dashboard Preferences
    dashboard_layout = models.CharField(max_length=32, default='grid', choices=[('grid', 'Grid'), ('compact', 'Compact')])
    show_widgets = models.JSONField(default=dict, blank=True)  # Store widget visibility
    animations_enabled = models.BooleanField(default=True)
    
    # Privacy & Security
    public_profile = models.BooleanField(default=False)
    show_achievements_public = models.BooleanField(default=True)
    show_stats_public = models.BooleanField(default=True)
    show_reading_public = models.BooleanField(default=True)
    
    # Accessibility
    font_size = models.CharField(max_length=32, default='normal', choices=[('small', 'Small'), ('normal', 'Normal'), ('large', 'Large')])
    reduced_motion = models.BooleanField(default=False)
    high_contrast = models.BooleanField(default=False)
    
    # Profile Completion
    profile_completion_percent = models.IntegerField(default=0)
    
    # Account Info
    onboarding_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.display_name or self.user.email or self.user.username
    
    def calculate_profile_completion(self):
        completed_fields = 0
        total_fields = 8
        
        if self.avatar_url:
            completed_fields += 1
        if self.bio:
            completed_fields += 1
        if self.country:
            completed_fields += 1
        if self.display_name:
            completed_fields += 1
        if self.username:
            completed_fields += 1
        if self.selected_companion:
            completed_fields += 1
        if self.user.email:
            completed_fields += 1
        if self.timezone != 'UTC':
            completed_fields += 1
        
        self.profile_completion_percent = round((completed_fields / total_fields) * 100)
        return self.profile_completion_percent


class Achievement(models.Model):
    class AchievementType(models.TextChoices):
        HABIT = 'habit', 'Habit'
        MOOD = 'mood', 'Mood'
        SLEEP = 'sleep', 'Sleep'
        FOCUS = 'focus', 'Focus'
        READING = 'reading', 'Reading'
        EXPENSE = 'expense', 'Expense'
        JOURNAL = 'journal', 'Journal'
        GOAL = 'goal', 'Goal'
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    badge_name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    icon_name = models.CharField(max_length=64)
    achievement_type = models.CharField(max_length=32, choices=AchievementType.choices)
    unlock_condition = models.JSONField()  # Store condition logic
    unlocked_at = models.DateTimeField(null=True, blank=True)
    is_unlocked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'badge_name')
    
    def __str__(self):
        return f"{self.badge_name} - {self.user}"


class Milestone(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    milestone_type = models.CharField(max_length=64)  # 'first_habit', 'streak_7', etc.
    icon_name = models.CharField(max_length=64)
    achieved_at = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)  # Store additional data
    
    class Meta:
        ordering = ['-achieved_at']
    
    def __str__(self):
        return f"{self.title} - {self.user}"


class AccountActivity(models.Model):
    class ActivityType(models.TextChoices):
        LOGIN = 'login', 'Login'
        LOGOUT = 'logout', 'Logout'
        PASSWORD_CHANGE = 'password_change', 'Password Changed'
        EMAIL_CHANGE = 'email_change', 'Email Changed'
        DEVICE_LOGIN = 'device_login', 'Device Login'
        PROFILE_UPDATE = 'profile_update', 'Profile Updated'
        SETTINGS_CHANGE = 'settings_change', 'Settings Changed'
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='account_activities')
    activity_type = models.CharField(max_length=32, choices=ActivityType.choices)
    description = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    device_name = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.activity_type} - {self.user}"