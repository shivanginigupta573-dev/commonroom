from rest_framework import serializers
from .models import Listing

class ListingSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = '__all__'
        extra_kwargs = {
            'image': {'write_only': True}
        }

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            image_url = obj.image.url
            if request is not None:
                return request.build_absolute_uri(image_url)
            return image_url
        return None
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['image'] = data.pop('image_url')
        return data