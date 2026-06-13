from .settings import *
import os

DEBUG = False

ALLOWED_HOSTS = [
    os.environ.get('RENDER_EXTERNAL_HOSTNAME', ''),
    'localhost',
    '127.0.0.1',
]

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Static files for production
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATIC_URL = '/static/'

# CORS for production
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://commonroom-five.vercel.app/",
]