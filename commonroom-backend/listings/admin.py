from django.contrib import admin
from .models import Listing

@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'price', 'listing_type', 'seller', 'status', 'created_at']
    list_filter = ['category', 'listing_type', 'status', 'program']
    search_fields = ['title', 'seller']