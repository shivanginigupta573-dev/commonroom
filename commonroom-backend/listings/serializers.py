from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Listing

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Customizes the Simple JWT token response to include the 
    user object that the Next.js frontend expects.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims into the encrypted JWT token payload if needed
        token['username'] = user.username
        return token

    def validate(self, attrs):
        # This generates the standard 'access' and 'refresh' tokens
        data = super().validate(attrs)
        
        # This injects the 'user' key into response.data for your frontend
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
        }
        return data


class ListingSerializer(serializers.ModelSerializer):
   
    class Meta:
        model = Listing
        fields = '__all__'
        read_only_fields = ['user']