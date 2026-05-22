# Backend Starter

This is the first backend starter for the AI Language Companion.

## What is inside

- `server.js`
  - starts the backend server
- `src/db/database.js`
  - connects to SQLite and creates the tables
- `src/routes/auth.js`
  - sign up and log in
- `src/routes/profile.js`
  - get and update profile data
- `src/routes/progress.js`
  - save quiz or flashcard answers
- `src/routes/chat.js`
  - starter AI chat endpoint

## How to run it

1. Open a terminal inside `backend`
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Keep `AI_PROVIDER=mock` for now
5. Run `npm run dev`

The backend should start on:

`http://localhost:5500`

## AI provider switch (important)

The backend uses one AI gateway route:

- `POST /ai/chat`

It always returns the same response shape (`reply`, `feedback`, `meta`) no matter which provider is active.

### Free mode now (mock)

In `.env`:

`AI_PROVIDER=mock`

### Paid mode later (OpenAI)

In `.env`:

- `AI_PROVIDER=openai`
- `OPENAI_API_KEY=your_real_key`
- `OPENAI_MODEL=gpt-4o-mini` (or your preferred model)

After changing `.env`, restart backend:

`npm run dev`

## First important idea

The frontend and backend are separate:

- HTML pages are the frontend
- this Node.js folder is the backend

Later, the frontend will send requests to this backend instead of saving everything only in local storage.
