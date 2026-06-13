from django.db import models
from django.contrib.auth.models import User

class Listing(models.Model):
    CATEGORY_CHOICES = [
        ('Books', 'Books'),
        ('Hostel Essentials', 'Hostel Essentials'),
        ('Cycles', 'Cycles'),
        ('Study Material', 'Study Material'),
    ]

    LISTING_TYPE_CHOICES = [
        ('sell', 'Sell'),
        ('rent', 'Rent'),
        ('borrow', 'Borrow'),
        ('free', 'Free'),
    ]

    PROGRAM_CHOICES = [
        ('BTech', 'BTech'),
        ('MTech', 'MTech'),
        ('PhD', 'PhD'),
    ]

    CONDITION_CHOICES = [
        ('new', 'New'),
        ('like_new', 'Like New'),
        ('good', 'Good'),
        ('fair', 'Fair'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='listings',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPE_CHOICES, default='sell')
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    program = models.CharField(max_length=20, choices=PROGRAM_CHOICES)
    year = models.CharField(max_length=20)
    seller = models.CharField(max_length=100)
    campus = models.CharField(max_length=100, default='NIT Durgapur')
    image = models.ImageField(upload_to='listings/', blank=True, null=True)
    is_negotiable = models.BooleanField(default=True)
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']