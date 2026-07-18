import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

print("Testing SMTP Connection to Gmail...")
print("-" * 60)

# Gmail credentials
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USER = "zainabfatima01006@gmail.com"
EMAIL_PASSWORD = "lctsoqgjavlqjpsc"

print(f"Host: {EMAIL_HOST}")
print(f"Port: {EMAIL_PORT}")
print(f"User: {EMAIL_USER}")
print("-" * 60)

try:
    print("1. Creating SMTP connection...")
    server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT, timeout=10)
    print("   ✅ Connection created")
    
    print("2. Starting TLS...")
    server.starttls()
    print("   ✅ TLS started")
    
    print("3. Logging in...")
    server.login(EMAIL_USER, EMAIL_PASSWORD)
    print("   ✅ Login successful")
    
    print("4. Creating email...")
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Test Email from Life OS"
    msg["From"] = "Life OS <noreply@lifeos.app>"
    msg["To"] = "zainabfatima01006@gmail.com"
    
    text = "This is a test email"
    html = "<html><body><h1>Test Email</h1><p>This is a test email from Life OS</p></body></html>"
    
    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")
    msg.attach(part1)
    msg.attach(part2)
    print("   ✅ Email created")
    
    print("5. Sending email...")
    result = server.sendmail(
        EMAIL_USER,
        ["zainabfatima01006@gmail.com"],
        msg.as_string()
    )
    print(f"   ✅ Email sent! Result: {result}")
    
    print("6. Closing connection...")
    server.quit()
    print("   ✅ Connection closed")
    
    print("-" * 60)
    print("✅ ALL TESTS PASSED!")
    print("   Gmail SMTP is working correctly")
    
except smtplib.SMTPAuthenticationError as e:
    print(f"❌ AUTHENTICATION ERROR: {str(e)}")
    print("   Check your email or app password")
except smtplib.SMTPException as e:
    print(f"❌ SMTP ERROR: {str(e)}")
except Exception as e:
    print(f"❌ ERROR: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
