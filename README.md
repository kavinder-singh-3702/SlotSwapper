# SlotSwapper Monorepo

SlotSwapper now ships as a full-stack workspace containing:

- **`backend/`** – the existing Node.js + Express API that manages authentication, events, and swap flows.
- **`frontend/`** – a brand new Next.js (TypeScript) application that delivers a dynamic marketplace UI with authenticated routes.

Both apps are deployable independently, but they are wired to work together out of the box.

## Getting Started

### Backend API

```bash
cd backend
npm install
npm run dev
```

The backend reads standard environment variables (`PORT`, `MONGODB_URI`, `JWT_SECRET`, etc.). Copy `backend/.env.example` to `backend/.env` and adjust as required.

### Frontend UI

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local` to point to the backend origin (defaults to `http://localhost:4000`).

## Frontend Highlights

- **Authentication pages** – polished sign up and log in forms that integrate with the backend and persist JWT sessions.
- **Dashboard** – create events, mark them swappable, and see live status badges. State refreshes automatically when mutations complete.
- **Marketplace** – browse available slots, open a modal to choose one of your swappable events, and initiate swap requests in a single flow.
- **Notifications** – review incoming offers with accept/reject actions and track the status of your outgoing requests.
- **Protected routes** – the App Router uses a dedicated layout to guard authenticated areas and keep the navigation consistent.

## Backend Adjustments

The backend codebase is untouched functionally except for:

- Being moved into the `backend/` directory for clearer separation.
- A new `GET /api/swap-requests` endpoint that returns both incoming and outgoing swap requests with populated references for the UI.

Refer to `backend/README.md` for detailed API documentation.

Happy swapping!
