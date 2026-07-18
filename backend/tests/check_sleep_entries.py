#!/usr/bin/env python
import os
import sys
import django
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'life_os.settings')
django.setup()

from django.contrib.auth.models import User
from life_os.apps.trackers.models import SleepEntry, MoodEntry

# Get the first user (or the current logged-in user's entries)
users = User.objects.all()
if users.exists():
    user = users.first()
    print(f"Checking entries for user: {user.username}\n")
    
    print("=" * 60)
    print("SLEEP ENTRIES:")
    print("=" * 60)
    sleep_entries = SleepEntry.objects.filter(user=user).order_by('-slept_on')[:20]
    for entry in sleep_entries:
        print(f"ID: {entry.id}, Date: {entry.slept_on}, Duration: {entry.duration_minutes}m, Quality: {entry.quality}/10")
    
    if not sleep_entries.exists():
        print("No sleep entries found!")
    
    print(f"\nTotal sleep entries: {SleepEntry.objects.filter(user=user).count()}")
    
    print("\n" + "=" * 60)
    print("MOOD ENTRIES:")
    print("=" * 60)
    mood_entries = MoodEntry.objects.filter(user=user).order_by('-logged_on')[:20]
    for entry in mood_entries:
        print(f"ID: {entry.id}, Date: {entry.logged_on}, Mood: {entry.mood}, Score: {entry.score}/10")
    
    if not mood_entries.exists():
        print("No mood entries found!")
    
    print(f"\nTotal mood entries: {MoodEntry.objects.filter(user=user).count()}")
    
    # Check for entries with date > 14th
    from datetime import date
    print("\n" + "=" * 60)
    print("ENTRIES AFTER 14TH OF CURRENT MONTH:")
    print("=" * 60)
    
    today = date.today()
    cutoff_date = f"{today.year}-{today.month:02d}-15"
    
    sleep_after_14 = SleepEntry.objects.filter(user=user, slept_on__gte=cutoff_date).order_by('-slept_on')
    print(f"\nSleep entries after 14th: {sleep_after_14.count()}")
    for entry in sleep_after_14[:10]:
        print(f"  Date: {entry.slept_on}")
    
    mood_after_14 = MoodEntry.objects.filter(user=user, logged_on__gte=cutoff_date).order_by('-logged_on')
    print(f"\nMood entries after 14th: {mood_after_14.count()}")
    for entry in mood_after_14[:10]:
        print(f"  Date: {entry.logged_on}")
else:
    print("No users found!")
