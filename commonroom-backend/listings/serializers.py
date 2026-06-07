from rest_framework import serializers
from .models import Listing

class ListingSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = '__all__'

    def get_image(self, obj):
        if obj.image:
            return obj.image.name  # returns 'listings/filename.jpg' only
        return None