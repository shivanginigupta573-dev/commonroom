import cloudinary.uploader
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Listing
from .serializers import ListingSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework.pagination import PageNumberPagination

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
        
        serializer = ListingSerializer(paginated_listings, many=True, context={'request': request})
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
        serializer = ListingSerializer(listing, context={'request': request})
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