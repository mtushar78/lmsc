# LMSC E-Learning Platform

A full-stack e-learning platform with automated lesson management, quiz systems, and student progress tracking.

## Description

LMSC is a production-ready e-learning platform featuring:
- Student lesson viewing and quiz submission
- Teacher dashboard with engagement analytics
- Automated database migrations and seeding
- Full Docker support with hot-reload development
- Comprehensive test coverage (66+ tests)

## Tech Stack

### Backend
- **Node.js 18** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL 15** - Primary database
- **Prisma ORM** - Database management
- **Redis** - Caching layer
- **JWT** - Authentication
- **Jest + Supertest** - Testing (68.87% coverage)

### Frontend
- **Next.js 14** - React framework
- **React 18** - UI library
- **Material-UI v5** - Component library
- **SWR** - Data fetching
- **Emotion** - Styling

### DevOps
- **Docker + Docker Compose** - Containerization
- **Git** - Version control

## Project Structure

```
LMSC/
├── backend/                    # Express.js API
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── controllers/       # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── domain/            # Validators & mappers
│   │   ├── middleware/        # Auth middleware
│   │   └── __tests__/         # Test suites
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── migrations/        # Migration files
│   ├── index.js               # Server entry
│   ├── seed.js                # Database seeding
│   └── docker-entrypoint.sh   # Auto-migration script
│
├── frontend/                   # Next.js app
│   ├── pages/
│   │   ├── index.js           # Login page
│   │   ├── student/           # Student pages
│   │   └── teacher/           # Teacher pages
│   └── styles.css
│
├── docker-compose.yml          # Docker orchestration
├── docker-helper.sh            # Helper commands
└── DOCKER_SETUP.md            # Docker documentation
```

## How to Run Locally

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis (optional)

### Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run migrations
npx prisma migrate dev

# Seed database
npm run seed

# Start development server
npm run dev
```

Backend runs on [http://localhost:4000](http://localhost:4000)

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local if needed (default: http://localhost:4000)

# Start development server
npm run dev
```

Frontend runs on [http://localhost:3000](http://localhost:3000)

## How to Run in Docker

Docker setup includes **automatic migrations and seeding** - just start the containers!

### Quick Start

```bash
# Start all services (migrations and seeding happen automatically)
docker-compose up -d

# Services available at:
# - Frontend: http://localhost:3000
# - Backend:  http://localhost:4000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

### Using Helper Script

```bash
# Fresh setup with clean data
./docker-helper.sh setup

# Start services
./docker-helper.sh start

# View logs
./docker-helper.sh logs backend
./docker-helper.sh logs frontend

# Stop services
./docker-helper.sh stop

# Complete cleanup
docker-compose down -v
```

### What Happens Automatically

When you run `docker-compose up -d`:
1. ✅ PostgreSQL and Redis start
2. ✅ Backend waits for database
3. ✅ **Migrations run automatically**
4. ✅ **Database seeds automatically** with sample data
5. ✅ Backend starts on port 4000
6. ✅ Frontend starts on port 3000

**Sample Data Included:**
- Students: Alice Johnson, Bob Smith, Charlie Lee
- Teachers: Mrs Green, Mr Brown
- Lessons: Quadratics, Forces
- Quiz questions and tasks

See [DOCKER_SETUP.md](DOCKER_SETUP.md) for detailed Docker documentation.

## How to Deploy

### Production Build

#### Backend
```bash
cd backend
npm install
NODE_ENV=production npm start
```

#### Frontend
```bash
cd frontend
npm install
npm run build
npm start
```

### Docker Deployment

```bash
# Build images
docker build -t lmsc-backend:latest ./backend
docker build -t lmsc-frontend:latest ./frontend

# Run with docker-compose
docker-compose up -d

# Or push to registry
docker tag lmsc-backend:latest myregistry/lmsc-backend:latest
docker push myregistry/lmsc-backend:latest
```

### Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://user:password@host:5432/lmsc_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
NODE_ENV=production
PORT=4000
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production Checklist
- [ ] Set strong `JWT_SECRET`
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Enable logging and monitoring
- [ ] Configure health checks
- [ ] Set up error tracking (Sentry, etc.)

## Testing

```bash
cd backend

# Run all tests with coverage
npm test

# Watch mode
npm run test:watch

# Integration tests only
npm run test:integration

# Unit tests only
npm run test:unit
```

**Test Coverage:** 68.87% (66+ tests)
- Domain/Validators: 97%
- Services: 86%
- Controllers: 87%
- Integration: Full API flows

## API Endpoints

### Public
- `GET /health` - Health check
- `GET /api/users` - Get all users
- `GET /api/lessons` - Get all lessons

### Students
- `GET /api/lessons/:id` - Get lesson details
- `POST /api/lessons/:id/quiz` - Submit quiz
- `POST /api/lessons/:id/task` - Submit task
- `POST /api/lessons/:id/view` - Mark lesson viewed

### Teachers
- `GET /api/teacher/engagement` - Get engagement analytics

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - System design and scalability
- [DOCKER_SETUP.md](DOCKER_SETUP.md) - Docker usage guide
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick reference

## License

MIT
