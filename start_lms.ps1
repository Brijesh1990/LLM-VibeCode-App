$ErrorActionPreference = "Continue"
New-Item -ItemType Directory -Force -Path "D:\LLM-VibeCoding\.cache\temp" | Out-Null
New-Item -ItemType Directory -Force -Path "D:\LLM-VibeCoding\.cache\npm" | Out-Null
$env:TEMP = "D:\LLM-VibeCoding\.cache\temp"
$env:TMP = "D:\LLM-VibeCoding\.cache\temp"
$env:npm_config_cache = "D:\LLM-VibeCoding\.cache\npm"

Write-Host "Starting NexusLMS FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'D:\LLM-VibeCoding\backend'; python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "Starting NexusLMS React 19 Frontend on http://localhost:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'D:\LLM-VibeCoding\frontend'; node node_modules/vite/bin/vite.js --port 5173 --host"
