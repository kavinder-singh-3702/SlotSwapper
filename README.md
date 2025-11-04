# SlotSwapper Backend

A scalable Node.js/Express API backed by MongoDB that lets users manage their calendar events and trade time slots with each other using a controlled swap workflow.

## Features

- **User authentication** using hashed passwords and JWT-based sessions.
- **Event management** endpoints for CRUD operations on a user's own calendar entries.
- **Swap marketplace** exposing other users' swappable slots and a transaction-safe flow for requesting and responding to swaps.
- Hardened with security middlewares (`helmet`, `cors`), request logging, and consistent error handling.

## Tech Stack

- Node.js 18+
- Express 4
- MongoDB with Mongoose ODM
- JSON Web Tokens for authentication

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment**
   - Duplicate `.env.example` into `.env` and update the values (MongoDB URI, JWT secret, etc.).
   - For production-grade swap transactions enable MongoDB replica sets so multi-document transactions are supported.
3. **Run the development server**
   ```bash
   npm run dev
   ```
4. **Run in production mode**
   ```bash
   npm start
   ```

The server listens on `PORT` (default `4000`). A simple health check is exposed at `GET /health`.

## API Overview

All protected endpoints require an `Authorization: Bearer <token>` header. Acquire the token through the authentication endpoints.

### Authentication

- `POST /api/auth/register` – Register a user. Body: `{ name, email, password }` (password ≥ 8 chars).
- `POST /api/auth/login` – Log in and receive a JWT. Body: `{ email, password }`.

### Events

- `GET /api/events` – List the authenticated user's events.
- `POST /api/events` – Create an event. Body requires `title`, `startTime`, `endTime`, and optional `status` (`BUSY`, `SWAPPABLE`, `SWAP_PENDING`).
- `GET /api/events/:id` – Retrieve one of the user's events.
- `PUT /api/events/:id` – Update event fields (same body keys as creation).
- `DELETE /api/events/:id` – Remove an event.

### Swap Flow

- `GET /api/swappable-slots` – List other users' events that are marked as `SWAPPABLE`.
- `POST /api/swap-request` – Initiate a swap. Body: `{ mySlotId, theirSlotId }`.
  - Validates both events exist, belong to the expected users, and have `SWAPPABLE` status.
  - Creates a `SwapRequest` in the `PENDING` state and marks both slots as `SWAP_PENDING` to remove them from circulation.
- `POST /api/swap-response/:requestId` – Respond to an incoming swap. Body: `{ accepted: true|false }`.
  - **Rejecting** reverts both events back to `SWAPPABLE` and marks the request `REJECTED`.
  - **Accepting** atomically exchanges event owners, locks the slots back to `BUSY`, and marks the request `ACCEPTED`.
  - The controller attempts to run inside a MongoDB transaction; if transactions are not supported (e.g., standalone Mongo), it falls back to a sequential update while preserving consistency.

## Database Models

- **User** – `name`, `email`, and a securely hashed `password`.
- **Event** – `title`, `startTime`, `endTime`, `status`, and `owner` (user reference).
- **SwapRequest** – links two events and two users with a `status` (`PENDING`, `ACCEPTED`, `REJECTED`).

## Project Structure

```
src/
├── app.js                # Express app wiring
├── server.js             # Entry point & database bootstrap
├── config/
│   └── database.js       # MongoDB connection helper
├── constants/
│   └── eventStatus.js    # Enumerations for event & swap statuses
├── controllers/          # Route handlers (auth, events, swaps)
├── middleware/           # Auth & error handling middleware
├── models/               # Mongoose schemas
├── routes/               # Express routers
└── utils/
    └── jwt.js            # JWT helper utilities
```

## Development Notes

- ESLint is configured with the StandardJS base rules. Run `npm run lint` to keep contributions clean.
- Passwords are never stored in plain text; the API uses bcrypt with per-user salts.
- JWTs expire after 12 hours by default—tune via environment variables as needed.
- Extensive in-line comments document important behaviors to streamline onboarding for new contributors.

## Testing the Swap Flow Quickly

1. Register two users and log in to capture their JWTs.
2. Create events for each user, marking at least one as `SWAPPABLE`.
3. With user A's token, call `POST /api/swap-request` providing their slot and user B's swappable slot IDs.
4. With user B's token, accept or reject via `POST /api/swap-response/:requestId`.
5. Verify slot ownership and statuses with `GET /api/events` for each user.

Happy swapping!
