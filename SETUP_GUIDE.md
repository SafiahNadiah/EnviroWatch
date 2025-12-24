# EnviroWatch - Quick Setup Guide

This guide will help you set up and run the EnviroWatch application.

## Prerequisites

Before running the setup script, you need to install:

### 1. Node.js (Required)
- **Download:** https://nodejs.org/
- **Version:** LTS (Long Term Support) recommended
- **Installation:** 
  - Download the Windows installer (.msi)
  - Run the installer with default options
  - **Important:** Restart VS Code/Terminal after installation

### 2. PostgreSQL (Required)
- **Download:** https://www.postgresql.org/download/windows/
- **Version:** 14 or higher recommended
- **Installation:**
  - Download the Windows installer
  - During installation, remember the password you set for the `postgres` user
  - Default port: 5432 (keep default)
  - Install Stack Builder components (optional)

## Automated Setup

Once Node.js and PostgreSQL are installed:

### Windows PowerShell

1. Open PowerShell in the project directory
2. Run the setup script:
   ```powershell
   .\setup.ps1
   ```

If you get an execution policy error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup.ps1
```

The script will:
- ✓ Check for npm installation
- ✓ Install backend dependencies
- ✓ Install frontend dependencies
- ✓ Create .env configuration file
- ✓ Provide next steps for database setup

## Manual Setup (Alternative)

If you prefer to set up manually:

### Backend Setup

```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env

# Edit .env file with your PostgreSQL password
# Use any text editor to update DB_PASSWORD

# Create database
psql -U postgres -c "CREATE DATABASE envirowatch;"

# Initialize database schema
npm run db:setup

# Seed with sample data
npm run db:seed

# Start backend server
npm run dev
```

The backend will run on **http://localhost:5000**

### Frontend Setup

Open a new terminal:

```powershell
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend development server
npm run dev
```

The frontend will run on **http://localhost:3000**

## Database Configuration

Edit `backend/.env` with your PostgreSQL credentials:

```env
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=envirowatch
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here  # ← Update this!

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## Default Login Credentials

After seeding the database, you can log in with:

### Admin Account
- **Email:** admin@envirowatch.com
- **Password:** Admin123!

### Regular User Account
- **Email:** john.doe@envirowatch.com
- **Password:** User123!

## Troubleshooting

### npm not found
**Problem:** PowerShell says "npm is not recognized"
**Solution:** 
1. Install Node.js from https://nodejs.org/
2. Restart your terminal/VS Code
3. Verify installation: `npm --version`

### PostgreSQL connection error
**Problem:** "ECONNREFUSED" or "password authentication failed"
**Solution:**
1. Make sure PostgreSQL is running (check Services in Windows)
2. Verify your password in `backend/.env` matches your PostgreSQL password
3. Check that the database `envirowatch` exists:
   ```powershell
   psql -U postgres -l
   ```

### Port already in use
**Problem:** "Port 5000 is already in use"
**Solution:**
1. Stop any running backend server
2. Or change the PORT in `backend/.env`

### Module not found errors in VS Code
**Problem:** Red squiggly lines, "Cannot find module 'react'"
**Solution:**
1. Run `npm install` in frontend directory
2. Restart VS Code (Ctrl+Shift+P → "Reload Window")

### Tailwind CSS warnings
**Problem:** "Unknown at rule @tailwind"
**Solution:** These are false warnings. Tailwind will work correctly when you run `npm run dev`. You can ignore these or install the Tailwind CSS IntelliSense extension.

## Recommended VS Code Extensions

For the best development experience, install:

1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **Tailwind CSS IntelliSense** - Tailwind autocompletion
4. **PostgreSQL** - Database management
5. **Thunder Client** or **REST Client** - API testing

## Next Steps

Once everything is running:

1. Open **http://localhost:3000** in your browser
2. Log in with admin credentials
3. Explore the features:
   - **Dashboard** - View monitoring statistics
   - **Map** - Interactive GIS map with monitoring points
   - **AI Chat** - Environmental monitoring chatbot
   - **Admin** - User and monitoring point management

## Production Deployment

For production deployment instructions, see the main [README.md](README.md#deployment) file.

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review API endpoints in README.md
- Check database schema in `backend/src/config/schema.sql`

---

**Happy monitoring! 🌍💚**
