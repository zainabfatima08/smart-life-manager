#!/usr/bin/env python
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'life_os.settings')
sys.path.insert(0, 'd:\\Life Manager\\backend\\life_os')

django.setup()

from django.contrib.auth import get_user_model
from apps.accounts.models import Profile

User = get_user_model()

# Get the test user
try:
    user = User.objects.get(email='zainabfatima01006@gmail.com')
    print(f'✓ User found: {user.email}')
    print(f'  User ID: {user.id}')
    
    # Try to get or create profile
    try:
        profile = user.profile
        print(f'✓ Profile found: {profile.display_name or "(no display name)"}')
    except Profile.DoesNotExist:
        profile, created = Profile.objects.get_or_create(user=user)
        print(f'✓ Profile created (was missing)')
    
    print(f'\n✓ User is ready for export')
    print(f'  - Email: {user.email}')
    print(f'  - Username: {user.username}')
    print(f'  - First Name: {user.first_name}')
    print(f'  - Last Name: {user.last_name}')
    
except User.DoesNotExist:
    print('✗ User not found')
except Exception as e:
    print(f'✗ Error: {e}')
    import traceback
    traceback.print_exc()
