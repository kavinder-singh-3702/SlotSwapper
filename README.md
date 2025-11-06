# SlotSwapper Monorepo

SlotSwapper is a full-stack application that lets communities trade calendar slots through a structured request-and-accept workflow. The repository contains both the public-facing Next.js client and the Node.js API that orchestrates authentication, event management, and WebSocket-driven swap notifications.

## Architecture & Design Choices

- **Modular backend**: The Express API is organised under `src/modules` (auth, events, swaps) to keep controllers thin and encapsulate business logic in dedicated services. This separation keeps the swap workflow testable and ready for additional features (rate limiting, auditing, etc.).
- **Real-time notifications**: Socket.IO runs alongside the REST API so users instantly receive swap requests or acceptance updates without polling.
- **Shared domain model**: Both frontend and backend adhere to the same event and swap status enums, preventing drift in business rules.
- **Docker-first local setup**: A lightweight Node 20 + MongoDB stack is provided via `docker-compose.yml` to simplify onboarding or CI pipelines. The Dockerfile runs the API as a non-root user for improved security posture.
- **Type-safe client**: The Next.js app uses TypeScript and feature folders (`features/`, `providers/`) to keep UI logic maintainable while integrating with the API contracts.

## Repository Layout

- `backend/` – Express API, Mongoose models, JWT auth, Socket.IO notifications, and docker assets.
- `frontend/` – Next.js client with authentication flow, swap marketplace, and notification centre.
- `docker-compose.yml` – Spins up MongoDB and the backend API for local development.

## Prerequisites

- Node.js 20+
- npm 9+
- MongoDB 7+ (optional when using Docker Compose)
- Docker Desktop 4.0+ (optional but recommended for consistent local setup)

## Local Setup

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd SlotSwapper
```

#### Backend API

```bash
cd backend
cp .env.example .env    # adjust PORT, MONGODB_URI, JWT_SECRET as needed
npm install
npm run dev             # starts http://localhost:4000
```

The backend includes a preflight `npm run build` check that verifies runtime packages (like `dotenv`) are installed before production deploys.

#### Frontend UI

```bash
cd ../frontend
cp .env.example .env.local     # set NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
npm install
npm run dev                    # starts http://localhost:3000
```

### 2. Optional: Run everything with Docker

```bash
docker compose up --build
```

This command launches MongoDB and the backend. The API listens on `http://localhost:4000`. Point the frontend’s `NEXT_PUBLIC_API_BASE_URL` to that address and start the Next.js app manually (`npm run dev`) or add another service to the compose file if desired.

### 3. Seed data (optional)

Use the REST endpoints or a tool like Postman to register users, create events, and drive swaps. The API responds with detailed payloads suitable for automated scripts.

## API Reference

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| `POST` | `/api/auth/register` | No | Register a user (`{ name, email, password }`). |
| `POST` | `/api/auth/login` | No | Log in and receive `{ token, user }`. |
| `GET` | `/api/events` | Bearer | List authenticated user’s events. |
| `POST` | `/api/events` | Bearer | Create an event (`title`, `startTime`, `endTime`, optional `status`). |
| `PUT` | `/api/events/:id` | Bearer | Update an existing event. |
| `DELETE` | `/api/events/:id` | Bearer | Delete an event. |
| `GET` | `/api/swappable-slots` | Bearer | Browse other users’ swappable events. |
| `GET` | `/api/swap-requests` | Bearer | Split incoming/outgoing swap requests with populated details. |
| `POST` | `/api/swap-request` | Bearer | Initiate a swap `{ mySlotId, theirSlotId }`; notifies the responder via WebSocket. |
| `POST` | `/api/swap-response/:requestId` | Bearer | Accept or reject (`{ accepted: true|false }`); accepts trigger WebSocket notifications for the requester. |

All protected endpoints expect an `Authorization: Bearer <JWT>` header. WebSocket clients connect using the same token through Socket.IO auth metadata.

## Testing & Tooling

- `npm run lint` (backend) – ESLint with StandardJS configuration.
- `npm run build` (backend) – Preflight dependency check used in deployment pipelines.
- Docker images are built from `backend/Dockerfile` which performs `npm ci` in a dedicated layer and runs the server as the `node` user.

For deeper API and module documentation, refer to `backend/README.md`. UI specifics live in `frontend/README.md`.

Happy swapping!
