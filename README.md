LMSC - Take-Home Technical Task

Small full-stack demo for London Maths & Science College (LMSC).

Tech stack
- Backend: Node.js + Express + SQLite (`better-sqlite3`)
- Frontend: Next.js (React)

Quick start (macOS / zsh)

1) Backend

```bash
cd backend
npm install
# seed DB (runs automatically on server start, but you can call directly)
npm run seed
npm start
```

Server runs on `http://localhost:4000`.

2) Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000` by default.

Usage notes
- To "log in", choose role (Student / Teacher) and pick a name from the dropdown.
- Seeded data includes a few students, teachers, lessons, quiz questions and tasks.

Architecture & Trade-offs
- Simple REST API with file-based SQLite for easy local setup.
- No authentication — selection dropdown simulates login.
- Single-file, minimal Express routes to keep scope small. For larger projects I'd separate controllers/services and add migrations.

What I'd add with more time
- Proper migrations and seed tooling (knex/TypeORM).
- Tests for backend and frontend flows.
- Dockerfile + docker-compose for reproducible setup.
