from rest_framework import serializers
from .models import AiConversation, AiMessage, AiCompanionPreferences, AiPersonality


class AiMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AiMessage
        fields = ('id', 'role', 'content', 'created_at')
        read_only_fields = ('id', 'created_at')


class AiConversationSerializer(serializers.ModelSerializer):
    messages = AiMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()

    class Meta:
        model = AiConversation
        fields = ('id', 'personality', 'title', 'messages', 'message_count', 'created_at', 'updated_at', 'is_archived')
        read_only_fields = ('id', 'created_at', 'updated_at', 'message_count')

    def get_message_count(self, obj):
        return obj.messages.count()


class AiConversationListSerializer(serializers.ModelSerializer):
    message_count = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = AiConversation
        fields = ('id', 'personality', 'title', 'message_count', 'last_message', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_message_count(self, obj):
        return obj.messages.count()

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return {
                'role': last_msg.role,
                'content': last_msg.content[:100],
                'created_at': last_msg.created_at
            }
        return None


class AiCompanionPreferencesSerializer(serializers.ModelSerializer):
    class Meta:
        model = AiCompanionPreferences
        fields = ('personality', 'notifications_enabled', 'voice_enabled', 'daily_insights')


class AiSendMessageSerializer(serializers.Serializer):
    conversation_id = serializers.IntegerField(required=False, allow_null=True)
    message = serializers.CharField(max_length=5000)
    personality = serializers.ChoiceField(choices=AiPersonality.choices, default=AiPersonality.ASTRO)


class AiPersonalityChangeSerializer(serializers.Serializer):
    personality = serializers.ChoiceField(choices=AiPersonality.choices)
