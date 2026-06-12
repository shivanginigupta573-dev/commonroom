from django.urls import path
from . import views
from . import auth_views

urlpatterns = [
    # Authentication
    path('auth/register/', auth_views.register, name='register'),
    path('auth/login/', auth_views.login, name='login'),
    
    # Listings
    path('listings/', views.listing_list, name='listing-list'),
    path('listings/<int:pk>/', views.listing_detail, name='listing-detail'),
]