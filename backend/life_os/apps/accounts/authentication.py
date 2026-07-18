from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from .models import TokenBlacklist

class CustomJWTAuthentication(JWTAuthentication):
 def authenticate(self, request):
        result = super().authenticate(request)
        
        if result is None:
            return None
        
        validated_token, user = result
        
        # Check if token is blacklisted
        token_str = str(validated_token)
        if TokenBlacklist.objects.filter(token=token_str).exists():
            raise AuthenticationFailed('Token has been revoked.')
        
        return validated_token, user
