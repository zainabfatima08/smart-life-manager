from django.urls import reverse
from rest_framework.test import APITestCase

class AuthTests(APITestCase):
    def test_register_returns_tokens(self):
        response = self.client.post('/api/auth/register/', {'email':'pilot@example.com','username':'pilot@example.com','password':'StrongPass123!','display_name':'Pilot'}, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertIn('tokens', response.data)