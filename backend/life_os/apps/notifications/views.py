from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Notification, NotificationPreference
from .serializers import (
    NotificationSerializer,
    NotificationListSerializer,
    NotificationPreferenceSerializer,
)


class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NotificationPagination
    filterset_fields = ['category', 'priority', 'is_read']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return NotificationListSerializer
        return NotificationSerializer

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        return Response({'unread_count': count})

    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        """Mark a single notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response(
            NotificationSerializer(notification).data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['patch'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        count = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        return Response({
            'message': f'{count} notifications marked as read',
            'count': count
        })

    @action(detail=False, methods=['post'])
    def delete_selected(self, request):
        """Delete multiple notifications by IDs"""
        notification_ids = request.data.get('ids', [])
        if not notification_ids:
            return Response(
                {'error': 'No notification IDs provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        deleted_count, _ = Notification.objects.filter(
            user=request.user,
            id__in=notification_ids
        ).delete()
        
        return Response({
            'message': f'{deleted_count} notifications deleted',
            'count': deleted_count
        })

    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        """Delete all notifications"""
        count, _ = Notification.objects.filter(user=request.user).delete()
        return Response({
            'message': f'{count} notifications deleted',
            'count': count
        })

    @action(detail=False, methods=['get'])
    def filter_options(self, request):
        """Get available filter options"""
        categories = [
            {'value': cat[0], 'label': cat[1]}
            for cat in Notification._meta.get_field('category').choices
        ]
        priorities = [
            {'value': pri[0], 'label': pri[1]}
            for pri in Notification._meta.get_field('priority').choices
        ]
        return Response({
            'categories': categories,
            'priorities': priorities,
        })

    @action(detail=False, methods=['post'])
    def search(self, request):
        """Search notifications by title or message"""
        query = request.data.get('q', '').strip()
        if not query:
            return Response(
                {'error': 'Search query required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset().filter(
            Q(title__icontains=query) | Q(message__icontains=query)
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = NotificationListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = NotificationListSerializer(queryset, many=True)
        return Response(serializer.data)


class NotificationPreferenceViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Get user's notification preferences"""
        try:
            preference = NotificationPreference.objects.get(user=request.user)
        except NotificationPreference.DoesNotExist:
            preference = NotificationPreference.objects.create(user=request.user)
        
        serializer = NotificationPreferenceSerializer(preference)
        return Response(serializer.data)

    def update(self, request, pk=None):
        """Update notification preferences"""
        try:
            preference = NotificationPreference.objects.get(user=request.user)
        except NotificationPreference.DoesNotExist:
            preference = NotificationPreference.objects.create(user=request.user)
        
        serializer = NotificationPreferenceSerializer(
            preference,
            data=request.data,
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        """Partial update notification preferences"""
        return self.update(request, pk)
