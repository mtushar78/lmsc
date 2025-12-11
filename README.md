# LMSC E-Learning Platform

A full-stack web application for managing online lessons, quizzes, and tasks. Students can submit quizzes and tasks while teachers can track engagement and mark submissions.

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL (Neon)
- Prisma ORM (v5)

**Frontend:**
- Next.js (React)
- Material-UI (MUI v5)
- SWR (data fetching)

## Project Structure

```
LMSC/
├── backend/
│   ├── src/
│   │   ├── app.js                          # Express app setup, middleware, CORS
│   │   ├── routes/
│   │   │   ├── users.js                    # GET /api/users
│   │   │   ├── lessons.js                  # Lesson CRUD, quiz/task submissions
│   │   │   └── teacher.js                  # GET /api/teacher/lessons/:id/engagement
│   │   ├── controllers/
│   │   │   ├── usersController.js          # List users
│   │   │   ├── lessonsController.js        # Lesson handlers (list, detail, submit, mark)
│   │   │   └── teacherController.js        # Engagement summary handler
│   │   └── services/
│   │       ├── usersService.js             # Fetch students & teachers
│   │       ├── lessonsService.js           # DB queries (lessons, attempts, submissions)
│   │       └── teacherService.js           # Engagement data aggregation
│   ├── prisma/
│   │   ├── schema.prisma                   # Prisma data model
│   │   ├── migrations/
│   │   │   ├── migration_lock.toml
│   │   │   └── 20251210212544_init/
│   │   │       └── migration.sql           # Initial schema migration
│   ├── data/
│   │   └── lmsc.db                         # SQLite fallback (not used in prod)
│   ├── index.js                            # Server entry, graceful shutdown
│   ├── db.js                               # Prisma client (singleton pattern)
│   ├── seed.js                             # Database seeding (students, lessons, quizzes)
│   ├── package.json                        # Backend dependencies
│   ├── package-lock.json
│   ├── prisma.config.ts                    # Prisma CLI configuration
│   └── .env                                # Environment variables (not committed)
├── frontend/
│   ├── pages/
│   │   ├── _app.js                         # Next.js app wrapper, MUI theme provider
│   │   ├── index.js                        # Login & role selection
│   │   ├── student/
│   │   │   ├── lessons.js                  # List lessons with student scores
│   │   │   └── lesson/
│   │   │       └── [id].js                 # Lesson detail, quiz/task submission
│   │   └── teacher/
│   │       ├── lessons.js                  # Teacher lesson list with engagement
│   │       └── lesson/
│   │           └── [id].js                 # Engagement summary, marking interface
│   ├── styles.css                          # Global styles, Roboto font, background
│   ├── package.json                        # Frontend dependencies (Next, MUI, SWR)
│   ├── package-lock.json
│   ├── next.config.js                      # Next.js configuration
│   └── .env.local                          # Frontend environment (not committed)
├── .gitignore                              # Global ignore: node_modules, .env, build artifacts
├── README.md                               # This file
└── prisma.config.ts                        # Prisma CLI config for migrations
```

## File Descriptions

**Backend Core:**
- `index.js` — Starts Express server, handles SIGINT/SIGTERM for graceful Prisma disconnect
- `db.js` — Prisma client with singleton pattern (prevents connection exhaustion in dev)
- `seed.js` — Creates sample students, teachers, lessons, questions, tasks
- `src/app.js` — Express setup: CORS (configurable via `CORS_ORIGIN` env), JSON parsing, route mounting

**Backend Routes & Controllers:**
- Routes delegate to controllers; controllers call services
- `src/routes/users.js` → `usersController.js` → `usersService.js`
- `src/routes/lessons.js` → `lessonsController.js` → `lessonsService.js`
- `src/routes/teacher.js` → `teacherController.js` → `teacherService.js`

**Backend Services:**
- `lessonsService.js` — ~100 lines: getAllLessons, getLesson, getStatus, recordView, submitQuiz, submitTask, getAttempts, getSubmissions, markTask, markQuiz
- `usersService.js` — getAllUsers (students + teachers)
- `teacherService.js` — getEngagement (per-lesson student progress)

**Frontend Pages:**
- `_app.js` — Wraps all pages with MUI ThemeProvider and CssBaseline
- `index.js` — Dropdown login for role & user selection
- `student/lessons.js` — Grid of lesson cards showing quiz score & task mark
- `student/lesson/[id].js` — Lesson detail with video, quiz form, task textarea; auto-redirect when done
- `teacher/lessons.js` — Lesson cards showing engagement metrics (views, quiz attempts)
- `teacher/lesson/[id].js` — Engagement table, quiz attempts with Q&A details, task submissions with inline marking

**Database:**
- Migrations in `prisma/migrations/` are committed to enable easy schema reproduction
- `schema.prisma` — 9 models (Student, Teacher, Lesson, QuizQuestion, QuizAttempt, QuizAnswer, LessonTask, TaskSubmission, LessonView)
```

## Features

### Student Flow
- View available lessons with descriptions and YouTube videos
- Submit quizzes with immediate scoring
- Submit written tasks
- View personal quiz scores and task marks on lessons list
- See completion status (awaiting mark, marked, not submitted)

### Teacher Flow
- View lessons with student engagement metrics (views, quiz completions)
- Review all student quiz attempts with question details and answers
- Review and mark task submissions
- Inline marking interface for both quizzes and tasks

## Setup & Installation

### Prerequisites
- Node.js 16+ and npm
- PostgreSQL database (Neon recommended for cloud hosting)
- Git

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Create `.env` file with your PostgreSQL connection:
   ```
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   PORT=4000
   NODE_ENV=development
   ```

4. **Set up database:**
   ```bash
   # Generate Prisma client
   npx prisma generate

   # Create and apply migrations
   npx prisma migrate dev --name init

   # Seed sample data
   npm run seed
   ```

5. **Start the server:**
   ```bash
   # Development (with nodemon)
   npm run dev

   # Production
   npm start
   ```

   Server runs on `http://localhost:4000`

