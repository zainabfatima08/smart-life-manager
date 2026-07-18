from __future__ import annotations

from django.conf import settings
from django.db import models
from django.utils import timezone


class TimestampedUserModel(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Habit(TimestampedUserModel):
    class Category(models.TextChoices):
        HEALTH = 'health', 'Health'
        STUDY = 'study', 'Study'
        WORK = 'work', 'Work'
        FITNESS = 'fitness', 'Fitness'
        FINANCE = 'finance', 'Finance'
        WELLNESS = 'wellness', 'Wellness'
        OTHER = 'other', 'Other'

    name = models.CharField(max_length=140)
    category = models.CharField(max_length=24, choices=Category.choices, default=Category.OTHER)
    description = models.TextField(blank=True)
    target_per_week = models.PositiveSmallIntegerField(default=7)
    color = models.CharField(max_length=24, default='cyan')
    icon = models.CharField(max_length=32, default='spark')
    is_active = models.BooleanField(default=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'category']),
            models.Index(fields=['user', 'is_active']),
        ]
        ordering = ['name']

    def __str__(self) -> str:
        return self.name


class HabitCompletion(TimestampedUserModel):
    habit = models.ForeignKey(Habit, on_delete=models.CASCADE, related_name='completions')
    completed_on = models.DateField(default=timezone.localdate)
    note = models.CharField(max_length=240, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['habit', 'completed_on'], name='unique_habit_completion_per_day'),
        ]
        indexes = [
            models.Index(fields=['user', 'completed_on']),
            models.Index(fields=['habit', 'completed_on']),
        ]
        ordering = ['-completed_on']


class LifeExperienceEvent(TimestampedUserModel):
    class Source(models.TextChoices):
        HABIT = 'habit', 'Habit'
        READING = 'reading', 'Reading'
        FOCUS = 'focus', 'Focus'
        GOAL = 'goal', 'Goal'
        WELLNESS = 'wellness', 'Wellness'

    source = models.CharField(max_length=24, choices=Source.choices)
    source_id = models.PositiveBigIntegerField()
    points = models.PositiveSmallIntegerField()
    reason = models.CharField(max_length=160)
    earned_on = models.DateField(default=timezone.localdate)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'source', 'source_id', 'earned_on', 'reason'],
                name='unique_xp_event_per_source_day',
            ),
        ]
        indexes = [
            models.Index(fields=['user', 'earned_on']),
            models.Index(fields=['user', 'source']),
        ]
        ordering = ['-earned_on', '-created_at']


class MoodEntry(TimestampedUserModel):
    class Mood(models.TextChoices):
        GREAT = 'great', 'Great'
        GOOD = 'good', 'Good'
        OKAY = 'okay', 'Okay'
        LOW = 'low', 'Low'
        BAD = 'bad', 'Bad'

    MOOD_SCORES = {
        Mood.GREAT: 9,
        Mood.GOOD: 7,
        Mood.OKAY: 5,
        Mood.LOW: 3,
        Mood.BAD: 1,
    }

    mood = models.CharField(max_length=16, choices=Mood.choices)
    emoji = models.CharField(max_length=16, default='🙂')
    label = models.CharField(max_length=60)
    score = models.PositiveSmallIntegerField(default=5)
    note = models.TextField(blank=True)
    logged_on = models.DateField(default=timezone.localdate)

    class Meta:
        constraints = []
        indexes = [models.Index(fields=['user', 'logged_on']), models.Index(fields=['user', 'mood'])]
        ordering = ['-logged_on']


class SleepEntry(TimestampedUserModel):
    slept_on = models.DateField(default=timezone.localdate)
    duration_minutes = models.PositiveIntegerField()
    quality = models.PositiveSmallIntegerField()
    bedtime = models.TimeField(null=True, blank=True)
    wake_time = models.TimeField(null=True, blank=True)
    note = models.TextField(blank=True)

    class Meta:
        constraints = []
        indexes = [models.Index(fields=['user', 'slept_on'])]
        ordering = ['-slept_on']


class FocusSession(TimestampedUserModel):
    class SessionType(models.TextChoices):
        POMODORO = 'pomodoro', 'Pomodoro'
        DEEP_WORK = 'deep_work', 'Deep Work'
        STUDY = 'study', 'Study'
        REVIEW = 'review', 'Review'

    subject = models.CharField(max_length=120)
    session_type = models.CharField(max_length=24, choices=SessionType.choices, default=SessionType.POMODORO)
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=25)
    completed = models.BooleanField(default=False)
    productivity_rating = models.PositiveSmallIntegerField(default=5)
    notes = models.TextField(blank=True)

    class Meta:
        constraints = []
        indexes = [models.Index(fields=['user', 'started_at']), models.Index(fields=['user', 'subject'])]
        ordering = ['-started_at']


class ExpenseCategory(TimestampedUserModel):
    class CategoryType(models.TextChoices):
        INCOME = 'income', 'Income'
        EXPENSE = 'expense', 'Expense'
        BOTH = 'both', 'Both'

    name = models.CharField(max_length=80)
    monthly_budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    category_type = models.CharField(max_length=12, choices=CategoryType.choices, default=CategoryType.EXPENSE)
    color = models.CharField(max_length=24, default='blue')
    icon = models.CharField(max_length=32, default='💰')
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'name'], name='unique_expense_category_per_user'),
        ]
        ordering = ['name']
        verbose_name_plural = 'Expense Categories'

    def __str__(self) -> str:
        return self.name


