from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'user_email', 'title', 'description', 'screenshot', 'status', 'created_at', 'updated_at']
        read_only_fields = ['status', 'created_at', 'updated_at']

class AdminReportSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Report
        fields = ['id', 'user_email', 'title', 'description', 'screenshot', 'status', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