### Frontend Setup

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Create `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:3000`

## API Endpoints

### Users
- `GET /api/users` — List all students and teachers

### Lessons
- `GET /api/lessons` — List all lessons
- `GET /api/lessons/:id` — Get lesson details with quiz questions and tasks
- `GET /api/lessons/:id/status?student_id=X` — Get student's quiz/task status for lesson
- `POST /api/lessons/view` — Record student lesson view
- `POST /api/lessons/quiz/submit` — Submit quiz answers
- `POST /api/lessons/task/submit` — Submit task response
- `GET /api/lessons/:id/attempts` — Get quiz attempts (teacher view)
- `GET /api/lessons/:id/submissions` — Get task submissions (teacher view)
- `POST /api/lessons/quiz/mark` — Update quiz score (teacher)
- `POST /api/lessons/task/mark` — Update task mark (teacher)

### Teacher
- `GET /api/teacher/lessons/:id/engagement` — Student engagement summary for lesson

### Health
- `GET /health` — Server health check (uptime)

## Database Schema

### Models
- **Student** — name, email
- **Teacher** — name, email
- **Lesson** — title, description, video_url, teacher_id, published_at
- **QuizQuestion** — lesson_id, question_text, options, correct_option
- **QuizAttempt** — lesson_id, student_id, score, submitted_at
- **QuizAnswer** — attempt_id, question_id, answer
- **LessonTask** — lesson_id, task_text
- **TaskSubmission** — task_id, student_id, content, mark, submitted_at
- **LessonView** — lesson_id, student_id, viewed_at

## Production Deployment

### Environment Variables
Set these in your deployment platform (Vercel, Render, AWS, etc.):

**Backend:**
```
DATABASE_URL=<your-neon-connection-string>
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

**Frontend:**
```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Backend Deployment

1. **Ensure migrations are committed:**
   ```bash
   git add backend/prisma/migrations/
   git commit -m "Add Prisma migrations"
   ```

2. **Deploy to Vercel, Render, or similar:**
   - Configure DATABASE_URL and other env vars in platform settings
   - Set up deployment script to run `npx prisma migrate deploy` before starting the server
   - Example `Procfile` for Heroku/Render:
     ```
     release: npx prisma migrate deploy
     web: npm start
     ```

3. **Start the server:**
   The `/health` endpoint can be used for readiness checks

### Frontend Deployment

1. **Deploy to Vercel (recommended for Next.js):**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Or deploy elsewhere:**
   - Run `npm run build` locally to test
   - Configure `NEXT_PUBLIC_API_URL` to point to your production backend
   - Deploy the built app

## Development

### Running Locally
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Seeding Test Data
```bash
cd backend
npm run seed
```

Adds 3 students, 2 teachers, 2 lessons with quiz questions and tasks.

### Database Management
```bash
# View database in Prisma Studio
cd backend
npx prisma studio

# Create a new migration after schema changes
npx prisma migrate dev --name <migration-name>

# Reset database (dev only - WARNING: deletes all data)
npx prisma migrate reset
```

## Architecture

### Backend Architecture (MVC)
- **Routes** (`src/routes/`) — Define API endpoints
- **Controllers** (`src/controllers/`) — Handle requests, validate input, call services
- **Services** (`src/services/`) — Encapsulate business logic and DB queries
- **Database** (`db.js`) — Prisma client (singleton pattern for dev/prod)

### Frontend Architecture
- **Pages** — Next.js pages with React components
- **Styling** — Material-UI for consistent UI, global styles in `styles.css`
- **Data Fetching** — SWR for client-side data with automatic caching
- **Environment** — `NEXT_PUBLIC_*` variables for client-side config

## Key Design Decisions

1. **Prisma ORM** — Type-safe DB access, migrations, and query building
2. **Singleton Prisma Client** — Preserves connections in development (nodemon), avoids exhausting the connection pool
3. **Graceful Shutdown** — SIGINT/SIGTERM handlers to disconnect Prisma cleanly
4. **CORS Origin from Env** — Prevents open CORS in production
5. **Health Endpoint** — `/health` for load balancer readiness checks
6. **Environment Variables** — Separate configs for dev/prod without code changes
7. **Migrations Committed** — Ensures users can populate the DB schema when cloning

## Troubleshooting

### Backend Issues

**Error: "adapter" property can only be provided with driverAdapters**
- Use `datasourceUrl` instead of `adapter` in PrismaClient options

**Port already in use**
- Change `PORT` in `.env` or kill process: `lsof -i :4000`

**Database connection fails**
- Verify `DATABASE_URL` is correct and Neon/PostgreSQL is running
- Check network connectivity if using a remote database

### Frontend Issues

**API returns 404**
- Verify backend is running on the configured API URL
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

**Build fails with "process.env.NEXT_PUBLIC_API_URL is undefined"**
- Ensure `.env.local` is created and Next.js is restarted after changes

## Testing

Currently no automated tests. Recommended additions:
- Jest for backend unit tests (services and utils)
- React Testing Library for frontend component tests
- Integration tests for key API flows

## Contributing

1. Create a feature branch from `main`
2. Make changes and test locally
3. Commit and push
4. Create a pull request
