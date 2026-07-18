from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import timedelta

from .dashboard_service import (
    get_today_summary,
    calculate_life_score,
    get_activity_timeline,
    generate_insights,
)


class SummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get today's summary for dashboard hero section"""
        try:
            summary = get_today_summary(request.user)
            return Response(summary)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class LifeScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get life score calculation"""
        try:
            life_score = calculate_life_score(request.user)
            return Response(life_score)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class ActivityTimelineView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get activity timeline with pagination and filtering"""
        days = request.query_params.get('days', 7)
        page = request.query_params.get('page', 1)
        page_size = request.query_params.get('page_size', 10)
        activity_type = request.query_params.get('type', 'all')
        
        try:
            days = int(days)
            page = int(page)
            page_size = int(page_size)
        except (ValueError, TypeError):
            days = 7
            page = 1
            page_size = 10

        try:
            activities = get_activity_timeline(
                request.user, 
                days=days, 
                activity_type=activity_type,
                page=page,
                page_size=page_size
            )
            return Response(activities)
        except Exception as e:
            return Response({'error': str(e)}, status=500)


class InsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get smart insights"""
        try:
            insights = generate_insights(request.user)
            return Response(insights)
        except Exception as e:
            return Response({'error': str(e)}, status=500)
