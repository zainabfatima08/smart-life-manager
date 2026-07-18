from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class NotificationCategory(models.TextChoices):
    HABIT_REMINDER = 'habit_reminder', 'Habit Reminder'
    GOAL_REMINDER = 'goal_reminder', 'Goal Reminder'
    STUDY_REMINDER = 'study_reminder', 'Study Reminder'
    SLEEP_REMINDER = 'sleep_reminder', 'Sleep Reminder'
    READING_REMINDER = 'reading_reminder', 'Reading Reminder'
    EXPENSE_REMINDER = 'expense_reminder', 'Expense Reminder'
    TIME_CAPSULE_REMINDER = 'time_capsule_reminder', 'Time Capsule Reminder'
    WEEKLY_SUMMARY = 'weekly_summary', 'Weekly Summary'
    MONTHLY_REPLAY = 'monthly_replay', 'Monthly Life Replay'
    AI_MOTIVATION = 'ai_motivation', 'AI Motivation Message'
    ACHIEVEMENT_UNLOCKED = 'achievement_unlocked', 'Achievement Unlocked'
    STREAK_MILESTONE = 'streak_milestone', 'Streak Milestone'
    BUDGET_WARNING = 'budget_warning', 'Budget Warning'
    GOAL_DEADLINE = 'goal_deadline', 'Goal Deadline'
    NEW_INSIGHT = 'new_insight', 'New Insight Generated'


class NotificationPriority(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'


class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    category = models.CharField(max_length=50, choices=NotificationCategory.choices)
    priority = models.CharField(max_length=20, choices=NotificationPriority.choices, default=NotificationPriority.MEDIUM)
    is_read = models.BooleanField(default=False)
    icon = models.CharField(max_length=50, default='Bell')  # Lucide icon name
    action_url = models.CharField(max_length=255, blank=True, null=True)  # URL to navigate to
    metadata = models.JSONField(default=dict, blank=True)  # Additional data (goal_id, habit_id, etc.)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        return f"{self.title} - {self.user.email}"


class NotificationPreference(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preference')
    
    # Reminder preferences
    habit_reminders = models.BooleanField(default=True)
    goal_reminders = models.BooleanField(default=True)
    mood_reminders = models.BooleanField(default=True)
    sleep_reminders = models.BooleanField(default=True)
    focus_reminders = models.BooleanField(default=True)
    reading_reminders = models.BooleanField(default=True)
    expense_reminders = models.BooleanField(default=True)
    study_reminders = models.BooleanField(default=True)
    
    # Summary preferences
    ai_motivation_messages = models.BooleanField(default=True)
    weekly_reports = models.BooleanField(default=True)
    monthly_replay = models.BooleanField(default=True)
    
    # Delivery preferences
    browser_notifications = models.BooleanField(default=True)
    email_notifications = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Notification Preferences - {self.user.email}"
