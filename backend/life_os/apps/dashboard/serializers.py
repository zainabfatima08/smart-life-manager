from rest_framework import serializers
from apps.trackers.models import (
    Habit, HabitCompletion, MoodEntry, SleepEntry, FocusSession,
    ExpenseEntry, Goal, Book, JournalEntry
)


class DashboardSummarySerializer(serializers.Serializer):
    """Dashboard today's summary"""
    habits_completed = serializers.IntegerField()
    habits_total = serializers.IntegerField()
    current_mood = serializers.CharField(allow_null=True)
    sleep_hours = serializers.FloatField()
    focus_minutes = serializers.IntegerField()
    expenses_today = serializers.FloatField()
    active_goals = serializers.IntegerField()
    journal_entries = serializers.IntegerField()


class LifeScoreSerializer(serializers.Serializer):
    """Life Score calculation"""
    overall_score = serializers.IntegerField()
    productivity_score = serializers.IntegerField()
    wellness_score = serializers.IntegerField()
    finance_score = serializers.IntegerField()
    growth_score = serializers.IntegerField()
    trend = serializers.CharField()  # 'up', 'down', 'stable'


class ActivityTimelineSerializer(serializers.Serializer):
    """Activity timeline entry"""
    timestamp = serializers.DateTimeField()
    activity_type = serializers.CharField()  # 'habit', 'mood', 'goal', 'reading', etc
    title = serializers.CharField()
    description = serializers.CharField(allow_blank=True)
    icon = serializers.CharField()
    color = serializers.CharField()


class DashboardInsightSerializer(serializers.Serializer):
    """Smart insights"""
    title = serializers.CharField()
    description = serializers.CharField()
    icon = serializers.CharField()
    type = serializers.CharField()  # 'positive', 'warning', 'neutral'
    value = serializers.CharField(allow_blank=True)


class CompanionSettingsSerializer(serializers.Serializer):
    """User companion preferences"""
    companion_type = serializers.CharField()  # 'astro', 'nova', 'ember'
    show_speech_bubbles = serializers.BooleanField()
    show_companion = serializers.BooleanField()
    sound_enabled = serializers.BooleanField()


class WidgetLayoutSerializer(serializers.Serializer):
    """Dashboard widget layout"""
    widget_id = serializers.CharField()
    x = serializers.IntegerField()
    y = serializers.IntegerField()
    width = serializers.IntegerField()
    height = serializers.IntegerField()
    hidden = serializers.BooleanField()
    order = serializers.IntegerField()
