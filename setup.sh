#!/usr/bin/env bash
set -euo pipefail

# ------------------------------------------------------------------------------
# Task Manager Pro — Local Setup Script (Git Bash on Windows)
# This script prepares the environment, starts Docker PostgreSQL, installs deps,
# runs Prisma migrations/generate, and prints final instructions.
# Requirements: Docker Desktop running, Git Bash (NOT PowerShell).
# ------------------------------------------------------------------------------

info()  { printf "[INFO] %s\n" "$*"; }
warn()  { printf "[WARN] %s\n" "$*" >&2; }
error() { printf "[ERROR] %s\n" "$*" >&2; }

# 0) Defensive checks
if ! command -v docker >/dev/null 2>&1; then
  error "Docker is not installed or not in PATH. Install Docker Desktop first."
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  error "Docker Desktop appears not to be running. Please open Docker Desktop and retry."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  error "npm is not installed or not in PATH. Install Node.js LTS and retry."
  exit 1
fi

# 1) .env handling
if [ ! -f ".env" ]; then
  if [ -f ".env.example" ]; then
    info "Creating .env from .env.example"
    cp .env.example .env
  else
    error ".env.example not found. Please add it and retry."
    exit 1
  fi
else
  info ".env already exists. Skipping copy."
fi

# 2) Start Postgres via Docker Compose
info "Starting Docker Compose services (PostgreSQL)..."
docker compose up -d

# 3) Install dependencies (clean)
info "Installing dependencies with npm ci..."
npm ci

# 4) Apply DB migrations and generate Prisma Client
info "Applying Prisma migrations..."
npx prisma migrate deploy

info "Generating Prisma Client..."
npx prisma generate

# 5) Final instructions
cat <<'EOF'

Setup complete.

Next steps:
1) Start the dev server:
   npm run dev

2) Register your first user (this auto-seeds 50 tasks for that user):
   Use the UI at http://localhost:3000/register
   or via curl:
   curl -i -X POST "http://localhost:3000/api/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"name":"Demo","email":"demo@example.com","password":"testpass123"}'

3) Sign in:
   http://localhost:3000/login

Notes:
- Default terminal: Git Bash (NOT PowerShell).
- If Prisma or Next.js show file locking errors on Windows, ensure the project is NOT under OneDrive.
- Use Prisma Studio if needed:
   npx prisma studio

EOF
