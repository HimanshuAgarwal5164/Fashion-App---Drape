@echo off
echo ============================================
echo   DRAPE - Starting App
echo ============================================

echo.
echo Starting FastAPI backend on http://localhost:8000 ...
start "DRAPE Backend" cmd /k "cd /d "%~dp0backend" && "C:\Users\Himanshu Agarwal\anaconda3\Scripts\uvicorn.exe" app.main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo Starting Next.js frontend on http://localhost:3000 ...
start "DRAPE Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 4 /nobreak >nul

echo.
echo ============================================
echo   DRAPE is running!
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo ============================================

start http://localhost:3000
