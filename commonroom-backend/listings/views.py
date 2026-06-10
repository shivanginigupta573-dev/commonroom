from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Listing
from .serializers import ListingSerializer

@api_view(['GET', 'POST'])
def listing_list(request):
    if request.method == 'GET':
        listings = Listing.objects.all()
        for listing in listings:
            print(f"Listing: {listing.title}, Image: {listing.image}, Image URL: {listing.image.url if listing.image else 'None'}")
        serializer = ListingSerializer(listings, many=True, context={'request': request})
        return Response(serializer.data)

    if request.method == 'POST':
        print("POST data:", request.data)
        print("FILES:", request.FILES)
        serializer = ListingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            listing = serializer.save()
            print(f"Saved listing - Image field: {listing.image}, Image path: {listing.image.name if listing.image else 'None'}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print("Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH', 'DELETE'])
def listing_detail(request, pk):
    try:
        listing = Listing.objects.get(pk=pk)
    except Listing.DoesNotExist:
        return Response({'error': 'Listing not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ListingSerializer(listing, context={'request': request})
        return Response(serializer.data)

    if request.method == 'PATCH':
        serializer = ListingSerializer(listing, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == 'DELETE':
        listing.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)