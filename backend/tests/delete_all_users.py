#!/usr/bin/env python
"""Delete all users from the database"""

import os
import sys
import django
from pathlib import Path

# Setup Django
backend_dir = Path(__file__).parent
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'life_os.settings')
sys.path.insert(0, str(backend_dir / 'life_os'))
os.chdir(str(backend_dir / 'life_os'))

django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

print("=" * 60)
print("DELETE ALL USERS")
print("=" * 60)
print()

# Get count before deletion
count_before = User.objects.count()
print(f"Current users in database: {count_before}")
print()

if count_before == 0:
    print("✅ No users to delete!")
    sys.exit(0)

# Show all users
print("Users to be deleted:")
for user in User.objects.all():
    print(f"  • {user.email} (ID: {user.id})")
print()

# Confirm
response = input("⚠️  Are you sure you want to delete ALL users? Type 'yes' to confirm: ")

if response.lower() != 'yes':
    print("❌ Deletion cancelled")
    sys.exit(0)

print()
print("Deleting all users...")

# Delete all users
deleted_count, _ = User.objects.all().delete()

print(f"✅ Deleted {deleted_count} users")
print()

# Verify
count_after = User.objects.count()
print(f"Users remaining in database: {count_after}")
print()

if count_after == 0:
    print("✅ All users successfully deleted!")
else:
    print(f"⚠️  Warning: {count_after} users still in database")

print()
print("=" * 60)
