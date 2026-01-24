from rest_framework import serializers
from .models import CustomUser

class CustomUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    profile_pic = serializers.SerializerMethodField()

    def get_profile_pic(self, obj):
        if obj.avatar_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.avatar_image.url)
            return obj.avatar_image.url
        return obj.profile_pic
    
    class Meta:
        model = CustomUser
        fields = [
            'supabase_user_id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'school_name',
            'profile_pic',
            'avatar_image',
            'ls_points',           
            'collected_badges',    
            'is_active',
            'date_joined',
            'current_hearts', 
            'next_refill_at',
            'has_completed_intro',
        ]
        read_only_fields = [
            'supabase_user_id',
            'email',
            'ls_points',           
            'collected_badges',     
            'is_active',
            'date_joined',
            'current_hearts', 
            'next_refill_at',
        ]
