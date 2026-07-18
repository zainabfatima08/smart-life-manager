#!/usr/bin/env python
"""Test if reportlab is available in Django's context"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'life_os.settings')
sys.path.insert(0, 'd:\\Life Manager\\backend\\life_os')

django.setup()

print("Testing reportlab availability in Django context...")

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from io import BytesIO
    print("[OK] reportlab imports successful")
    print("[OK] Can generate PDF")
    
    # Try to create a simple PDF
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    p.drawString(50, 750, "Test PDF")
    p.showPage()
    p.save()
    buffer.seek(0)
    
    print("[OK] PDF created successfully ({} bytes)".format(len(buffer.getvalue())))
    print("\nPDF Export should work now!")
    
except ImportError as e:
    print("[FAIL] ImportError: {}".format(e))
    print("reportlab not available in Django context")
except Exception as e:
    print("[FAIL] Error: {}".format(e))
    import traceback
    traceback.print_exc()
