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
    path('listings/<int:pk>/favorite/', views.toggle_favorite, name='toggle-favorite'),

    # User-specific
    path('users/me/favorites/', views.my_favorites, name='my-favorites'),
    path('users/me/listings/', views.my_listings, name='my-listings'),

    # Chat (REST — for history & starting conversations)
    path('chat/conversations/', views.list_conversations, name='list-conversations'),
    path('chat/conversations/start/', views.start_or_get_conversation, name='start-conversation'),
    path('chat/conversations/<int:conversation_id>/messages/', views.list_messages, name='list-messages'),
]