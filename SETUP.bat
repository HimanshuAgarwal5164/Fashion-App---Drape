@echo off
if "%1"=="run" goto run
start "DRAPE Setup" cmd /k "%~f0" run
exit

:run
echo ============================================
echo   DRAPE - Setup
echo ============================================
echo.
echo [1/2] Installing Python backend dependencies...
cd /d "%~dp0backend"
"C:\Users\Himanshu Agarwal\anaconda3\Scripts\pip.exe" install -r requirements.txt

echo.
echo [2/2] Installing frontend dependencies...
cd /d "%~dp0frontend"
npm install --no-audit --no-fund

echo.
echo ============================================
echo   Setup complete! Run START.bat to launch.
echo ============================================
echo.
pause
