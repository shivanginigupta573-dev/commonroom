import cloudinary.uploader
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from .models import Listing, Favorite, Conversation, Message
from .serializers import ListingSerializer, FavoriteSerializer


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def listing_list(request):
    if request.method == 'GET':
        listings = Listing.objects.all()
        
        # Filter by category
        category = request.query_params.get('category')
        if category and category != 'All':
            listings = listings.filter(category=category)
            
        # Filter by search term
        search = request.query_params.get('search')
        if search:
            listings = listings.filter(title__icontains=search)

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = 9
        paginated_listings = paginator.paginate_queryset(listings, request)

        # Prefetch favorite IDs in ONE query — avoids N+1 problem
        if request.user.is_authenticated:
            paginated_listing_ids = [l.id for l in paginated_listings]
            favorited_ids = set(
                Favorite.objects.filter(
                    user=request.user,
                    listing_id__in=paginated_listing_ids
                ).values_list('listing_id', flat=True)
            )
        else:
            favorited_ids = set()
        
        serializer = ListingSerializer(
            paginated_listings, many=True,
            context={'request': request, 'favorited_ids': favorited_ids}
        )
        return paginator.get_paginated_response(serializer.data)

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        # Handle Cloudinary upload
        cloudinary_url = None
        if 'image' in request.FILES:
            image_file = request.FILES['image']
            try:
                upload_result = cloudinary.uploader.upload(
                    image_file,
                    folder='commonroom/listings',
                )
                cloudinary_url = upload_result.get('secure_url')
            except Exception as e:
                return Response(
                    {'error': f'Image upload failed: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Create listing data with Cloudinary URL
        data = request.data.copy()
        if cloudinary_url:
            data['image'] = cloudinary_url
        else:
            # Remove raw file object — serializer expects a URL string, not a File
            data.pop('image', None)

        serializer = ListingSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([AllowAny])
def listing_detail(request, pk):
    """
    GET: Retrieve single listing
    PATCH: Update listing (only owner can edit)
    DELETE: Delete listing (only owner can delete)
    """
    try:
        listing = Listing.objects.get(pk=pk)
    except Listing.DoesNotExist:
        return Response({'error': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # Prefetch favorite status for this single listing
        if request.user.is_authenticated:
           is_favorited = Favorite.objects.filter(user=request.user, listing=listing).exists()
           favorited_ids = {listing.id} if is_favorited else set()
        else:
            favorited_ids = set()

        serializer = ListingSerializer(
            listing, context={'request': request, 'favorited_ids': favorited_ids}
        )
        return Response(serializer.data)

    if request.method == 'PATCH':
        # Check ownership
        if listing.user != request.user:
            return Response(
                {'error': 'You can only edit your own listings'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ListingSerializer(listing, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        # WHY: Check if user owns the listing
        # WHAT: Prevents someone from deleting another user's listing
        if listing.user != request.user:
            return Response(
                {'error': 'You can only delete your own listings'},
                status=status.HTTP_403_FORBIDDEN
            )

        listing.delete()
        return Response(
            {'message': 'Listing deleted successfully'},
            status=status.HTTP_204_NO_CONTENT
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggle_favorite(request, pk):
    """Toggle favorite status on a listing. One endpoint handles both add and remove."""
    try:
        listing = Listing.objects.get(pk=pk)
    except Listing.DoesNotExist:
        return Response({'error': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)

    favorite, created = Favorite.objects.get_or_create(
        user=request.user, listing=listing
    )

    if not created:
        # Already favorited — unfavorite it
        favorite.delete()
        return Response({'favorited': False, 'message': 'Removed from favorites'})

    return Response({'favorited': True, 'message': 'Added to favorites'}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_favorites(request):
    """Return all listings the current user has favorited, paginated."""
    favorites = Favorite.objects.filter(user=request.user).select_related('listing')

    paginator = PageNumberPagination()
    paginator.page_size = 9
    paginated = paginator.paginate_queryset(favorites, request)

    # Pass favorited_ids so nested ListingSerializer shows is_favorited=True
    favorited_ids = set(f.listing_id for f in paginated)
    serializer = FavoriteSerializer(
        paginated, many=True,
        context={'request': request, 'favorited_ids': favorited_ids}
    )
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_listings(request):
    """Return all listings created by the current user, paginated."""
    listings = Listing.objects.filter(user=request.user)
    
    # Filter by listing_type
    listing_type = request.query_params.get('listing_type')
    if listing_type and listing_type != 'All':
        listings = listings.filter(listing_type=listing_type)

    paginator = PageNumberPagination()
    paginator.page_size = 9
    paginated = paginator.paginate_queryset(listings, request)

    # Pass favorited_ids so ListingSerializer shows is_favorited=True
    paginated_listing_ids = [l.id for l in paginated]
    favorited_ids = set(
        Favorite.objects.filter(
            user=request.user,
            listing_id__in=paginated_listing_ids
        ).values_list('listing_id', flat=True)
    )

    serializer = ListingSerializer(
        paginated, many=True,
        context={'request': request, 'favorited_ids': favorited_ids}
    )
    return paginator.get_paginated_response(serializer.data)


# ------------------------------------------------------------------ #
#  Chat REST endpoints (WebSocket handles real-time; REST handles      #
#  loading history and starting/finding conversations)                 #
# ------------------------------------------------------------------ #

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_or_get_conversation(request):
    """
    POST /api/chat/conversations/
    Body: { "listing_id": 5, "other_user_id": 3 }

    WHY idempotent: clicking "Contact Seller" multiple times must not create
    duplicate conversation threads. We use get_or_create logic with participant
    filtering to find an existing convo first.
    """
    listing_id = request.data.get('listing_id')
    other_user_id = request.data.get('other_user_id')

    if not listing_id or not other_user_id:
        return Response({'error': 'listing_id and other_user_id are required'}, status=400)

    try:
        other_user = User.objects.get(id=other_user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)

    # Find an existing conversation between these two users about this listing
    existing = Conversation.objects.filter(
        listing_id=listing_id,
        participants=request.user
    ).filter(participants=other_user).first()

    if existing:
        return Response({'id': existing.id, 'created': False})

    # None exists — create one
    convo = Conversation.objects.create(listing_id=listing_id)
    convo.participants.add(request.user, other_user)
    return Response({'id': convo.id, 'created': True}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_conversations(request):
    """
    GET /api/chat/conversations/
    Returns all conversations the current user is part of, ordered by most recent activity.
    Each entry includes the other participant's name and listing title for the sidebar.
    """
    from django.contrib.auth.models import User as DjangoUser

    conversations = Conversation.objects.filter(
        participants=request.user
    ).prefetch_related('participants', 'messages').select_related('listing')

    result = []
    for convo in conversations:
        other = convo.participants.exclude(id=request.user.id).first()
        last_msg = convo.messages.last()
        unread_count = convo.messages.filter(is_read=False).exclude(sender=request.user).count()
        result.append({
            'id': convo.id,
            'other_user': {'id': other.id, 'username': other.username} if other else None,
            'listing': {
                'id': convo.listing.id,
                'title': convo.listing.title,
                'image': convo.listing.image,
            } if convo.listing else None,
            'last_message': {
                'text': last_msg.text,
                'timestamp': last_msg.timestamp.isoformat(),
                'sender_id': last_msg.sender_id,
            } if last_msg else None,
            'unread_count': unread_count,
            'updated_at': convo.updated_at.isoformat(),
        })

    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_messages(request, conversation_id):
    """
    GET /api/chat/conversations/<id>/messages/
    Returns paginated message history for a conversation.
    Guards against accessing conversations you're not part of.
    """
    # Security check: ensure requesting user is a participant
    try:
        convo = Conversation.objects.get(id=conversation_id, participants=request.user)
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=404)

    # Mark all messages from the other user as read now that the user is viewing
    Message.objects.filter(
        conversation=convo
    ).exclude(sender=request.user).update(is_read=True)

    messages = convo.messages.select_related('sender')

    paginator = PageNumberPagination()
    paginator.page_size = 50
    paginated = paginator.paginate_queryset(messages, request)

    data = [{
        'id': m.id,
        'text': m.text,
        'sender_id': m.sender_id,
        'sender_username': m.sender.username,
        'timestamp': m.timestamp.isoformat(),
        'is_read': m.is_read,
    } for m in paginated]

    return paginator.get_paginated_response(data)


# Re-import User at module level for the chat views
from django.contrib.auth.models import User