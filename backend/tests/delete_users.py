#!/usr/bin/env python
import os
import sys
import django

# Django setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'life_os.settings')
sys.path.insert(0, 'd:\\Life Manager\\backend\\life_os')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

emails = ['zainabfatima01006@gmail.com', 'zainabfatima01002@gmail.com']

for email in emails:
    try:
        user = User.objects.get(email=email)
        username = user.username
        user.delete()
        print(f"✅ {email} (username: {username}) deleted")
    except User.DoesNotExist:
        print(f"❌ {email} not in database")

print("\n✅ Done!")
