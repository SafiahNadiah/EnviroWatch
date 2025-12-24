# EnviroWatch Backend API

Production-ready backend API for EnviroWatch Environmental Monitoring Dashboard.

## Tech Stack
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Role-based Access Control

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Setup Database
```bash
# Create PostgreSQL database named 'envirowatch'
createdb envirowatch

# Run database setup script
npm run db:setup

# Seed with sample data
npm run db:seed
```

### 4. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Monitoring Points
- `GET /api/monitoring-points` - Get all monitoring points
- `POST /api/monitoring-points` - Create monitoring point (Admin)
- `PUT /api/monitoring-points/:id` - Update monitoring point (Admin)
- `DELETE /api/monitoring-points/:id` - Delete monitoring point (Admin)

### Monitoring Records
- `GET /api/monitoring-records` - Get monitoring records (with filters)
- `POST /api/monitoring-records` - Create monitoring record
- `GET /api/monitoring-records/stats` - Get statistics

### AI Chatbot
- `POST /api/chat/message` - Send chat message
- `GET /api/chat/sessions` - Get user's chat sessions
- `GET /api/chat/sessions/:sessionId/messages` - Get session messages

### Admin
- `GET /api/admin/users` - Get all users (Admin only)
- `PUT /api/admin/users/:id/role` - Update user role (Admin only)
- `DELETE /api/admin/users/:id` - Delete user (Admin only)

## Default Admin Account
- Email: admin@envirowatch.com
- Password: Admin123!

## Database Schema
See `src/config/schema.sql` for full database schema.
