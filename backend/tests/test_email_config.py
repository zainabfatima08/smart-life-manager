#!/usr/bin/env python
"""Test email configuration"""

import os
import sys
import django
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'life_os.settings')
sys.path.insert(0, str(Path(__file__).parent / 'life_os'))

django.setup()

from django.conf import settings
from django.core.mail import send_mail

print("=" * 60)
print("EMAIL CONFIGURATION TEST")
print("=" * 60)
print()

# Check configuration
config = {
    'EMAIL_BACKEND': settings.EMAIL_BACKEND,
    'EMAIL_HOST': settings.EMAIL_HOST,
    'EMAIL_PORT': settings.EMAIL_PORT,
    'EMAIL_USE_TLS': settings.EMAIL_USE_TLS,
    'EMAIL_HOST_USER': settings.EMAIL_HOST_USER if settings.EMAIL_HOST_USER else '❌ NOT SET',
    'EMAIL_HOST_PASSWORD': '✓ SET' if settings.EMAIL_HOST_PASSWORD else '❌ NOT SET',
    'DEFAULT_FROM_EMAIL': settings.DEFAULT_FROM_EMAIL,
}

print("Current Configuration:")
for key, value in config.items():
    print(f"  {key}: {value}")

print()
print("=" * 60)

if not settings.EMAIL_HOST_USER:
    print("❌ ERROR: EMAIL_HOST_USER not configured!")
    print()
    print("Please set in backend/life_os/.env:")
    print("  EMAIL_HOST_USER=your-email@gmail.com")
    print("  EMAIL_HOST_PASSWORD=your-app-password")
    print()
    sys.exit(1)

if not settings.EMAIL_HOST_PASSWORD:
    print("❌ ERROR: EMAIL_HOST_PASSWORD not configured!")
    print()
    print("Please set in backend/life_os/.env:")
    print("  EMAIL_HOST_PASSWORD=your-app-password")
    print()
    sys.exit(1)

print("✅ Email configuration looks correct!")
print()
print("Attempting to send test email...")
print()

try:
    send_mail(
        'Life OS - Email Test',
        'This is a test email from Life OS.',
        settings.DEFAULT_FROM_EMAIL,
        [settings.EMAIL_HOST_USER],
        fail_silently=False,
    )
    print("✅ Test email sent successfully!")
    print(f"   To: {settings.EMAIL_HOST_USER}")
except Exception as e:
    print(f"❌ Error sending test email: {e}")
    print()
    print("Common issues:")
    print("  1. Gmail: Make sure you're using App Password (not regular password)")
    print("  2. Gmail: Enable 'Less secure app access' if needed")
    print("  3. Check internet connection")
    print("  4. Check if SMTP server is accessible")
    sys.exit(1)

print()
print("=" * 60)
print("Email configuration is working! ✅")
print("=" * 60)
