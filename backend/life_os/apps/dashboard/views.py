from rest_framework.views import APIView
from rest_framework.response import Response

class SummaryView(APIView):
    def get(self, request):
        return Response({
            'life_score': 72,
            'callsign': request.user.profile.display_name or request.user.username,
            'widgets': [
                {'label': 'Productivity', 'score': 78, 'trend': '+8%'},
                {'label': 'Wellness', 'score': 69, 'trend': '+3%'},
                {'label': 'Finance', 'score': 74, 'trend': '-2%'},
                {'label': 'Growth', 'score': 66, 'trend': '+11%'},
            ],
            'mission_log': [
                'Phase 1 systems online.',
                'Authentication, profile, and dashboard telemetry are operational.',
                'Tracker modules scheduled for Phase 2 deployment.',
            ]
        })
