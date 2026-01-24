from rest_framework import viewsets, permissions
from .models import Report
from .serializers import ReportSerializer, AdminReportSerializer

class ReportViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user.is_staff:
            return AdminReportSerializer
        return ReportSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return Report.objects.all().order_by('-created_at')
        return Report.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
