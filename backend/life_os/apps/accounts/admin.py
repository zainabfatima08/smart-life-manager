from django.contrib import admin
from .models import Profile, Achievement, Milestone, AccountActivity

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_name', 'timezone', 'theme', 'onboarding_complete', 'public_profile', 'created_at')
    list_filter = ('theme', 'onboarding_complete', 'public_profile', 'created_at')
    search_fields = ('user__email', 'display_name', 'username')
    readonly_fields = ('created_at', 'updated_at', 'profile_completion_percent')
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'display_name', 'username', 'bio', 'avatar_url', 'banner_url')
        }),
        ('Location & Preferences', {
            'fields': ('country', 'timezone', 'preferred_language')
        }),
        ('Appearance', {
            'fields': ('theme', 'accent_color', 'dashboard_layout', 'animations_enabled', 'font_size')
        }),
        ('Companion Settings', {
            'fields': ('selected_companion', 'show_companion', 'companion_speech_bubbles', 
                      'companion_animation_speed', 'companion_sound_effects')
        }),
        ('Notifications', {
            'fields': ('email_notifications', 'browser_notifications', 'habit_reminders', 'goal_reminders',
                      'reading_reminders', 'budget_alerts', 'weekly_reports', 'monthly_reports',
                      'habit_reminder_time', 'goal_reminder_time', 'reading_reminder_time')
        }),
        ('Privacy & Security', {
            'fields': ('public_profile', 'show_achievements_public', 'show_stats_public', 'show_reading_public')
        }),
        ('Accessibility', {
            'fields': ('reduced_motion', 'high_contrast')
        }),
        ('Account Status', {
            'fields': ('onboarding_complete', 'profile_completion_percent', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('user',)
        return self.readonly_fields


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('badge_name', 'user', 'achievement_type', 'is_unlocked', 'unlocked_at', 'created_at')
    list_filter = ('achievement_type', 'is_unlocked', 'created_at')
    search_fields = ('user__email', 'badge_name')
    readonly_fields = ('created_at', 'unlocked_at')
    fieldsets = (
        ('Achievement Details', {
            'fields': ('user', 'badge_name', 'description', 'icon_name', 'achievement_type')
        }),
        ('Unlock Condition', {
            'fields': ('unlock_condition',)
        }),
        ('Status', {
            'fields': ('is_unlocked', 'unlocked_at', 'created_at')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('user', 'badge_name', 'achievement_type')
        return self.readonly_fields


@admin.register(Milestone)
class MilestoneAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'milestone_type', 'achieved_at')
    list_filter = ('milestone_type', 'achieved_at')
    search_fields = ('user__email', 'title')
    readonly_fields = ('achieved_at',)
    fieldsets = (
        ('Milestone Details', {
            'fields': ('user', 'title', 'description', 'milestone_type', 'icon_name')
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timeline', {
            'fields': ('achieved_at',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('user',)
        return self.readonly_fields


@admin.register(AccountActivity)
class AccountActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'activity_type', 'description', 'device_name', 'created_at')
    list_filter = ('activity_type', 'created_at')
    search_fields = ('user__email', 'description', 'device_name', 'ip_address')
    readonly_fields = ('created_at', 'user', 'activity_type')
    fieldsets = (
        ('Activity Details', {
            'fields': ('user', 'activity_type', 'description', 'device_name')
        }),
        ('Device Information', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        ('Timeline', {
            'fields': ('created_at',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('created_at',)
        return self.readonly_fields
