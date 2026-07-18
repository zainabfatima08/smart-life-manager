from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags

def send_otp_email(email, otp, purpose='verify'):
    """Send OTP email to user for verification or password reset"""
    if purpose == 'verify':
        subject = 'Verify Your Life OS Email - OTP'
        title = 'Email Verification'
        message_text = 'Please verify your email address using this OTP. This code expires in 10 minutes.'
    else:
        subject = 'Reset Your Life OS Password - OTP'
        title = 'Password Reset'
        message_text = 'Use this OTP to reset your password. This code expires in 10 minutes.'
    
    html_message = f"""
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #34d399 0%, #38bdf8 48%, #6366f1 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }}
            .content {{ padding: 20px; background: #f8fafc; margin-top: 20px; border-radius: 8px; }}
            .otp-box {{ background: white; border: 2px solid #6366f1; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
            .otp-code {{ font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #6366f1; font-family: monospace; }}
            .expiry {{ color: #ef4444; font-size: 14px; margin-top: 10px; }}
            .warning {{ background: #fef2f2; border-left: 4px solid #ef4444; padding: 10px; margin: 10px 0; color: #7f1d1d; font-size: 13px; }}
            .footer {{ text-align: center; color: #94a3b8; margin-top: 20px; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Life OS</h1>
                <p>{title}</p>
            </div>
            <div class="content">
                <p>Hi,</p>
                <p>{message_text}</p>
                <div class="otp-box">
                    <div class="otp-code">{otp}</div>
                    <div class="expiry">Expires in 10 minutes</div>
                </div>
                <div class="warning">
                    <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. Life OS team will never ask for this code.
                </div>
                <p>If you didn't request this OTP, please ignore this email or contact support immediately.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Life OS. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = f"""
    Life OS - {title}
    
    {message_text}
    
    Your OTP: {otp}
    Expires in: 10 minutes
    
    Security Notice: Never share this OTP with anyone.
    
    If you didn't request this, please ignore this email.
    """
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        html_message=html_message,
        fail_silently=False,
    )


def send_password_reset_email(user_email, reset_link):
    """Send password reset email to user"""
    subject = 'Reset Your Life OS Password'
    
    html_message = f"""
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #34d399 0%, #38bdf8 48%, #6366f1 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }}
            .content {{ padding: 20px; background: #f8fafc; margin-top: 20px; border-radius: 8px; }}
            .button {{ display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
            .footer {{ text-align: center; color: #94a3b8; margin-top: 20px; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Life OS</h1>
                <p>Password Reset</p>
            </div>
            <div class="content">
                <p>Hi,</p>
                <p>We received a request to reset your Life OS password. Click the button below to create a new password.</p>
                <a href="{reset_link}" class="button">Reset Password</a>
                <p><strong>This link expires in 24 hours.</strong></p>
                <p>If you didn't request this, please ignore this email or contact support.</p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Life OS. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user_email],
        html_message=html_message,
        fail_silently=False,
    )

def send_verification_email(user_email, verification_link):
    """Send email verification link"""
    subject = 'Verify Your Life OS Email'
    
    html_message = f"""
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #34d399 0%, #38bdf8 48%, #6366f1 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }}
            .content {{ padding: 20px; background: #f8fafc; margin-top: 20px; border-radius: 8px; }}
            .button {{ display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
            .footer {{ text-align: center; color: #94a3b8; margin-top: 20px; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Life OS</h1>
                <p>Verify Your Email</p>
            </div>
            <div class="content">
                <p>Welcome to Life OS!</p>
                <p>Please verify your email address to complete your account setup and unlock all features.</p>
                <a href="{verification_link}" class="button">Verify Email</a>
                <p><strong>This link expires in 7 days.</strong></p>
            </div>
            <div class="footer">
                <p>&copy; 2024 Life OS. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user_email],
        html_message=html_message,
        fail_silently=False,
    )

def send_welcome_email(user_email, user_name):
    """Send welcome email after successful registration"""
    subject = 'Welcome to Life OS!'
    
    html_message = f"""
    <html>
    <head>
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', sans-serif; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #34d399 0%, #38bdf8 48%, #6366f1 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }}
            .content {{ padding: 20px; background: #f8fafc; margin-top: 20px; border-radius: 8px; }}
            .button {{ display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }}
            .footer {{ text-align: center; color: #94a3b8; margin-top: 20px; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Life OS</h1>
                <p>Welcome Aboard!</p>
            </div>
            <div class="content">
                <p>Hi {user_name},</p>
                <p>Your Life OS account has been successfully created! 🎉</p>
                <p>You now have access to:</p>
                <ul>
                    <li> Habit tracking and streaks</li>
                    <li> Mood and wellness monitoring</li>
                    <li> Goal setting and tracking</li>
                    <li> Expense and budget management</li>
                    <li> Reading log and book tracking</li>
                    <li> Journal entries and reflections</li>
                    <li> Focus session tracking</li>
                </ul>
                <a href="{settings.CORS_ALLOWED_ORIGINS[0]}/dashboard" class="button">Go to Dashboard</a>
            </div>
            <div class="footer">
                <p>&copy; 2024 Life OS. Design your life, one day at a time.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    plain_message = strip_tags(html_message)
    
    send_mail(
        subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user_email],
        html_message=html_message,
        fail_silently=False,
    )
