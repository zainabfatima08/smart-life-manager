from rest_framework import serializers
from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    created_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'category',
            'category_display',
            'priority',
            'priority_display',
            'is_read',
            'icon',
            'action_url',
            'metadata',
            'created_at',
            'created_at_formatted',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_created_at_formatted(self, obj):
        from django.utils.timesince import timesince
        return f"{timesince(obj.created_at)} ago"


class NotificationListSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    created_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'category',
            'category_display',
            'priority',
            'priority_display',
            'is_read',
            'icon',
            'action_url',
            'created_at_formatted',
        ]

    def get_created_at_formatted(self, obj):
        from django.utils.timesince import timesince
        return f"{timesince(obj.created_at)} ago"


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            'habit_reminders',
            'goal_reminders',
            'mood_reminders',
            'sleep_reminders',
            'focus_reminders',
            'reading_reminders',
            'expense_reminders',
            'study_reminders',
            'ai_motivation_messages',
            'weekly_reports',
            'monthly_replay',
            'browser_notifications',
            'email_notifications',
        ]
