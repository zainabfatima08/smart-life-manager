from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import Profile, Achievement, Milestone, AccountActivity, TokenBlacklist

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for Register"""
    password = serializers.CharField(write_only=True, validators=[validate_password], min_length=8)
    display_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'display_name')
    
    def validate_email(self, value):
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("Email already exists.")
        return value.lower()
    
    def validate_username(self, value):
        if User.objects.filter(username=value.lower()).exists():
            raise serializers.ValidationError("Username already exists.")
        return value.lower()
    
    def create(self, validated_data):
        display_name = validated_data.pop('display_name', '')
        email = validated_data['email'].lower()
        username = validated_data.get('username', email).lower()
        
        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password']
        )
        
        user.profile.display_name = display_name or username.split('@')[0]
        user.profile.save(update_fields=['display_name'])
        
        return user

class LoginSerializer(serializers.Serializer):
    """Serializer for Login"""
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        from django.contrib.auth import authenticate
        
        user = authenticate(
            username=data.get('username').lower(),
            password=data.get('password')
        )
        
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        
        data['user'] = user
        return data

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for change password"""
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': "Passwords do not match."})
        return data
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User"""
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'date_joined', 'profile')
    
    def get_profile(self, obj):
        try:
            return ProfileSerializer(obj.profile).data
        except:
            return None

class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for profile"""
    email = serializers.EmailField(source='user.email', read_only=True)
    username_field = serializers.CharField(source='user.username', read_only=True)
    created_at = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = (
            'email', 'username_field', 'display_name', 'avatar_url', 'timezone', 'theme', 
            'onboarding_complete', 'created_at'
        )
    
    def get_created_at(self, obj):
        return obj.user.date_joined


class ProfileDetailSerializer(serializers.ModelSerializer):
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    user_id = serializers.CharField(source='user.id', read_only=True)
    
    class Meta:
        model = Profile
        fields = [
            'user_id', 'display_name', 'username', 'bio', 'avatar_url', 'banner_url',
            'email', 'country', 'timezone', 'preferred_language',
            'theme', 'accent_color', 'selected_companion',
            'show_companion', 'companion_speech_bubbles', 'companion_animation_speed',
            'companion_sound_effects', 'public_profile', 'profile_completion_percent',
            'created_at', 'first_name', 'last_name',
            'email_notifications', 'browser_notifications', 'habit_reminders', 'goal_reminders',
            'dashboard_layout', 'animations_enabled', 'font_size', 'reduced_motion', 'high_contrast'
        ]
        read_only_fields = ['user_id', 'created_at', 'profile_completion_percent']
    
    def update(self, instance, validated_data):
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
            for attr, value in user_data.items():
                if hasattr(instance.user, attr) and value is not None:
                    setattr(instance.user, attr, value)
            instance.user.save()
        
        # Update profile
        for attr, value in validated_data.items():
            if hasattr(instance, attr):
                setattr(instance, attr, value)
        
        # Calculate profile completion
        instance.calculate_profile_completion()
        instance.save()
        return instance


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'badge_name', 'description', 'icon_name', 'achievement_type', 'is_unlocked', 'unlocked_at']
        read_only_fields = ['id', 'unlocked_at']


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ['id', 'title', 'description', 'milestone_type', 'icon_name', 'achieved_at', 'metadata']
        read_only_fields = ['id', 'achieved_at']


class AccountActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = AccountActivity
        fields = ['id', 'activity_type', 'description', 'device_name', 'ip_address', 'created_at']
        read_only_fields = ['id', 'created_at']


class PublicProfileSerializer(serializers.ModelSerializer):
    achievements_count = serializers.SerializerMethodField()
    milestones_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Profile
        fields = ['display_name', 'username', 'bio', 'avatar_url', 'created_at', 'achievements_count', 'milestones_count']
    
    def get_achievements_count(self, obj):
        return obj.user.achievements.filter(is_unlocked=True).count()
    
    def get_milestones_count(self, obj):
        return obj.user.milestones.count()


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer for OTP verification"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    
    def validate_otp(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits.")
        return value


class ResendOTPSerializer(serializers.Serializer):
    """Serializer for resending OTP"""
    email = serializers.EmailField()
    purpose = serializers.ChoiceField(choices=['verify', 'reset'])


class ForgotPasswordOTPSerializer(serializers.Serializer):
    """Serializer for forgot password OTP request"""
    email = serializers.EmailField()


class ResetPasswordWithOTPSerializer(serializers.Serializer):
    """Serializer for password reset with OTP"""
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data
    
    def validate_otp(self, value):
        """Validate OTP format"""
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits.")
        return value
