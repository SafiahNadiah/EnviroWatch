# EnviroWatch Setup Script
# Run this script after installing Node.js and PostgreSQL

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   EnviroWatch - Automated Setup Script" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Check if npm is installed
Write-Host "Checking for Node.js/npm..." -ForegroundColor Yellow
$npmExists = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmExists) {
    Write-Host "X npm not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Write-Host "After installation, restart your terminal and run this script again." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

$npmVersion = npm --version
Write-Host "OK npm found (version $npmVersion)" -ForegroundColor Green

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptPath "backend"
$frontendPath = Join-Path $scriptPath "frontend"

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Step 1: Backend Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location $backendPath
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK Backend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "X Backend installation failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Create .env file if it doesn't exist
$envPath = Join-Path $backendPath ".env"
$envExamplePath = Join-Path $backendPath ".env.example"

if (-not (Test-Path $envPath)) {
    Write-Host ""
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item $envExamplePath $envPath
    Write-Host "OK .env file created" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Please edit backend/.env with your PostgreSQL credentials" -ForegroundColor Yellow
    Write-Host "   Default database name: envirowatch" -ForegroundColor Yellow
    Write-Host "   Default user: postgres" -ForegroundColor Yellow
    Write-Host "   You need to set your PostgreSQL password in DB_PASSWORD" -ForegroundColor Yellow
} else {
    Write-Host "OK .env file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Step 2: Frontend Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location $frontendPath
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK Frontend dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "X Frontend installation failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Step 3: Database Setup Instructions" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps to complete the setup:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Make sure PostgreSQL is installed and running" -ForegroundColor White
Write-Host "   Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Create the database:" -ForegroundColor White
Write-Host "   psql -U postgres -c `"CREATE DATABASE envirowatch;`"" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Update backend/.env with your PostgreSQL password" -ForegroundColor White
Write-Host ""
Write-Host "4. Initialize the database schema:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run db:setup" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Seed the database with sample data:" -ForegroundColor White
Write-Host "   npm run db:seed" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Start the backend server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "   (Runs on http://localhost:5000)" -ForegroundColor Gray
Write-Host ""
Write-Host "7. In a new terminal, start the frontend:" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host "   (Runs on http://localhost:3000)" -ForegroundColor Gray
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Default Login Credentials" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Admin Account:" -ForegroundColor Green
Write-Host "  Email: admin@envirowatch.com" -ForegroundColor White
Write-Host "  Password: Admin123!" -ForegroundColor White
Write-Host ""
Write-Host "User Account:" -ForegroundColor Green
Write-Host "  Email: john.doe@envirowatch.com" -ForegroundColor White
Write-Host "  Password: User123!" -ForegroundColor White
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $scriptPath
Write-Host "All dependencies installed successfully!" -ForegroundColor Green
Write-Host "Follow the steps above to complete the database setup." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to exit"
