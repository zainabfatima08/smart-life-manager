#!/usr/bin/env python
import os
import sys
import django

# Setup Django
sys.path.insert(0, 'd:\\Life Manager\\backend\\life_os')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'life_os.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import EmailOTP, TokenBlacklist, AccountActivity
from apps.trackers.models import (
    Habit, HabitCompletion, MoodEntry, SleepEntry,
    FocusSession, ExpenseEntry, ExpenseCategory, Goal, JournalEntry, 
    LifeExperienceEvent, Book, ReadingLog, Milestone
)

User = get_user_model()

# Get counts before
print("=" * 70)
print("DATABASE CLEANUP UTILITY")
print("=" * 70)
print("\n📊 Database Status BEFORE Deletion:")
print(f"  Users: {User.objects.count()}")
print(f"  EmailOTPs: {EmailOTP.objects.count()}")
print(f"  TokenBlacklist: {TokenBlacklist.objects.count()}")
print(f"  AccountActivity: {AccountActivity.objects.count()}")
print(f"  HabitCompletions: {HabitCompletion.objects.count()}")
print(f"  MoodEntries: {MoodEntry.objects.count()}")
print(f"  ExpenseEntries: {ExpenseEntry.objects.count()}")
print(f"  JournalEntries: {JournalEntry.objects.count()}")
print(f"  FocusSessions: {FocusSession.objects.count()}")
print(f"  Goals: {Goal.objects.count()}")
print(f"  SleepEntries: {SleepEntry.objects.count()}")
print(f"  Books: {Book.objects.count()}")
print(f"  ReadingLogs: {ReadingLog.objects.count()}")

users_count = User.objects.count()

if users_count > 0:
    print("\n🗑️  Deleting data...")
    print("-" * 70)
    
    # Delete tracker data first
    try:
        HabitCompletion.objects.all().delete()
        print("  ✅ Deleted HabitCompletions")
    except Exception as e:
        print(f"  ⚠️  HabitCompletions: {str(e)}")
    
    try:
        MoodEntry.objects.all().delete()
        print("  ✅ Deleted MoodEntries")
    except Exception as e:
        print(f"  ⚠️  MoodEntries: {str(e)}")
    
    try:
        SleepEntry.objects.all().delete()
        print("  ✅ Deleted SleepEntries")
    except Exception as e:
        print(f"  ⚠️  SleepEntries: {str(e)}")
    
    try:
        FocusSession.objects.all().delete()
        print("  ✅ Deleted FocusSessions")
    except Exception as e:
        print(f"  ⚠️  FocusSessions: {str(e)}")
    
    try:
        JournalEntry.objects.all().delete()
        print("  ✅ Deleted JournalEntries")
    except Exception as e:
        print(f"  ⚠️  JournalEntries: {str(e)}")
    
    try:
        LifeExperienceEvent.objects.all().delete()
        print("  ✅ Deleted LifeExperienceEvents")
    except Exception as e:
        print(f"  ⚠️  LifeExperienceEvents: {str(e)}")
    
    try:
        ReadingLog.objects.all().delete()
        print("  ✅ Deleted ReadingLogs")
    except Exception as e:
        print(f"  ⚠️  ReadingLogs: {str(e)}")
    
    try:
        Book.objects.all().delete()
        print("  ✅ Deleted Books")
    except Exception as e:
        print(f"  ⚠️  Books: {str(e)}")
    
    try:
        Milestone.objects.all().delete()
        print("  ✅ Deleted Milestones")
    except Exception as e:
        print(f"  ⚠️  Milestones: {str(e)}")
    
    try:
        ExpenseEntry.objects.all().delete()
        print("  ✅ Deleted ExpenseEntries")
    except Exception as e:
        print(f"  ⚠️  ExpenseEntries: {str(e)}")
    
    try:
        ExpenseCategory.objects.all().delete()
        print("  ✅ Deleted ExpenseCategories")
    except Exception as e:
        print(f"  ⚠️  ExpenseCategories: {str(e)}")
    
    try:
        Habit.objects.all().delete()
        print("  ✅ Deleted Habits")
    except Exception as e:
        print(f"  ⚠️  Habits: {str(e)}")
    
    try:
        Goal.objects.all().delete()
        print("  ✅ Deleted Goals")
    except Exception as e:
        print(f"  ⚠️  Goals: {str(e)}")
    
    # Delete account-related data
    try:
        EmailOTP.objects.all().delete()
        print("  ✅ Deleted EmailOTPs")
    except Exception as e:
        print(f"  ⚠️  EmailOTPs: {str(e)}")
    
    try:
        TokenBlacklist.objects.all().delete()
        print("  ✅ Deleted TokenBlacklists")
    except Exception as e:
        print(f"  ⚠️  TokenBlacklists: {str(e)}")
    
    try:
        AccountActivity.objects.all().delete()
        print("  ✅ Deleted AccountActivities")
    except Exception as e:
        print(f"  ⚠️  AccountActivities: {str(e)}")
    
    # Finally delete users
    try:
        User.objects.all().delete()
        print("  ✅ Deleted Users")
    except Exception as e:
        print(f"  ❌ Users: {str(e)}")
    
    print("-" * 70)
    
    # Get counts after
    print("\n📊 Database Status AFTER Deletion:")
    print(f"  Users: {User.objects.count()}")
    print(f"  EmailOTPs: {EmailOTP.objects.count()}")
    print(f"  TokenBlacklist: {TokenBlacklist.objects.count()}")
    print(f"  AccountActivity: {AccountActivity.objects.count()}")
    print(f"  HabitCompletions: {HabitCompletion.objects.count()}")
    print(f"  MoodEntries: {MoodEntry.objects.count()}")
    print(f"  ExpenseEntries: {ExpenseEntry.objects.count()}")
    print(f"  JournalEntries: {JournalEntry.objects.count()}")
    
    print("\n" + "=" * 70)
    print("✅ DATABASE SUCCESSFULLY CLEANED!")
    print("=" * 70)
    print("\nYou can now register new accounts from scratch.")
    
else:
    print("\n✅ Database is already clean (no users found)")
    print("=" * 70)
