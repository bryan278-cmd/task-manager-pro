# Task Manager Pro v2.0.0

A local-first task management application with multi-user authentication and per-user task ownership.

## Prerequisites

- **Windows 10/11** - The application is designed and tested for Windows environments
- **Docker Desktop** - Must be installed and running for PostgreSQL database
- **Git Bash** - Default terminal (NOT PowerShell) for running setup scripts
- **Node.js v22.19.0** - Required for Next.js 15 runtime
- **npm 11.6.0** - Package manager for dependencies

**Project Path Recommendation**: Clone to `C:\dev\task-manager-pro` (avoid OneDrive to prevent Prisma EPERM errors)

## Quick Start

```bash
git clone <repo-url>
cd task-manager-pro
npm run setup
npm run dev
```

Use `npm run dev:3000` to align NEXTAUTH_URL and free the port automatically. Then `export APP_PORT=3000 && npm run smoke`.

## First User Registration

Visit http://localhost:3000/register to create your first user account. This will automatically seed 50 tasks for your user.

Then login at http://localhost:3000/login.

## API Testing Snippets

### Unauthenticated (should return 401)
```bash
curl -i "http://localhost:3000/api/tasks?page=1&pageSize=10"
```

### Register user via API
```bash
curl -i -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo","email":"demo@example.com","password":"testpass123"}'
```

## How Auth Works (Local)

- **NextAuth Credentials Provider** - Email/password authentication with bcrypt hashing
- **JWT-based sessions** - No external services required, all authentication is local
- **Per-user task isolation** - Each user can only access their own tasks

## Database

- **PostgreSQL 15** via Docker (started automatically by setup script)
- **Prisma ORM** with User-Task relational model
- **Per-user auto-seed** - 50 tasks automatically created at user registration

## Troubleshooting (Windows-friendly)

- **Prisma P1000 (Auth failed)**: Ensure database exists; see helper SQL in docs
- **P3014 / P3015 migration errors**: Fix roles/migrations; re-run `npx prisma migrate dev`
- **EPERM on Windows**: Move repo to `C:\dev\task-manager-pro`, stop OneDrive sync, run `npm ci` and `npx prisma generate`
- **Port 5432 in use**: Stop other PostgreSQL instances or change Docker port mapping
- **NEXTAUTH_SECRET/URL missing**: Add to `.env` (see `.env.example`)
- **High browser memory**: Use Incognito without extensions; performance hardening included (windowed infinite scroll, throttled scroll, fetch cancellation)

## Development

- **Git Flow**: Small thematic branches (`feat/`, `chore/`, `fix/`), pull requests, squash merge
- **Default tools**: Git Bash, Docker Desktop, VS Code, Cline
- **Helper scripts**:
  - `npm run setup` - Run the complete local setup
  - `npm run db:studio` - Open Prisma Studio for database inspection
  - `npm run db:migrate` - Create new database migrations
  - `npm run db:generate` - Regenerate Prisma Client

## Demo Quick Start

### Requirements
- **Node.js** (v22.19.0 recommended)
- **Docker Desktop** (for PostgreSQL database)

### Setup
1. `cp .env.example .env` and set `NEXTAUTH_URL` to match your frontend port
2. `docker compose up -d` (Starts PostgreSQL database)
3. `npm install` (Install dependencies)
4. `npx prisma db push` (Initialize database schema)
5. `npm run dev` (Start development server)

### Test the Application
- Visit `/register` → create user, then `/login`, then `/` (dashboard), then logout
- Or run `npm run smoke` for quick endpoint testing

### Notes
- No external services required; everything runs locally
- Database will persist data between sessions
- All authentication is handled locally via NextAuth.js

## License / Notes

- **Local-first**: No cloud services required for authentication or operation
- **Code comments**: Kept clear and professional (no emojis in source)
