import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import Conversation, Message


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat.

    Connection URL: ws://.../ws/chat/<conversation_id>/?token=<jwt_access_token>

    WHY query-string token? WebSocket clients cannot set custom HTTP headers
    (like Authorization: Bearer ...) during the initial handshake. Passing
    the JWT as a query param is the standard Django Channels pattern.
    """

    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f"chat_{self.conversation_id}"

        # --- Authenticate via JWT from query string ---
        token_str = self.scope['query_string'].decode()
        token_value = None
        for part in token_str.split('&'):
            if part.startswith('token='):
                token_value = part.split('=', 1)[1]
                break

        if not token_value:
            await self.close(code=4001)
            return

        user = await self.get_user_from_token(token_value)
        if user is None:
            await self.close(code=4001)
            return

        # --- Authorise: user must be a participant in this conversation ---
        is_participant = await self.is_participant(user, self.conversation_id)
        if not is_participant:
            await self.close(code=4003)
            return

        self.user = user

        # Join the channel group so both participants receive each other's messages
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """Receives a message from the WebSocket client, persists it, and broadcasts."""
        data = json.loads(text_data)
        text = data.get('text', '').strip()
        if not text:
            return

        # Save to DB (sync ORM call wrapped for async context)
        message = await self.save_message(self.user, self.conversation_id, text)

        # Broadcast to everyone in the group (including sender, so they get confirmation)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'id': message.id,
                'text': message.text,
                'sender_id': self.user.id,
                'sender_username': self.user.username,
                'timestamp': message.timestamp.isoformat(),
            }
        )

    async def chat_message(self, event):
        """Handler called when a message arrives from the channel group."""
        await self.send(text_data=json.dumps({
            'id': event['id'],
            'text': event['text'],
            'sender_id': event['sender_id'],
            'sender_username': event['sender_username'],
            'timestamp': event['timestamp'],
        }))

    # ------------------------------------------------------------------ #
    # Database helpers (must be async-safe)                               #
    # ------------------------------------------------------------------ #

    @database_sync_to_async
    def get_user_from_token(self, token_str):
        try:
            token = AccessToken(token_str)
            user_id = token['user_id']
            return User.objects.get(id=user_id)
        except (InvalidToken, TokenError, User.DoesNotExist):
            return None

    @database_sync_to_async
    def is_participant(self, user, conversation_id):
        return Conversation.objects.filter(
            id=conversation_id,
            participants=user
        ).exists()

    @database_sync_to_async
    def save_message(self, user, conversation_id, text):
        """Persists the message and bumps Conversation.updated_at via auto_now."""
        conversation = Conversation.objects.get(id=conversation_id)
        # Bumping updated_at so the sidebar sorts correctly
        conversation.save(update_fields=['updated_at'])
        return Message.objects.create(
            conversation=conversation,
            sender=user,
            text=text
        )
