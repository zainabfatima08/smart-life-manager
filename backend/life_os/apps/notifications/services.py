"""
Notification service for creating and managing notifications
"""
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import Notification, NotificationCategory, NotificationPriority

User = get_user_model()


class NotificationService:
    """Service for creating and managing notifications"""

    @staticmethod
    def create_notification(
        user,
        title: str,
        message: str,
        category: str,
        priority: str = NotificationPriority.MEDIUM,
        icon: str = 'Bell',
        action_url: str = None,
        metadata: dict = None,
    ) -> Notification:
        """Create a single notification"""
        notification = Notification.objects.create(
            user=user,
            title=title,
            message=message,
            category=category,
            priority=priority,
            icon=icon,
            action_url=action_url,
            metadata=metadata or {},
        )
        return notification

    @staticmethod
    def create_batch_notifications(
        users,
        title: str,
        message: str,
        category: str,
        priority: str = NotificationPriority.MEDIUM,
        icon: str = 'Bell',
        action_url: str = None,
        metadata: dict = None,
    ) -> list:
        """Create notifications for multiple users at once"""
        notifications = []
        with transaction.atomic():
            for user in users:
                notification = Notification.objects.create(
                    user=user,
                    title=title,
                    message=message,
                    category=category,
                    priority=priority,
                    icon=icon,
                    action_url=action_url,
                    metadata=metadata or {},
                )
                notifications.append(notification)
        return notifications

    @staticmethod
    def create_habit_reminder(user, habit_name: str, habit_id: int):
        """Create a habit reminder notification"""
        return NotificationService.create_notification(
            user=user,
            title=f"Time to do {habit_name}",
            message=f"Don't break your streak! Complete {habit_name} now.",
            category=NotificationCategory.HABIT_REMINDER,
            priority=NotificationPriority.MEDIUM,
            icon='Sparkles',
            action_url=f'/dashboard/habits?habit={habit_id}',
            metadata={'habit_id': habit_id, 'habit_name': habit_name},
        )

    @staticmethod
    def create_goal_reminder(user, goal_name: str, goal_id: int):
        """Create a goal reminder notification"""
        return NotificationService.create_notification(
            user=user,
            title=f"Check on your goal: {goal_name}",
            message=f"Keep making progress on {goal_name}!",
            category=NotificationCategory.GOAL_REMINDER,
            priority=NotificationPriority.MEDIUM,
            icon='Target',
            action_url=f'/dashboard/goals?goal={goal_id}',
            metadata={'goal_id': goal_id, 'goal_name': goal_name},
        )

    @staticmethod
    def create_sleep_reminder(user):
        """Create a sleep reminder notification"""
        return NotificationService.create_notification(
            user=user,
            title="Time to sleep",
            message="You need 7-9 hours of sleep. Log your sleep when you wake up!",
            category=NotificationCategory.SLEEP_REMINDER,
            priority=NotificationPriority.MEDIUM,
            icon='Moon',
            action_url='/dashboard/sleep',
        )

    @staticmethod
    def create_mood_reminder(user):
        """Create a mood check-in reminder"""
        return NotificationService.create_notification(
            user=user,
            title="How are you feeling?",
            message="Take a moment to log your mood for today.",
            category=NotificationCategory.HABIT_REMINDER,  # Using habit as fallback
            priority=NotificationPriority.LOW,
            icon='Smile',
            action_url='/dashboard/mood',
        )

    @staticmethod
    def create_focus_reminder(user):
        """Create a focus session reminder"""
        return NotificationService.create_notification(
            user=user,
            title="Time to focus",
            message="Start a focus session to boost productivity.",
            category=NotificationCategory.STUDY_REMINDER,
            priority=NotificationPriority.MEDIUM,
            icon='Zap',
            action_url='/dashboard/focus',
        )

    @staticmethod
    def create_reading_reminder(user, book_title: str = None):
        """Create a reading reminder"""
        title = f"Keep reading: {book_title}" if book_title else "Time to read"
        message = f"Continue your reading goal!" if book_title else "Pick up your book and keep reading."
        
        return NotificationService.create_notification(
            user=user,
            title=title,
            message=message,
            category=NotificationCategory.READING_REMINDER,
            priority=NotificationPriority.LOW,
            icon='BookOpen',
            action_url='/dashboard/reading',
        )

    @staticmethod
    def create_expense_reminder(user):
        """Create an expense logging reminder"""
        return NotificationService.create_notification(
            user=user,
            title="Log your expenses",
            message="Keep track of your spending today.",
            category=NotificationCategory.EXPENSE_REMINDER,
            priority=NotificationPriority.LOW,
            icon='DollarSign',
            action_url='/dashboard/expenses',
        )

    @staticmethod
    def create_budget_warning(user, category: str, percentage: int):
        """Create a budget warning notification"""
        return NotificationService.create_notification(
            user=user,
            title=f"Budget alert for {category}",
            message=f"You've spent {percentage}% of your budget for {category}.",
            category=NotificationCategory.BUDGET_WARNING,
            priority=NotificationPriority.HIGH if percentage >= 90 else NotificationPriority.MEDIUM,
            icon='AlertCircle',
            action_url='/dashboard/expenses',
            metadata={'category': category, 'percentage': percentage},
        )

    @staticmethod
    def create_achievement_notification(user, achievement_name: str):
        """Create an achievement notification"""
        return NotificationService.create_notification(
            user=user,
            title=f"Achievement Unlocked! 🎉",
            message=f"You've achieved: {achievement_name}",
            category=NotificationCategory.ACHIEVEMENT_UNLOCKED,
            priority=NotificationPriority.HIGH,
            icon='Trophy',
            action_url='/dashboard',
        )

    @staticmethod
    def create_streak_milestone(user, habit_name: str, days: int):
        """Create a streak milestone notification"""
        return NotificationService.create_notification(
            user=user,
            title=f"🔥 {days}-day streak!",
            message=f"Amazing! You've maintained {habit_name} for {days} days straight!",
            category=NotificationCategory.STREAK_MILESTONE,
            priority=NotificationPriority.HIGH,
            icon='Flame',
            action_url='/dashboard/habits',
        )

    @staticmethod
    def create_weekly_summary(user, summary_data: dict):
        """Create a weekly summary notification"""
        return NotificationService.create_notification(
            user=user,
            title="Your weekly summary is ready",
            message="Check out your progress this week!",
            category=NotificationCategory.WEEKLY_SUMMARY,
            priority=NotificationPriority.MEDIUM,
            icon='TrendingUp',
            action_url='/dashboard',
            metadata=summary_data,
        )

    @staticmethod
    def create_monthly_replay(user):
        """Create a monthly replay notification"""
        return NotificationService.create_notification(
            user=user,
            title="Your monthly life replay",
            message="Relive your highlights from this month!",
            category=NotificationCategory.MONTHLY_REPLAY,
            priority=NotificationPriority.MEDIUM,
            icon='Video',
            action_url='/dashboard',
        )

    @staticmethod
    def create_insight_notification(user, insight: str):
        """Create a new insight notification"""
        return NotificationService.create_notification(
            user=user,
            title="New insight generated",
            message=insight,
            category=NotificationCategory.NEW_INSIGHT,
            priority=NotificationPriority.MEDIUM,
            icon='Lightbulb',
            action_url='/dashboard',
        )

    @staticmethod
    def create_ai_motivation(user, message: str):
        """Create an AI motivation message notification"""
        return NotificationService.create_notification(
            user=user,
            title="AI Companion message",
            message=message,
            category=NotificationCategory.AI_MOTIVATION,
            priority=NotificationPriority.LOW,
            icon='MessageSquare',
            action_url='/dashboard?tab=ai',
        )
