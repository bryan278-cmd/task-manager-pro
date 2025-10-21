@echo off
setlocal enabledelayedexpansion

echo [INFO] Task Manager Pro - Setup (Windows cmd)

where docker >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Docker not found in PATH. Install Docker Desktop first.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found in PATH. Install Node.js and retry.
  exit /b 1
)

if not exist ".env" (
  if exist ".env.example" (
    echo [INFO] Creating .env from .env.example
    copy /Y .env.example .env >nul
  ) else (
    echo [ERROR] .env.example not found.
    exit /b 1
  )
) else (
  echo [INFO] .env already exists. Skipping copy.
)

echo [INFO] Starting Docker Compose...
docker compose up -d

echo [INFO] Installing dependencies (npm ci)...
npm ci

echo [INFO] Applying Prisma migrations...
npx prisma migrate deploy

echo [INFO] Generating Prisma Client...
npx prisma generate

echo.
echo Setup complete.
echo.
echo Next steps:
echo   1) npm run dev
echo   2) Register first user at http://localhost:3000/register
echo.

endlocal
