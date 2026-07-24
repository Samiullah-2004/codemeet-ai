# CodeMeet AI

Real-time technical interview platform. Recruiter and candidate join a room, talk over video, share a live-synced Monaco code editor, chat, and get AI-generated feedback on the candidate's code at the end of the session.

## Features

- **Video calls** — peer-to-peer WebRTC, automatically negotiated via Socket.IO signaling
- **Live code editor** — Monaco Editor, synced in real time across all participants in a room
- **Real-time chat** — Socket.IO powered, scoped to the session room
- **Authentication** — email/password signup and login (NextAuth), passwords hashed with bcrypt, protected routes via middleware
- **Session persistence** — DynamoDB-backed Sessions, Users, and Problems tables
- **AI code feedback** — recruiter ends the session, candidate's code is sent to Gemini for review, returns a summary, strengths, improvements, and a 1-10 score
- **CI** — lint, test, and build run automatically on every push and pull request

## Stack

| Layer | Technology | Deployed to |
|---|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind, Monaco Editor | S3 + CloudFront (planned) |
| Auth | NextAuth (credentials provider, JWT sessions) | — |
| Real-time sync (code + chat) | Socket.IO | EC2 (planned) |
| WebRTC signaling | Socket.IO (same server) | EC2 (planned) |
| Video/audio | WebRTC | Peer-to-peer, browser to browser |
| Database | DynamoDB | DynamoDB Local (Docker) for now, real AWS planned |
| AI | Google Gemini API | External |
| CI/CD | GitHub Actions | Lint/test/build active; AWS deploy automation planned |

## Status

**Working locally, fully tested:**
- Video, code sync, chat, auth, session persistence, AI feedback

**Planned, not yet live:**
- AWS deployment (EC2, S3/CloudFront, Lambda) — pending AWS account card verification
- Session recordings
- Further UI/UX polish

## Local development

### Prerequisites
- Node.js 22+
- Docker Desktop (for DynamoDB Local)

### Setup

```bash
# Install dependencies
npm install

# Start DynamoDB Local
docker run -d -p 8000:8000 -v "${PWD}/dynamodb-data:/home/dynamodblocal/data" --name dynamodb-local amazon/dynamodb-local -jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data

# Create tables and seed sample problems
npm run db:create-tables
npm run db:seed

# Copy env template and fill in real values
cp .env.local.example .env.local
```

Required environment variables in `.env.local`:

GEMINI_API_KEY= # from aistudio.google.com/apikey, free tier
NEXTAUTH_SECRET= # generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

### Run the app

In one terminal, start the Socket.IO server:
```bash
cd apps/socket-server
npm install
npm run dev
```

In another terminal, start the Next.js app:
```bash
npm run dev
```

Open `http://localhost:3000`.

## Repo layout

- `apps/socket-server` — Socket.IO server (real-time code sync, chat, WebRTC signaling)
- `app/` — Next.js App Router pages and API routes
- `components/` — React components (video, editor, chat, auth)
- `lib/` — shared logic (DynamoDB client, session/user/problem CRUD, Gemini wrapper)
- `scripts/` — one-off scripts for table creation, seeding, and manual testing
- `auth.ts` — NextAuth configuration
- `proxy.ts` — Next.js 16 middleware equivalent, handles route protection