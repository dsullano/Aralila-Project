from rest_framework import serializers
from .models import CustomUser
from django.conf import settings

class CustomUserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    profile_pic = serializers.SerializerMethodField()

    def get_profile_pic(self, obj):
        """
        Returns the appropriate avatar URL:
        - If custom avatar exists: return full URL to uploaded image
        - Otherwise: return preset avatar path
        """
        # Check if user has uploaded a custom avatar
        if obj.avatar_image and obj.avatar_image.name:
            try:
                request = self.context.get('request')
                if request:
                    # Build absolute URL using request context
                    return request.build_absolute_uri(obj.avatar_image.url)
                else:
                    # Fallback: return relative path
                    return obj.avatar_image.url
            except Exception as e:
                print(f"Error building avatar URL: {e}")
                # Return preset if error
                return obj.profile_pic
        
        # Return preset avatar path (e.g., '/images/bear.png')
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
