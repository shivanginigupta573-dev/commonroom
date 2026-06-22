# CommonRoom

> A peer-to-peer campus marketplace for NIT Durgapur students to buy, sell, rent, and borrow items.

**Live Demo:** [commonroom-five.vercel.app](https://commonroom-five.vercel.app)

![CommonRoom Homepage](screenshots\Screenshot 2026-06-22 095900.png)

![CommonRoom Homepage](screenshots\Screenshot 2026-06-22 095927.png)
---

## Features

- **JWT Authentication** — Register, login, logout with 1hr access tokens and 7-day refresh tokens. Automatic silent token refresh on expiry.
- **Create Listings** — Post items with title, description, price, category, condition, and image upload via Cloudinary.
- **Server-Side Search** — Debounced search queries sent to Django backend; filtered at the database level using `icontains` on an indexed field.
- **Category Filtering** — Filter by Books, Hostel Essentials, Cycles, Study Material — resolved server-side, not in JavaScript.
- **Paginated Results** — 9 listings per page with a "Load More" UX; backend returns `count`, `next`, `previous`, `results`.
- **Ownership Controls** — Only listing owners can edit or delete their own listings (403 on unauthorized attempts).
- **Cloudinary Media** — Images stored on Cloudinary CDN, not on the server filesystem, making the app deployment-safe.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| Backend | Django 6, Django REST Framework |
| Auth | JWT via `djangorestframework-simplejwt` |
| Database | PostgreSQL |
| Media Storage | Cloudinary |
| Deployment | Vercel (frontend), Render (backend) |

---

## Architecture

```
commonroom/
├── commonroom-backend/         # Django REST API
│   ├── listings/
│   │   ├── models.py           # Listing model (13 fields, db_index on title)
│   │   ├── serializers.py      # DRF ModelSerializer
│   │   ├── views.py            # listing_list (GET/POST), listing_detail (GET/PATCH/DELETE)
│   │   ├── auth_views.py       # register, login endpoints
│   │   └── urls.py
│   └── commonroom_backend/
│       ├── settings.py
│       └── settings_production.py
└── src/                        # Next.js frontend
    ├── app/
    │   ├── page.tsx            # Homepage with search, filters, pagination
    │   ├── listing/[id]/       # Listing detail page
    │   ├── create/             # Create listing (protected route)
    │   └── auth/               # Login, signup
    ├── components/
    │   ├── Navbar.tsx
    │   ├── Hero.tsx
    │   └── ListingCard.tsx
    └── lib/
        └── api.ts              # Axios instance with JWT interceptors + token refresh
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register/` | No | Create account, returns JWT tokens |
| POST | `/api/auth/login/` | No | Login, returns JWT tokens |
| POST | `/api/auth/token/refresh/` | No | Refresh access token |
| GET | `/api/listings/` | No | List listings (supports `?search=&category=&page=`) |
| POST | `/api/listings/` | Yes | Create listing with Cloudinary image upload |
| GET | `/api/listings/<id>/` | No | Get single listing |
| PATCH | `/api/listings/<id>/` | Yes (owner) | Update listing |
| DELETE | `/api/listings/<id>/` | Yes (owner) | Delete listing |

---

## Local Development

### Backend

```bash
cd commonroom-backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in `commonroom-backend/`:

```env
SECRET_KEY=your_secret_key
DEBUG=True
DB_NAME=commonroom
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

```bash
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd commonroom  # Next.js root
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
```

```bash
npm run dev
```

---

## Key Engineering Decisions

**Why server-side search instead of client-side filtering?**
Client-side filtering fetches all records on every page load. At scale this is both slow (network) and incorrect (you can't filter what you haven't fetched). Server-side filtering with `title__icontains` and a `db_index` on the title field keeps queries fast regardless of table size.

**Why Cloudinary instead of Django's `ImageField`?**
Render and most PaaS providers use ephemeral filesystems — files uploaded to the server are wiped on every redeploy. Cloudinary stores media on a global CDN, decoupled from the application server.

**Why automatic token refresh?**
A 1hr access token expiry with no refresh means users get logged out mid-session. The Axios response interceptor silently calls `/api/auth/token/refresh/` on any 401, updates localStorage, and retries the original request — the user never notices.

---

## Deployment

| Service | URL |
|---|---|
| Frontend (Vercel) | https://commonroom-five.vercel.app |
| Backend (Render) | https://commonroom-m8mc.onrender.com |

> **Note:** The backend is hosted on Render's free tier and may take 30–50 seconds to cold start after inactivity.