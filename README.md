# SlotSwapper Monorepo

SlotSwapper now ships as a full-stack workspace containing decoupled backend and frontend apps that can scale independently while sharing a unified domain model.

## Repository Layout

- **`backend/`** – Node.js + Express API split into feature modules (`src/modules`) backed by shared middleware, models, and utilities.
- **`frontend/`** – Next.js (TypeScript) client organised under `src/` with feature slices (`features/`), shared providers, and a lightweight `lib/` layer for cross-cutting helpers.

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

## Backend Notes

- Feature-specific HTTP logic now lives under `src/modules/{auth,events,swaps}` with matching services for reusable business rules.
- Shared infrastructure (database config, middleware, constants, models, utilities) remains at `src/` and is consumed by the modules.
- Existing endpoints and behaviours are unchanged; new structure simply improves separation of concerns.

Refer to `backend/README.md` for detailed API documentation and module breakdown.

Happy swapping!
