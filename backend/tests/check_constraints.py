#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'life_os.settings')
sys.path.insert(0, 'life_os')
django.setup()

from django.db import connection

with connection.cursor() as cursor:
    # Check MoodEntry constraints
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='trackers_moodentry'")
    result = cursor.fetchone()
    if result:
        print("MoodEntry Table Schema:")
        print(result[0])
        print("\n")
    
    # Check SleepEntry constraints
    cursor.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='trackers_sleepentry'")
    result = cursor.fetchone()
    if result:
        print("SleepEntry Table Schema:")
        print(result[0])
        print("\n")
    
    # Check for constraints
    cursor.execute("PRAGMA constraint_list(trackers_moodentry)")
    print("MoodEntry Constraints:")
    for row in cursor.fetchall():
        print(row)
    print()
    
    cursor.execute("PRAGMA constraint_list(trackers_sleepentry)")
    print("SleepEntry Constraints:")
    for row in cursor.fetchall():
        print(row)
