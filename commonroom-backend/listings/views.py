from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Listing
from .serializers import ListingSerializer

@api_view(['GET', 'POST'])
def listing_list(request):
    """
    GET: List all listings
    POST: Create new listing (requires authentication)
    """
    if request.method == 'GET':
        listings = Listing.objects.all()
        serializer = ListingSerializer(listings, many=True, context={'request': request})
        return Response(serializer.data)

    if request.method == 'POST':
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return Response(
                {'error': 'Authentication required to create listings'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        serializer = ListingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # WHY: Assign listing to current user
            # WHAT: This links the listing to the authenticated user
            listing = serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH', 'DELETE'])
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