from django.contrib import admin
from .models import Notification, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'priority', 'is_read', 'created_at')
    list_filter = ('category', 'priority', 'is_read', 'created_at')
    search_fields = ('title', 'message', 'user__email')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Notification', {
            'fields': ('user', 'title', 'message', 'icon')
        }),
        ('Classification', {
            'fields': ('category', 'priority')
        }),
        ('Status', {
            'fields': ('is_read',)
        }),
        ('Action', {
            'fields': ('action_url', 'metadata')
        }),
        ('Timeline', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')
    search_fields = ('user__email',)
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Reminder Preferences', {
            'fields': (
                'habit_reminders',
                'goal_reminders',
                'mood_reminders',
                'sleep_reminders',
                'focus_reminders',
                'reading_reminders',
                'expense_reminders',
                'study_reminders',
            )
        }),
        ('Summary Preferences', {
            'fields': (
                'ai_motivation_messages',
                'weekly_reports',
                'monthly_replay',
            )
        }),
        ('Delivery Preferences', {
            'fields': (
                'browser_notifications',
                'email_notifications',
            )
        }),
        ('Timeline', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
