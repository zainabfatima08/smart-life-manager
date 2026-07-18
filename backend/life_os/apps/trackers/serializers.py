from __future__ import annotations

from datetime import timedelta

from django.utils import timezone
from django.db.models import Sum
from rest_framework import serializers

from .models import (
    Book,
    ExpenseCategory,
    ExpenseEntry,
    FocusSession,
    Goal,
    Habit,
    HabitCompletion,
    JournalEntry,
    LifeExperienceEvent,
    Milestone,
    MoodEntry,
    ReadingLog,
    SleepEntry,
)
from .services import create_habit_completion, habit_streaks, update_goal_progress


class UserOwnedSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        return super().create({**validated_data, 'user': self.context['request'].user})


class HabitCompletionSerializer(UserOwnedSerializer):
    class Meta:
        model = HabitCompletion
        fields = ('id', 'habit', 'completed_on', 'note', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_habit(self, habit: Habit) -> Habit:
        if habit.user_id != self.context['request'].user.id:
            raise serializers.ValidationError('Invalid habit.')
        return habit

    def create(self, validated_data):
        from datetime import date
        completion, _created = create_habit_completion(
            user=self.context['request'].user,
            habit=validated_data['habit'],
            completed_on=validated_data.get('completed_on', date.today()),
            note=validated_data.get('note', ''),
        )
        return completion


class HabitSerializer(UserOwnedSerializer):
    current_streak = serializers.SerializerMethodField()
    longest_streak = serializers.SerializerMethodField()
    completed_today = serializers.SerializerMethodField()
    completions_last_30_days = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = (
            'id',
            'name',
            'category',
            'description',
            'target_per_week',
            'color',
            'icon',
            'is_active',
            'current_streak',
            'longest_streak',
            'completed_today',
            'completions_last_30_days',
            'created_at',
            'updated_at',
        )
        read_only_fields = (
            'id',
            'current_streak',
            'longest_streak',
            'completed_today',
            'completions_last_30_days',
            'created_at',
            'updated_at',
        )

    def validate_target_per_week(self, value: int) -> int:
        if value < 1 or value > 7:
            raise serializers.ValidationError('Target per week must be between 1 and 7.')
        return value

    def get_current_streak(self, obj: Habit) -> int:
        return habit_streaks(obj)['current']

    def get_longest_streak(self, obj: Habit) -> int:
        return habit_streaks(obj)['longest']

    def get_completed_today(self, obj: Habit) -> bool:
        from datetime import date
        return obj.completions.filter(completed_on=date.today()).exists()

    def get_completions_last_30_days(self, obj: Habit) -> int:
        from datetime import date, timedelta
        start = date.today() - timedelta(days=29)
        return obj.completions.filter(completed_on__gte=start).count()


class HabitToggleSerializer(serializers.Serializer):
    habit = serializers.PrimaryKeyRelatedField(queryset=Habit.objects.all())
    completed_on = serializers.DateField(default=lambda: __import__('datetime').date.today())
    note = serializers.CharField(max_length=240, required=False, allow_blank=True)

    def validate_habit(self, habit: Habit) -> Habit:
        if habit.user_id != self.context['request'].user.id:
            raise serializers.ValidationError('Invalid habit.')
        if not habit.is_active:
            raise serializers.ValidationError('Inactive habits cannot be completed.')
        return habit


class LifeExperienceEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = LifeExperienceEvent
        fields = ('id', 'source', 'source_id', 'points', 'reason', 'earned_on', 'created_at')
        read_only_fields = fields


class MoodEntrySerializer(UserOwnedSerializer):
    class Meta:
        model = MoodEntry
        fields = ('id', 'mood', 'emoji', 'label', 'score', 'note', 'logged_on', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_score(self, value: int) -> int:
        if value < 1 or value > 10:
            raise serializers.ValidationError('Mood intensity must be between 1 and 10.')
        return value

    def validate(self, attrs):
        mood = attrs.get('mood')
        if mood and 'score' not in attrs:
            attrs['score'] = MoodEntry.MOOD_SCORES.get(mood, 3)
        if not attrs.get('label') and mood:
            attrs['label'] = str(mood).title()
        return attrs


class SleepEntrySerializer(UserOwnedSerializer):
    class Meta:
        model = SleepEntry
        fields = ('id', 'slept_on', 'duration_minutes', 'quality', 'bedtime', 'wake_time', 'note', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_duration_minutes(self, value: int) -> int:
        if value < 1 or value > 1440:
            raise serializers.ValidationError('Sleep duration must be between 1 minute and 24 hours.')
        return value

    def validate_quality(self, value: int) -> int:
        if value < 1 or value > 10:
            raise serializers.ValidationError('Sleep quality must be between 1 and 10.')
        return value


class FocusSessionSerializer(UserOwnedSerializer):
    class Meta:
        model = FocusSession
        fields = (
            'id',
            'subject',
            'session_type',
            'started_at',
            'ended_at',
            'duration_minutes',
            'completed',
            'productivity_rating',
            'notes',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_duration_minutes(self, value: int) -> int:
        if value < 1 or value > 720:
            raise serializers.ValidationError('Focus duration must be between 1 minute and 12 hours.')
        return value

    def validate_productivity_rating(self, value: int) -> int:
        if value < 1 or value > 10:
            raise serializers.ValidationError('Productivity rating must be between 1 and 10.')
        return value


class ExpenseCategorySerializer(UserOwnedSerializer):
    total_spent = serializers.SerializerMethodField()
    budget_remaining = serializers.SerializerMethodField()
    entries_count = serializers.SerializerMethodField()

    class Meta:
        model = ExpenseCategory
        fields = ('id', 'name', 'monthly_budget', 'category_type', 'color', 'icon', 'is_active', 'total_spent', 'budget_remaining', 'entries_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'total_spent', 'budget_remaining', 'entries_count', 'created_at', 'updated_at')

    def validate_name(self, value: str) -> str:
        """Check for duplicate category names for the same user"""
        if self.instance:  # Update case
            existing = ExpenseCategory.objects.filter(
                user=self.context['request'].user,
                name=value
            ).exclude(id=self.instance.id)
        else:  # Create case
            existing = ExpenseCategory.objects.filter(
                user=self.context['request'].user,
                name=value
            )
        if existing.exists():
            raise serializers.ValidationError(f"Category '{value}' already exists for you.")
        return value

    def get_total_spent(self, obj: ExpenseCategory) -> float:
        from datetime import date
        today = date.today()
        month_start = today.replace(day=1)
        total = obj.entries.filter(entry_type=ExpenseEntry.EntryType.EXPENSE, occurred_on__gte=month_start).aggregate(Sum('amount'))['amount__sum']
        return float(total or 0)

    def get_budget_remaining(self, obj: ExpenseCategory) -> float:
        return float(obj.monthly_budget) - self.get_total_spent(obj)

    def get_entries_count(self, obj: ExpenseCategory) -> int:
        return obj.entries.count()


class ExpenseEntrySerializer(UserOwnedSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)

    class Meta:
        model = ExpenseEntry
        fields = ('id', 'category', 'category_name', 'category_icon', 'category_color', 'entry_type', 'amount', 'occurred_on', 'description', 'payment_method', 'notes', 'is_recurring', 'tags', 'created_at', 'updated_at')
        read_only_fields = ('id', 'category_name', 'category_icon', 'category_color', 'created_at', 'updated_at')

    def validate_category(self, category: ExpenseCategory) -> ExpenseCategory:
        if category.user_id != self.context['request'].user.id:
            raise serializers.ValidationError('Invalid category.')
        return category

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than zero.')
        return value

    def validate_tags(self, value: list[str]) -> list[str]:
        if not isinstance(value, list):
            raise serializers.ValidationError('Tags must be a list.')
        return [str(tag).strip().lower() for tag in value if str(tag).strip()]


class MilestoneSerializer(UserOwnedSerializer):
    class Meta:
        model = Milestone
        fields = ('id', 'goal', 'title', 'description', 'due_date', 'completed', 'completed_at', 'order', 'created_at', 'updated_at')
        read_only_fields = ('id', 'completed_at', 'created_at', 'updated_at')

    def validate_goal(self, goal: Goal) -> Goal:
        if goal.user_id != self.context['request'].user.id:
            raise serializers.ValidationError('Invalid goal.')
        return goal

    def update(self, instance: Milestone, validated_data):
        completed = validated_data.get('completed')
        if completed and not instance.completed:
            validated_data['completed_at'] = timezone.now()
        elif not completed and instance.completed:
            validated_data['completed_at'] = None
        instance = super().update(instance, validated_data)
        update_goal_progress(instance.goal)
        return instance


class GoalSerializer(UserOwnedSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)
    milestone_count = serializers.SerializerMethodField()
    completed_milestones = serializers.SerializerMethodField()
    days_until_deadline = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = (
            'id',
            'title',
            'description',
            'category',
            'priority',
            'deadline',
            'target_value',
            'current_value',
            'progress_percent',
            'status',
            'color',
            'icon',
            'notes',
            'reminder_enabled',
            'milestones',
            'milestone_count',
            'completed_milestones',
            'days_until_deadline',
            'is_overdue',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'progress_percent', 'milestones', 'milestone_count', 'completed_milestones', 'days_until_deadline', 'is_overdue', 'created_at', 'updated_at')

    def get_milestone_count(self, obj: Goal) -> int:
        return obj.milestones.count()

    def get_completed_milestones(self, obj: Goal) -> int:
        return obj.milestones.filter(completed=True).count()

    def get_days_until_deadline(self, obj: Goal) -> int | None:
        if not obj.deadline:
            return None
        from datetime import date
        delta = obj.deadline - date.today()
        return delta.days

    def get_is_overdue(self, obj: Goal) -> bool:
        if not obj.deadline:
            return False
        from datetime import date
        return obj.deadline < date.today() and obj.status != Goal.Status.COMPLETED

    def create(self, validated_data):
        goal = super().create(validated_data)
        return update_goal_progress(goal)

    def update(self, instance: Goal, validated_data):
        goal = super().update(instance, validated_data)
        return update_goal_progress(goal)


class BookSerializer(UserOwnedSerializer):
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = (
            'id',
            'title',
            'author',
            'total_pages',
            'current_page',
            'started_on',
            'finished_on',
            'reading_goal_pages_per_day',
            'progress_percent',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'progress_percent', 'created_at', 'updated_at')

    def get_progress_percent(self, obj: Book) -> int:
        return min(100, round((obj.current_page / max(obj.total_pages, 1)) * 100))


class ReadingLogSerializer(UserOwnedSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = ReadingLog
        fields = ('id', 'book', 'book_title', 'pages_read', 'read_on', 'note', 'created_at', 'updated_at')
        read_only_fields = ('id', 'book_title', 'created_at', 'updated_at')

    def validate_book(self, book: Book) -> Book:
        if book.user_id != self.context['request'].user.id:
            raise serializers.ValidationError('Invalid book.')
        return book

    def create(self, validated_data):
        log = super().create(validated_data)
        book = log.book
        book.current_page = min(book.total_pages, book.current_page + log.pages_read)
        if book.current_page >= book.total_pages and not book.finished_on:
            book.finished_on = log.read_on
        book.save(update_fields=['current_page', 'finished_on', 'updated_at'])
        return log


class JournalEntrySerializer(UserOwnedSerializer):
    word_count_computed = serializers.SerializerMethodField()

    class Meta:
        model = JournalEntry
        fields = ('id', 'title', 'content', 'tags', 'entry_date', 'is_pinned', 'is_favorite', 'word_count', 'word_count_computed', 'mood', 'created_at', 'updated_at')
        read_only_fields = ('id', 'word_count', 'word_count_computed', 'created_at', 'updated_at')

    def get_word_count_computed(self, obj: JournalEntry) -> int:
        return len(obj.content.split())

    def validate_tags(self, value: list[str]) -> list[str]:
        if not isinstance(value, list):
            raise serializers.ValidationError('Tags must be a list.')
        return [str(tag).strip().lower() for tag in value if str(tag).strip()]

    def create(self, validated_data):
        validated_data['word_count'] = len(validated_data.get('content', '').split())
        return super().create(validated_data)

    def update(self, instance: JournalEntry, validated_data):
        if 'content' in validated_data:
            validated_data['word_count'] = len(validated_data['content'].split())
        return super().update(instance, validated_data)
