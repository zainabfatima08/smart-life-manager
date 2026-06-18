from django.conf import settings
from django.db import models

class Profile(models.Model):
    class Theme(models.TextChoices):
        MISSION_DARK = 'mission_dark', 'Mission Dark'
        COSMIC = 'cosmic', 'Cosmic'
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    display_name = models.CharField(max_length=120, blank=True)
    avatar_url = models.URLField(blank=True)
    timezone = models.CharField(max_length=64, default='UTC')
    theme = models.CharField(max_length=32, choices=Theme.choices, default=Theme.MISSION_DARK)
    onboarding_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.display_name or self.user.email or self.user.username