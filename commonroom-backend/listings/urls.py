from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from . import views
from . import auth_views
from .serializers import MyTokenObtainPairSerializer

# Subclassing the Simple JWT view to utilize your custom user-payload serializer
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

urlpatterns = [
    # Authentication
    path('auth/register/', auth_views.register, name='register'),
    path('auth/login/', MyTokenObtainPairView.as_view(), name='login'),
    
    # Listings
    path('listings/', views.listing_list, name='listing-list'),
    path('listings/<int:pk>/', views.listing_detail, name='listing-detail'),
]