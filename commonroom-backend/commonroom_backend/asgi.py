"""
ASGI config for commonroom_backend project.

Handles both standard HTTP requests (via Django) and WebSocket connections
(via Django Channels) using a ProtocolTypeRouter.
"""

import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from listings.chat_consumer import ChatConsumer

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'commonroom_backend.settings')

# WHY ProtocolTypeRouter: Different protocols (http vs ws) need different handlers.
# HTTP goes to the standard Django request/response cycle.
# WebSocket goes to our ChatConsumer via URLRouter.
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": URLRouter([
        path("ws/chat/<int:conversation_id>/", ChatConsumer.as_asgi()),
    ]),
})
