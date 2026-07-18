from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import AiConversation, AiMessage, AiCompanionPreferences, AiPersonality
from .serializers import (
    AiConversationSerializer,
    AiConversationListSerializer,
    AiMessageSerializer,
    AiCompanionPreferencesSerializer,
    AiSendMessageSerializer,
    AiPersonalityChangeSerializer,
)
from .ai_service import generate_ai_response, get_greeting


class AiConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AiConversationSerializer

    def get_queryset(self):
        return AiConversation.objects.filter(
            user=self.request.user,
            is_archived=False
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return AiConversationListSerializer
        return AiConversationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def create_conversation(self, request):
        """Create a new conversation or use existing one"""
        personality = request.data.get('personality', AiPersonality.ASTRO)
        
        # Get or create preferences
        preferences, _ = AiCompanionPreferences.objects.get_or_create(
            user=request.user,
            defaults={'personality': personality}
        )
        preferences.personality = personality
        preferences.save()

        conversation = AiConversation.objects.create(
            user=request.user,
            personality=personality,
            title=f"Chat with {personality.title()}"
        )

        # Add greeting message
        greeting = get_greeting(personality)
        AiMessage.objects.create(
            conversation=conversation,
            role='ai',
            content=greeting
        )

        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def send_message(self, request):
        """Send a message and get AI response"""
        serializer = AiSendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        conversation_id = serializer.validated_data.get('conversation_id')
        message_text = serializer.validated_data['message']
        personality = serializer.validated_data['personality']

        # Create or get conversation
        if conversation_id:
            conversation = get_object_or_404(
                AiConversation,
                id=conversation_id,
                user=request.user
            )
        else:
            conversation = AiConversation.objects.create(
                user=request.user,
                personality=personality,
                title=f"Chat with {personality.title()}"
            )

        # Save user message
        user_message = AiMessage.objects.create(
            conversation=conversation,
            role='user',
            content=message_text
        )

        # Get conversation history
        history = AiMessage.objects.filter(
            conversation=conversation
        ).values('role', 'content')

        # Generate AI response
        try:
            ai_response = generate_ai_response(
                user=request.user,
                conversation_history=list(history),
                personality=personality,
                new_message=message_text
            )

            # Save AI message
            ai_message = AiMessage.objects.create(
                conversation=conversation,
                role='ai',
                content=ai_response
            )

            return Response({
                'conversation_id': conversation.id,
                'user_message': AiMessageSerializer(user_message).data,
                'ai_message': AiMessageSerializer(ai_message).data,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                'error': str(e),
                'conversation_id': conversation.id
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """Get conversation history"""
        conversation = self.get_object()
        messages = conversation.messages.all()
        serializer = AiMessageSerializer(messages, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def clear_history(self, request, pk=None):
        """Clear conversation history"""
        conversation = self.get_object()
        conversation.messages.all().delete()
        
        # Add greeting back
        greeting = get_greeting(conversation.personality)
        AiMessage.objects.create(
            conversation=conversation,
            role='ai',
            content=greeting
        )
        
        return Response({'status': 'history cleared'})

    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the current/active conversation"""
        # Get the most recent conversation or create a new one
        conversation = AiConversation.objects.filter(
            user=request.user,
            is_archived=False
        ).first()

        if not conversation:
            # Create default conversation
            conversation = AiConversation.objects.create(
                user=request.user,
                personality=AiPersonality.ASTRO,
                title="Chat with Astro"
            )
            greeting = get_greeting(AiPersonality.ASTRO)
            AiMessage.objects.create(
                conversation=conversation,
                role='ai',
                content=greeting
            )

        serializer = self.get_serializer(conversation)
        return Response(serializer.data)


class AiCompanionPreferencesViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get', 'put'])
    def preferences(self, request):
        """Get or update AI companion preferences"""
        preferences, _ = AiCompanionPreferences.objects.get_or_create(
            user=request.user
        )

        if request.method == 'PUT':
            serializer = AiCompanionPreferencesSerializer(
                preferences,
                data=request.data,
                partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        serializer = AiCompanionPreferencesSerializer(preferences)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_personality(self, request):
        """Change AI personality"""
        serializer = AiPersonalityChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        personality = serializer.validated_data['personality']

        preferences, _ = AiCompanionPreferences.objects.get_or_create(
            user=request.user
        )
        preferences.personality = personality
        preferences.save()

        return Response({
            'personality': personality,
            'message': f'Personality changed to {personality}'
        })
