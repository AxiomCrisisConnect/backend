# CrisisConnect Backend

Node.js + Express backend for Firebase-backed emergency dispatch and volunteer allocation.

## Folder structure

```text
backend/
  src/
    config/          # env and Firebase admin bootstrap
    constants/       # shared constants like collection names
    middlewares/     # auth, notFound, and error middleware
    modules/
      health/        # service health endpoint
      dispatch/      # volunteer allocation and assignment lifecycle
    utils/           # helpers (distance, async wrapper, API error)
    app.js           # express app composition
    server.js        # process entrypoint
```

## Setup

1. Copy `.env.example` to `.env` and fill Firebase values.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Run in development:

```bash
npm run dev
```

4. Open Swagger docs:

```bash
http://localhost:4000/api-docs
```

## API design

Base URL: `/api/v1`

Interactive docs are available at `/api-docs`.

### `GET /health`
Returns service health.

### `POST /dispatch/emergencies/allocate`
Allocates the best volunteer to an existing emergency request.

- Auth: Firebase `Bearer <ID_TOKEN>` required
- Body:

```json
{
  "emergencyId": "existing-emergency-id"
}
```

Allocation scoring uses:
- skill match (required skills from emergency type/category)
- volunteer experience level
- distance from emergency location

Notes:
- The mobile app creates `emergency_requests` directly in Firebase.
- Backend reads that request, finds one best available volunteer, creates one assignment, and updates the existing emergency as `assigned`.

### `POST /dispatch/assignments/:assignmentId/respond`
Volunteer accepts or declines an assignment.

- Auth: Firebase `Bearer <ID_TOKEN>` required
- Body:

```json
{
  "action": "accepted"
}
```

## Notes

- Firestore collections align with Flutter app constants:
  - `users`
  - `volunteer_profiles`
  - `emergency_requests`
  - `assignments`
- Current reallocation strategy on decline marks emergency as `active`; you can extend this with a retry queue/worker.
# backend
