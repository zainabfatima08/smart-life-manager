#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'life_os.settings')
django.setup()

from django.conf import settings
from django.core.mail import send_mail

print("=" * 60)
print("EMAIL CONFIGURATION TEST")
print("=" * 60)
print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
print("=" * 60)

print("\nAttempting to send test email...")
print("-" * 60)

try:
    result = send_mail(
        subject='Life OS - Test OTP Email',
        message='Test OTP Code: 123456\n\nThis email was sent from Life OS test script.\n\nExpires in 10 minutes.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['zainabfatima01006@gmail.com'],
        html_message='''
        <html>
        <body>
            <h2>Life OS - Email Verification</h2>
            <p>Your OTP code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 8px;">123456</h1>
            <p>This code expires in 10 minutes.</p>
            <hr>
            <p>If you did not request this, please ignore this email.</p>
        </body>
        </html>
        ''',
        fail_silently=False,
    )
    print(f"✅ SUCCESS! Email sent.")
    print(f"   Messages sent: {result}")
except Exception as e:
    print(f"❌ ERROR! Email failed to send.")
    print(f"   Error Type: {type(e).__name__}")
    print(f"   Error Message: {str(e)}")
    import traceback
    print("\nFull Traceback:")
    traceback.print_exc()

print("-" * 60)
print("Test complete!")
