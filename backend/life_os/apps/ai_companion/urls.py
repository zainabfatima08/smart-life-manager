from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AiConversationViewSet, AiCompanionPreferencesViewSet

router = DefaultRouter()
router.register(r'conversations', AiConversationViewSet, basename='ai-conversation')
router.register(r'preferences', AiCompanionPreferencesViewSet, basename='ai-preferences')

urlpatterns = [
    path('', include(router.urls)),
]