class ExpenseEntry(TimestampedUserModel):
    class EntryType(models.TextChoices):
        INCOME = 'income', 'Income'
        EXPENSE = 'expense', 'Expense'

    class PaymentMethod(models.TextChoices):
        CASH = 'cash', 'Cash'
        CARD = 'card', 'Card'
        BANK = 'bank', 'Bank Transfer'
        DIGITAL = 'digital', 'Digital Wallet'
        OTHER = 'other', 'Other'

    category = models.ForeignKey(ExpenseCategory, on_delete=models.PROTECT, related_name='entries')
    entry_type = models.CharField(max_length=12, choices=EntryType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    occurred_on = models.DateField(default=timezone.localdate)
    description = models.CharField(max_length=220, blank=True)
    payment_method = models.CharField(max_length=12, choices=PaymentMethod.choices, default=PaymentMethod.CASH)
    notes = models.TextField(blank=True)
    is_recurring = models.BooleanField(default=False)
    tags = models.JSONField(default=list, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'occurred_on']),
            models.Index(fields=['user', 'entry_type']),
            models.Index(fields=['category', 'occurred_on']),
            models.Index(fields=['user', 'payment_method']),
        ]
        ordering = ['-occurred_on', '-created_at']
        verbose_name_plural = 'Expense Entries'


class Goal(TimestampedUserModel):
    class Status(models.TextChoices):
        NOT_STARTED = 'not_started', 'Not Started'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        PAUSED = 'paused', 'Paused'
        ARCHIVED = 'archived', 'Archived'

    class Priority(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'

    class Category(models.TextChoices):
        PERSONAL = 'personal', 'Personal'
        CAREER = 'career', 'Career'
        HEALTH = 'health', 'Health'
        FINANCE = 'finance', 'Finance'
        EDUCATION = 'education', 'Education'
        RELATIONSHIP = 'relationship', 'Relationship'
        OTHER = 'other', 'Other'

    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=24, choices=Category.choices, default=Category.PERSONAL)
    priority = models.CharField(max_length=16, choices=Priority.choices, default=Priority.MEDIUM)
    deadline = models.DateField(null=True, blank=True)
    target_value = models.PositiveIntegerField(default=100)
    current_value = models.PositiveIntegerField(default=0)
    progress_percent = models.PositiveSmallIntegerField(default=0)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.NOT_STARTED)
    color = models.CharField(max_length=24, default='blue')
    icon = models.CharField(max_length=32, default='🎯')
    notes = models.TextField(blank=True)
    reminder_enabled = models.BooleanField(default=False)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['user', 'deadline']),
            models.Index(fields=['user', 'category']),
            models.Index(fields=['user', 'priority']),
        ]
        ordering = ['-priority', 'deadline', 'title']

    def __str__(self) -> str:
        return self.title


class Milestone(TimestampedUserModel):
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        indexes = [
            models.Index(fields=['goal', 'completed']),
            models.Index(fields=['goal', 'due_date']),
            models.Index(fields=['goal', 'order']),
        ]
        ordering = ['order', 'due_date', 'title']


class Book(TimestampedUserModel):
    title = models.CharField(max_length=180)
    author = models.CharField(max_length=140, blank=True)
    total_pages = models.PositiveIntegerField(default=1)
    current_page = models.PositiveIntegerField(default=0)
    started_on = models.DateField(null=True, blank=True)
    finished_on = models.DateField(null=True, blank=True)
    reading_goal_pages_per_day = models.PositiveSmallIntegerField(default=10)

    class Meta:
        indexes = [models.Index(fields=['user', 'title']), models.Index(fields=['user', 'finished_on'])]
        ordering = ['title']

    def __str__(self) -> str:
        return self.title


class ReadingLog(TimestampedUserModel):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='logs')
    pages_read = models.PositiveIntegerField()
    read_on = models.DateField(default=timezone.localdate)
    note = models.CharField(max_length=240, blank=True)

    class Meta:
        indexes = [models.Index(fields=['user', 'read_on']), models.Index(fields=['book', 'read_on'])]
        ordering = ['-read_on']


class JournalEntry(TimestampedUserModel):
    title = models.CharField(max_length=160, blank=True)
    content = models.TextField()
    tags = models.JSONField(default=list, blank=True)
    entry_date = models.DateField(default=timezone.localdate)
    is_pinned = models.BooleanField(default=False)
    is_favorite = models.BooleanField(default=False)
    word_count = models.PositiveIntegerField(default=0)
    mood = models.CharField(max_length=16, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'entry_date', 'title'], name='unique_journal_per_day_title', condition=models.Q(title__gt='')),
        ]
        indexes = [
            models.Index(fields=['user', 'entry_date']),
            models.Index(fields=['user', 'is_pinned']),
            models.Index(fields=['user', 'is_favorite']),
        ]
        ordering = ['-is_pinned', '-entry_date', '-created_at']
