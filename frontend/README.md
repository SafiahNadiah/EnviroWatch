# EnviroWatch Frontend

Next.js frontend for EnviroWatch Environmental Monitoring Dashboard.

## Tech Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- ArcGIS JavaScript API
- Chart.js
- Axios

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env.local` file in the root directory:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
npm start
```

## Features

### Authentication
- Login/Register pages
- JWT token management
- Protected routes
- Role-based access control

### Dashboard
- Environmental monitoring overview
- Real-time statistics
- Interactive charts
- Data tables with filters

### GIS Map
- Interactive map powered by ArcGIS
- Monitoring station markers
- Layer toggles (Air, River, Marine)
- Popup information windows

### AI Chatbot
- ChatGPT-style interface
- Environmental data insights
- Conversation history
- Intelligent responses

### Admin Panel
- User management
- Monitoring point management
- System statistics
- Role assignment

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Manual Deployment
```bash
npm run build
# Deploy the .next folder to your hosting provider
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (required)

## Default Admin Account
- Email: admin@envirowatch.com
- Password: Admin123!
