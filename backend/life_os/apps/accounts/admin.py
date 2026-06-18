from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'display_name', 'timezone', 'theme', 'onboarding_complete')
    search_fields = ('user__email', 'display_name')
    list_filter = ('theme', 'onboarding_complete')
