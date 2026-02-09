from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from .models import CustomUser
from .serializers import CustomUserSerializer

# -----------------------------
# Existing profile endpoints
# -----------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get current user profile"""
    user = request.user
    user.refill_hearts_if_needed()  
    user.update_streak()
    serializer = CustomUserSerializer(user, context={'request': request})
    return Response(serializer.data)

@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile_view(request):
    """Update user profile (school_name, profile_pic, first_name, last_name, avatar_image)"""
    user = request.user
    allowed_fields = ['school_name', 'profile_pic', 'first_name', 'last_name']
    
    try:
        print("\n" + "="*60)
        print("🔍 UPDATE PROFILE REQUEST RECEIVED")
        print("="*60)
        print(f"User: {user.email}")
        print(f"Request method: {request.method}")
        print(f"Request data keys: {list(request.data.keys())}")
        print(f"Request FILES keys: {list(request.FILES.keys())}")
        
        # Log incoming data
        print("\n📋 INCOMING DATA:")
        for field in allowed_fields:
            value = request.data.get(field, "NOT PROVIDED")
            print(f"  - {field}: {value} (type: {type(value).__name__})")
        
        # Handle custom avatar upload
        if 'avatar_image' in request.FILES:
            custom_avatar = request.FILES['avatar_image']
            print(f"\n📸 AVATAR: Custom avatar upload detected")
            print(f"   - Name: {custom_avatar.name}")
            print(f"   - Size: {custom_avatar.size} bytes")
            print(f"   - Content type: {custom_avatar.content_type}")
            user.avatar_image = custom_avatar
        elif 'profile_pic' in request.data:
            # If user selected a preset avatar, clear the custom image
            preset = request.data['profile_pic']
            print(f"\n🎨 AVATAR: Preset avatar selected: {preset}")
            user.avatar_image = None
        else:
            print(f"\n⚪ AVATAR: No avatar change")
        
        # Update text fields
        print("\n✏️  UPDATING FIELDS:")
        for field in allowed_fields:
            if field in request.data:
                old_value = getattr(user, field, None)
                new_value = request.data[field]
                setattr(user, field, new_value)
                print(f"  - {field}: '{old_value}' → '{new_value}'")
            else:
                print(f"  - {field}: (not provided, keeping '{getattr(user, field, '')}')")
        
        # Save to database
        user.save()
        print(f"\n✅ SAVED TO DATABASE")
        print(f"   - first_name: {user.first_name}")
        print(f"   - last_name: {user.last_name}")
        print(f"   - school_name: {user.school_name}")
        print(f"   - profile_pic: {user.profile_pic}")
        print(f"   - avatar_image: {user.avatar_image.name if user.avatar_image else 'None'}")
        
        # Serialize response
        serializer = CustomUserSerializer(user, context={'request': request})
        response_data = serializer.data
        
        print(f"\n📤 RESPONSE DATA:")
        print(f"   - first_name: {response_data.get('first_name')}")
        print(f"   - last_name: {response_data.get('last_name')}")
        print(f"   - full_name: {response_data.get('full_name')}")
        print(f"   - profile_pic URL: {response_data.get('profile_pic')}")
        print("="*60 + "\n")
        
        return Response(response_data)
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        print("="*60 + "\n")
        return Response({"error": str(e)}, status=400)

# -----------------------------
# Heart endpoints
# -----------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def hearts_status_view(request):
    """Get current hearts and refill timer"""
    user: CustomUser = request.user
    user.refill_hearts_if_needed()
    
    return Response({
        "current_hearts": user.current_hearts,
        "next_refill_at": user.next_refill_at.isoformat() if user.next_refill_at else None,
        "max_hearts": 3
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reduce_heart_view(request):
    """Reduce one heart after wrong answer"""
    user: CustomUser = request.user
    user.refill_hearts_if_needed()
    
    if user.current_hearts <= 0:
        return Response({"error": "No hearts available"}, status=400)
    
    user.current_hearts -= 1
    
    # Schedule refill if this is the first heart loss
    if user.current_hearts < 3 and not user.next_refill_at:
        user.next_refill_at = timezone.now() + timedelta(minutes=5)
    
    user.save()
    
    return Response({
        "current_hearts": user.current_hearts,
        "next_refill_at": user.next_refill_at.isoformat() if user.next_refill_at else None
    })

# -----------------------------
# Badges endpoints
# -----------------------------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_badges_view(request):
    """Return all badges for the current user"""
    user: CustomUser = request.user
    badges = user.collected_badges or []
    return Response({"badges": badges})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def claim_badge_view(request, badge_id: str):
    """Mark a badge as claimed"""
    user: CustomUser = request.user
    updated = False

    if not user.collected_badges:
        return Response({"success": False, "message": "No badges found"}, status=400)

    for badge in user.collected_badges:
        if badge.get("id") == badge_id and badge.get("status") != "claimed":
            badge["status"] = "claimed"
            updated = True
            break

    if updated:
        user.save()
        return Response({"success": True, "badge_id": badge_id})
    else:
        return Response({"success": False, "message": "Badge not found or already claimed"}, status=400)

# -----------------------------
# Intro endpoints
# -----------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_intro_view(request):
    """Mark intro animation as completed for the user"""
    user: CustomUser = request.user
    user.has_completed_intro = True
    user.save()
    serializer = CustomUserSerializer(user, context={'request': request})
    return Response(serializer.data)