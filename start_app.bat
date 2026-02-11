@echo off
TITLE Payroll System Launcher

:: 1. root path
cd /d "%~dp0"

echo ===================================================
echo   Payroll app is starting
echo ===================================================

:: 2. Backend starting point
echo Starting Backend...
cd backend
start /min "Payroll Backend" cmd /k "venv\Scripts\activate && uvicorn app.main:app --reload"
cd ..

:: 3. Frontend starting point
echo Starting Frontend...
cd frontend
start /min "Payroll Frontend" cmd /k "npm run dev"
cd ..

:: 4. 5 seconds await so servers have time to start
echo Waiting for servers to start...
timeout /t 5 /nobreak >nul

:: 5. Starts the browser
echo Opening Browser...
start http://localhost:5173

echo.
echo ===================================================
echo   System is running ...
echo ===================================================
timeout /t 3 >nul
exit