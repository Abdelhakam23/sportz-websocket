<div align="center">

# ⚽ Live Sports Commentary API

**A real-time REST + WebSocket backend for managing matches and streaming live commentary.**

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)
![Arcjet](https://img.shields.io/badge/Arcjet-Security-6E56CF?style=for-the-badge)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [REST API Reference](#-rest-api-reference)
- [WebSocket API](#-websocket-api)
- [Validation Rules](#-validation-rules)
- [Security](#-security)
- [Error Handling](#-error-handling)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📌 About

**Live Sports Commentary API** is a backend service for creating sports matches and publishing minute-by-minute commentary to connected clients in real time.

- Create and list matches through a clean REST API.
- Match status (`SCHEDULED`, `LIVE`, `COMPLETED`) is calculated automatically from the match start and end times.
- Add commentary events (goals, cards, substitutions, and more) to any match.
- Clients connect over WebSocket, subscribe to the matches they care about, and receive new commentary instantly.
- Every request and WebSocket upgrade is protected by Arcjet (shield, bot detection, and rate limiting).

---

## ✨ Features

| Feature | Description |
| --- | --- |
| 🏟️ **Match management** | Create matches and list them with pagination, newest first |
| ⏱️ **Automatic status** | Status is derived from `startTime` / `endTime`, never trusted from the client |
| 🎙️ **Live commentary** | Add commentary events with minute, period, event type, actor, team, tags and metadata |
| 🔢 **Auto sequencing** | Events in the same minute get an incrementing `sequence` so ordering is always correct |
| 📡 **Real-time updates** | WebSocket server with per-match subscriptions |
| 📢 **Global broadcast** | New matches are pushed to every connected client |
| ✅ **Strict validation** | Zod schemas validate every request body, including cross-field rules |
| 🛡️ **Protection** | Arcjet shield, bot detection and token-bucket rate limiting on HTTP and WebSocket |
| 🗄️ **Serverless Postgres** | Prisma with the Neon driver adapter |
| 🧹 **Cascade delete** | Deleting a match removes its commentary automatically |

---

## 🧰 Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma with `@prisma/adapter-neon` |
| Validation | Zod |
| Real-time | `ws` (WebSocket) |
| Security | Arcjet (`@arcjet/node`) |
| Config | dotenv |

---

## 🏗️ Architecture

```mermaid
flowchart LR
    C[Client] -- HTTP --> A[Arcjet Middleware]
    A --> R[Express Routes]
    R --> V[Zod Validation]
    V --> CT[Controllers]
    CT --> P[(Prisma + Neon Postgres)]
    CT -- broadcast --> WS[WebSocket Server]
    C -. "ws://host/ws" .-> AW[Arcjet Upgrade Check]
    AW --> WS
    WS -- real-time events --> C
```

**Request flow**

1. A request reaches Express and passes through the Arcjet security middleware.
2. The route validates the body with the matching Zod schema.
3. The controller reads or writes data through Prisma.
4. After a successful write, the controller broadcasts the event over WebSocket.

---

## 📂 Project Structure

```text
.
├── prisma/
│   └── schema.prisma                 # Database models and enums
└── src/
    ├── server.ts                     # App entry point (HTTP + WebSocket)
    ├── arcjet.ts                     # Arcjet rules and security middleware
    ├── config/
    │   └── db.ts                     # Prisma client with Neon adapter
    ├── generated/
    │   └── prisma/                   # Generated Prisma client (do not edit)
    ├── middleware/
    │   └── validateRequest.ts        # Generic Zod validation middleware
    ├── utils/
    │   └── matchStatus.ts            # Computes SCHEDULED / LIVE / COMPLETED
    ├── websocket/
    │   └── index.ts                  # WebSocket server, subscriptions, broadcasts
    └── features/
        ├── matchs/
        │   ├── controllers/matchesController.ts
        │   ├── routes/matchesRoutes.ts
        │   └── validation/createMatchSchema.ts
        └── commentary/
            ├── controllers/commentaryController.ts
            ├── routes/commentaryRoutes.ts
            └── validation/createCommentarySchema.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or newer
- **npm** (or pnpm / yarn)
- A **PostgreSQL** database, for example a free one from [Neon](https://neon.tech)
- An **Arcjet** account and site key from [arcjet.com](https://arcjet.com)

### 1. Clone the repository

```bash
git clone https://github.com/Abdelhakam23/sportz-websocket.git
cd sportz-websocket
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root (see [Environment Variables](#-environment-variables)):

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
ARCJET_KEY="your_arcjet_key"
PORT=3000
HOST=0.0.0.0
MODE_ENV=development
```

### 4. Set up the database

```bash
# Generate the Prisma client into src/generated/prisma
npx prisma generate

# Create the tables
npx prisma migrate dev --name init
```

### 5. Run the server

```bash
npm run dev
```

When the server starts you will see:

```text
Server is running on port http://localhost:3000
Websocket Server is Running on ws://localhost:3000/ws
```

> **Note:** adjust the run command to match the scripts in your `package.json`.

---

## 🔐 Environment Variables

| Variable | Required | Default | Description |
| --- | :---: | --- | --- |
| `DATABASE_URL` | ✅ | n/a | PostgreSQL connection string (Neon) |
| `ARCJET_KEY` | ✅ | n/a | Arcjet site key used for HTTP and WebSocket protection |
| `PORT` | ❌ | `3000` | Port the server listens on |
| `HOST` | ❌ | `0.0.0.0` | Host the server binds to |
| `MODE_ENV` | ❌ | n/a | Set to `development` to log Prisma queries, info, warnings and errors. Otherwise only errors are logged |

---

## 🗄️ Database Schema

```mermaid
erDiagram
    MATCH ||--o{ COMMENTARY : has

    MATCH {
        string id PK "uuid"
        string homeTeam
        string awayTeam
        string sport
        enum status "SCHEDULED | LIVE | COMPLETED"
        datetime startTime
        datetime endTime "nullable"
        int homeScore "default 0"
        int awayScore "default 0"
        datetime createdAt
    }

    COMMENTARY {
        string id PK "uuid"
        string matchId FK
        int minute
        int sequence
        string period
        string eventType
        string actor
        string team
        string message
        json metaData
        string[] tags
        datetime createdAt
    }
```

**Constraints and indexes**

| Model | Rule |
| --- | --- |
| `Match` | Unique on `(homeTeam, awayTeam, startTime)` so the same fixture cannot be created twice |
| `Match` | Index on `(sport, status)` for fast filtering |
| `Commentary` | Index on `(matchId, minute, sequence)` for ordered retrieval |
| `Commentary` | `onDelete: Cascade` on the match relation |

---

## 📡 REST API Reference

**Base URL:** `http://localhost:3000`

All request and response bodies are JSON.

### Matches

#### `POST /matches`: create a match

**Request body**

| Field | Type | Required | Notes |
| --- | --- | :---: | --- |
| `homeTeam` | string | ✅ | Minimum 2 characters |
| `awayTeam` | string | ✅ | Minimum 2 characters |
| `sport` | string | ✅ | Minimum 2 characters |
| `startTime` | string | ✅ | ISO 8601 datetime |
| `endTime` | string | ✅ | ISO 8601 datetime, must be after `startTime` |
| `homeScore` | integer | ❌ | Non-negative. Required if the match already ended |
| `awayScore` | integer | ❌ | Non-negative. Required if the match already ended |

**Example request**

```bash
curl -X POST http://localhost:3000/matches \
  -H "Content-Type: application/json" \
  -d '{
    "homeTeam": "Al Ahly",
    "awayTeam": "Zamalek",
    "sport": "Football",
    "startTime": "2026-12-01T18:00:00.000Z",
    "endTime": "2026-12-01T19:45:00.000Z"
  }'
```

**Success response: `201 Created`**

```json
{
  "message": "Match Created Successfully",
  "data": {
    "id": "b3f1c2a4-8d6e-4f0a-9c1b-2a7d5e8f9012",
    "homeTeam": "Al Ahly",
    "awayTeam": "Zamalek",
    "sport": "Football",
    "status": "SCHEDULED",
    "startTime": "2026-12-01T18:00:00.000Z",
    "endTime": "2026-12-01T19:45:00.000Z",
    "homeScore": 0,
    "awayScore": 0,
    "createdAt": "2026-11-12T10:00:00.000Z"
  }
}
```

> 📢 On success, a `match_created` event is broadcast to **all** connected WebSocket clients.

---

#### `GET /matches`: list matches

Returns matches ordered by `startTime`, newest first.

**Query parameters**

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `page` | integer | `1` | Page number |
| `limit` | integer | `50` | Items per page |

**Example request**

```bash
curl "http://localhost:3000/matches?page=1&limit=10"
```

**Success response: `200 OK`**

```json
{
  "message": "Matchs Retrieved Successfully",
  "reults": 1,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": "b3f1c2a4-8d6e-4f0a-9c1b-2a7d5e8f9012",
      "homeTeam": "Al Ahly",
      "awayTeam": "Zamalek",
      "sport": "Football",
      "status": "SCHEDULED",
      "startTime": "2026-12-01T18:00:00.000Z",
      "endTime": "2026-12-01T19:45:00.000Z",
      "homeScore": 0,
      "awayScore": 0,
      "createdAt": "2026-11-12T10:00:00.000Z"
    }
  ]
}
```

---

### Commentary

#### `POST /commentary/:id`: add a commentary event

`:id` is the **match ID**.

**Request body**

| Field | Type | Required | Rules |
| --- | --- | :---: | --- |
| `minute` | integer | ✅ | 0 to 120 |
| `period` | enum | ✅ | `1st Half`, `2nd Half`, `Extra Time`, `Penalty Shootout` |
| `eventType` | enum | ✅ | `Goal`, `Yellow Card`, `Red Card`, `Substitution`, `Injury`, `Offside`, `Foul`, `Penalty`, `Own Goal` |
| `actor` | string | ✅ | 1 to 100 characters |
| `team` | string | ✅ | 1 to 100 characters |
| `message` | string | ✅ | 1 to 500 characters |
| `metaData` | object | ❌ | Free-form key/value object |
| `tags` | string[] | ❌ | Each tag 1 to 50 characters |

**Example request**

```bash
curl -X POST http://localhost:3000/commentary/b3f1c2a4-8d6e-4f0a-9c1b-2a7d5e8f9012 \
  -H "Content-Type: application/json" \
  -d '{
    "minute": 23,
    "period": "1st Half",
    "eventType": "Goal",
    "actor": "Mohamed Salah",
    "team": "Al Ahly",
    "message": "A brilliant strike from outside the box!",
    "metaData": { "assist": "Trezeguet" },
    "tags": ["goal", "highlight"]
  }'
```

**Success response: `201 Created`**

```json
{
  "message": "Commentary created successfully",
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "matchId": "b3f1c2a4-8d6e-4f0a-9c1b-2a7d5e8f9012",
    "minute": 23,
    "sequence": 1,
    "period": "1st Half",
    "eventType": "Goal",
    "actor": "Mohamed Salah",
    "team": "Al Ahly",
    "message": "A brilliant strike from outside the box!",
    "metaData": { "assist": "Trezeguet" },
    "tags": ["goal", "highlight"],
    "createdAt": "2026-12-01T18:23:10.000Z"
  }
}
```

> 🔢 `sequence` starts at `1` for each minute and increments for every additional event in the same minute.
>
> 📢 On success, a `comment_added` event is sent to every client **subscribed to that match**.

---

#### `GET /commentary/:id`: get a match's commentary

`:id` is the **match ID**. Results are ordered by `minute` then `sequence`, both ascending.

```bash
curl http://localhost:3000/commentary/b3f1c2a4-8d6e-4f0a-9c1b-2a7d5e8f9012
```

**Success response: `200 OK`**

```json
{
  "message": "Commentary retrieved successfully",
  "data": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "matchId": "b3f1c2a4-8d6e-4f0a-9c1b-2a7d5e8f9012",
      "minute": 23,
      "sequence": 1,
      "period": "1st Half",
      "eventType": "Goal",
      "actor": "Mohamed Salah",
      "team": "Al Ahly",
      "message": "A brilliant strike from outside the box!",
      "metaData": { "assist": "Trezeguet" },
      "tags": ["goal", "highlight"],
      "createdAt": "2026-12-01T18:23:10.000Z"
    }
  ]
}
```

**Not found: `404`**

```json
{ "message": "No commentary found for this match" }
```

---

### Endpoint summary

| Method | Endpoint | Description |
| :---: | --- | --- |
| `POST` | `/matches` | Create a match |
| `GET` | `/matches` | List matches (paginated) |
| `POST` | `/commentary/:id` | Add commentary to a match |
| `GET` | `/commentary/:id` | Get all commentary for a match |

---

## 🔌 WebSocket API

**Endpoint:** `ws://localhost:3000/ws`

The WebSocket upgrade passes through the same Arcjet protection as the REST API.

### Client → Server messages

| Type | Payload | Description |
| --- | --- | --- |
| `subscribe` | `{ "type": "subscribe", "matchId": "<id>" }` | Start receiving commentary for a match |
| `unsubscribe` | `{ "type": "unsubscribe", "matchId": "<id>" }` | Stop receiving commentary for a match |

### Server → Client messages

| Type | Sent to | Payload |
| --- | --- | --- |
| `subscribed` | The subscribing client | `{ "type": "subscribed", "matchId": "<id>" }` |
| `unsubscribed` | The unsubscribing client | `{ "type": "unsubscribed", "matchId": "<id>" }` |
| `match_created` | **All** connected clients | `{ "type": "match_created", "data": { ...match } }` |
| `comment_added` | Subscribers of that match | `{ "type": "comment_added", "data": { ...commentary } }` |
| `error` | The sending client | `{ "type": "error", "message": "Invalid message format" }` |

### Browser example

```javascript
const socket = new WebSocket("ws://localhost:3000/ws");

socket.addEventListener("open", () => {
  socket.send(JSON.stringify({ type: "subscribe", matchId: "<match-id>" }));
});

socket.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);

  switch (msg.type) {
    case "match_created":
      console.log("New match:", msg.data);
      break;
    case "comment_added":
      console.log("Live update:", msg.data.message);
      break;
  }
});
```

### Node.js example (with `wscat`)

```bash
npx wscat -c ws://localhost:3000/ws
> {"type":"subscribe","matchId":"<match-id>"}
```

---

## ✅ Validation Rules

Validation is handled by Zod through a reusable `validateRequest` middleware. Invalid requests return `400` with every error message joined together.

**Match rules**

| Rule | Message |
| --- | --- |
| `endTime` must be after `startTime` | `End time must be after start time` |
| A match that has not started cannot have a score above 0 | `Cannot add goals for a scheduled match that hasn't started yet` |
| A match that has already ended must include both scores | `Home score is required for a completed match` / `Away score is required for a completed match` |

**How status is calculated**

| Condition | Status |
| --- | --- |
| Now is before `startTime` | `SCHEDULED` |
| Now is between `startTime` and `endTime` | `LIVE` |
| Now is after `endTime` | `COMPLETED` |

For `SCHEDULED` matches the scores are always stored as `0`.

---

## 🛡️ Security

Protection is powered by [Arcjet](https://arcjet.com) and applies to **both HTTP requests and WebSocket upgrades**.

| Rule | Mode | Details |
| --- | :---: | --- |
| **Shield** | `LIVE` | Blocks common attacks such as SQL injection and XSS |
| **Bot detection** | `LIVE` | Blocks bots. Search engines and link previews are allowed |
| **Token bucket rate limit** | `LIVE` | Refills 10 tokens every 10 seconds, with a capacity of 15 |

**Responses when a request is denied**

| Reason | HTTP status | Body |
| --- | :---: | --- |
| Rate limit exceeded | `429` | `{ "error": "Too Many Requests" }` |
| Bot detected | `403` | `{ "error": "No Bots Allowed" }` |
| Any other denial | `403` | `{ "error": "Forbidden" }` |

---

## 🚨 Error Handling

| Status | Meaning |
| :---: | --- |
| `400` | Validation failed (request body does not match the schema) |
| `403` | Blocked by Arcjet (bot or shield) |
| `404` | No commentary found for the requested match |
| `429` | Rate limit exceeded |
| `500` | Unexpected server error |

**Validation error example**

```json
{
  "Error": "Validation Error",
  "details": "End time must be after start time, Home score is required for a completed match"
}
```

---

## 🗺️ Roadmap

- [ ] `GET /matches/:id` to fetch a single match
- [ ] Update match score and status endpoints
- [ ] Filter matches by `sport` and `status`
- [ ] Authentication for write endpoints
- [ ] Automated tests (unit and integration)
- [ ] Docker setup
- [ ] OpenAPI / Swagger documentation

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

⭐ If you found this project useful, consider giving it a star!

</div>
