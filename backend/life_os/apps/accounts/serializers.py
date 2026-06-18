from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Profile

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    display_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'display_name')
    def create(self, validated_data):
        display_name = validated_data.pop('display_name', '')
        email = validated_data['email'].lower()
        user = User.objects.create_user(username=validated_data.get('username') or email, email=email, password=validated_data['password'])
        user.profile.display_name = display_name or user.username
        user.profile.save(update_fields=['display_name'])
        return user

class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Profile
        fields = ('email', 'username', 'display_name', 'avatar_url', 'timezone', 'theme', 'onboarding_complete')