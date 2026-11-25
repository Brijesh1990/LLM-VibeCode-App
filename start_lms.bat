@echo off
title NexusLMS Enterprise — Full-Stack Startup Launcher
echo ===============================================================
echo   NEXUSLMS ENTERPRISE (React 19 + Tailwind 4 + FastAPI + MySQL)
echo ===============================================================

mkdir "D:\LLM-VibeCoding\.cache\temp" 2>nul
mkdir "D:\LLM-VibeCoding\.cache\npm" 2>nul
set TEMP=D:\LLM-VibeCoding\.cache\temp
set TMP=D:\LLM-VibeCoding\.cache\temp
set npm_config_cache=D:\LLM-VibeCoding\.cache\npm

echo [1/2] Starting FastAPI Backend Server on http://localhost:8000 ...
start "NexusLMS Backend (FastAPI :8000)" cmd /k "cd /d D:\LLM-VibeCoding\backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Starting React 19 + Vite Frontend on http://localhost:5173 ...
start "NexusLMS Frontend (Vite :5173)" cmd /k "cd /d D:\LLM-VibeCoding\frontend && node node_modules/vite/bin/vite.js --port 5173 --host"

echo.
echo [OK] Both servers launched!
echo   - Frontend Portal:   http://localhost:5173
echo   - Backend API Root:  http://localhost:8000/api/v1
echo   - Swagger API Docs:  http://localhost:8000/docs
echo ===============================================================
