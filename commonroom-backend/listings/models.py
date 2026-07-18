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
    title = models.CharField(max_length=200, db_index=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    listing_type = models.CharField(max_length=20, choices=LISTING_TYPE_CHOICES, default='sell')
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    program = models.CharField(max_length=20, choices=PROGRAM_CHOICES)
    year = models.CharField(max_length=20)
    seller = models.CharField(max_length=100)
    campus = models.CharField(max_length=100, default='NIT Durgapur')
    image = models.URLField(blank=True, null=True)
    is_negotiable = models.BooleanField(default=True)
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']


class Favorite(models.Model):
    """Tracks which listings a user has favorited/wishlisted."""
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favorites'
    )
    listing = models.ForeignKey(
        Listing,
        on_delete=models.CASCADE,
        related_name='favorites'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'listing')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} ♥ {self.listing.title}"


class Conversation(models.Model):
    """
    A thread between exactly two users about a listing.
    Using ManyToMany with a unique_together constraint keeps it clean.
    """
    participants = models.ManyToManyField(User, related_name='conversations')
    listing = models.ForeignKey(
        Listing,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='conversations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)  # updated on every new message

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        users = ', '.join(u.username for u in self.participants.all())
        return f"Conversation [{users}]"


class Message(models.Model):
    """A single message inside a Conversation."""
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )
    text = models.TextField()
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender.username}: {self.text[:40]}"