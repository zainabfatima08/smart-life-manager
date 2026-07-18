from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class AiPersonality(models.TextChoices):
    ASTRO = 'astro', 'Astro - Friendly & Motivational'
    NOVA = 'nova', 'Nova - Logical & Analytics Focused'
    EMBER = 'ember', 'Ember - Supportive & Wellness Assistant'


class AiConversation(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_conversations')
    personality = models.CharField(
        max_length=20,
        choices=AiPersonality.choices,
        default=AiPersonality.ASTRO
    )
    title = models.CharField(max_length=255, blank=True, default='New Conversation')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_archived = models.BooleanField(default=False)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'AI Conversation'
        verbose_name_plural = 'AI Conversations'

    def __str__(self):
        return f"{self.user.email} - {self.personality} - {self.created_at}"


class AiMessage(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('ai', 'AI'),
    ]

    conversation = models.ForeignKey(
        AiConversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'AI Message'
        verbose_name_plural = 'AI Messages'

    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."


class AiCompanionPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='ai_preferences')
    personality = models.CharField(
        max_length=20,
        choices=AiPersonality.choices,
        default=AiPersonality.ASTRO
    )
    notifications_enabled = models.BooleanField(default=True)
    voice_enabled = models.BooleanField(default=False)
    daily_insights = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'AI Companion Preference'
        verbose_name_plural = 'AI Companion Preferences'

    def __str__(self):
        return f"{self.user.email} - {self.personality}"
