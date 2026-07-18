from django.contrib import admin
from .models import AiConversation, AiMessage, AiCompanionPreferences


@admin.register(AiConversation)
class AiConversationAdmin(admin.ModelAdmin):
    list_display = ('user', 'personality', 'title', 'created_at', 'is_archived')
    list_filter = ('personality', 'created_at', 'is_archived')
    search_fields = ('user__email', 'title')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(AiMessage)
class AiMessageAdmin(admin.ModelAdmin):
    list_display = ('conversation', 'role', 'content_preview', 'created_at')
    list_filter = ('role', 'created_at')
    search_fields = ('content', 'conversation__user__email')
    readonly_fields = ('created_at',)

    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(AiCompanionPreferences)
class AiCompanionPreferencesAdmin(admin.ModelAdmin):
    list_display = ('user', 'personality', 'notifications_enabled', 'voice_enabled', 'daily_insights')
    list_filter = ('personality', 'notifications_enabled', 'voice_enabled')
    search_fields = ('user__email',)
    readonly_fields = ('created_at', 'updated_at')
