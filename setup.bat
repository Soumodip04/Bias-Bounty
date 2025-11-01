@echo off
echo 🚀 Setting up BiasBounty MVP...
echo.

echo 📦 Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo 🐍 Setting up Python environment...
cd bias-detection-service
call python -m pip install --upgrade pip
call pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Create a Supabase project at https://supabase.com
echo 2. Copy .env.example to .env.local and fill in your Supabase credentials
echo 3. Run: npm run db:setup
echo 4. Start the development server: npm run dev
echo 5. In another terminal, start the bias detection service:
echo    cd bias-detection-service && python main.py
echo.
echo 🎉 Happy hacking!
pause