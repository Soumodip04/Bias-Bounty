@echo off
echo ========================================
echo BiasBounty - Full Application Startup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Python is installed
where python >nul 2>nul
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://www.python.org/
    pause
    exit /b 1
)

echo [✓] Node.js found: 
node --version
echo.
echo [✓] Python found: 
python --version
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo [!] node_modules not found. Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    echo.
)

REM Check if virtual environment exists
if not exist bias-detection-service\venv (
    echo [!] Virtual environment not found. Please run setup-backend-venv.bat first!
    echo.
    echo Would you like to set it up now? (Y/N)
    set /p setup_venv=
    if /i "%setup_venv%"=="Y" (
        call setup-backend-venv.bat
        if errorlevel 1 (
            echo ERROR: Backend setup failed
            pause
            exit /b 1
        )
    ) else (
        echo Please run setup-backend-venv.bat before starting the application
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo Starting BiasBounty Application
echo ========================================
echo.
echo [1] Starting Backend (Python FastAPI)...
echo Backend will run on: http://localhost:8000
echo.

REM Start backend in a new window
start "BiasBounty Backend" cmd /k "cd /d %CD%\bias-detection-service && venv\Scripts\activate.bat && python main.py"

REM Wait a bit for backend to start
timeout /t 5 /nobreak >nul

echo [2] Starting Frontend (Next.js)...
echo Frontend will run on: http://localhost:3000
echo.

REM Start frontend in a new window
start "BiasBounty Frontend" cmd /k "cd /d %CD% && npm run dev"

echo.
echo ========================================
echo Application Started!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Two new windows opened:
echo - BiasBounty Backend (Python FastAPI)
echo - BiasBounty Frontend (Next.js)
echo.
echo Press any key to close this window...
echo (The application will continue running in separate windows)
pause >nul
