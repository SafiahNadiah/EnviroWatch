-- EnviroWatch Database Schema
-- PostgreSQL Database Schema for Environmental Monitoring Dashboard

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_sessions CASCADE;
DROP TABLE IF EXISTS monitoring_records CASCADE;
DROP TABLE IF EXISTS monitoring_points CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table with role-based access
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user', -- 'admin' or 'user'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monitoring points (locations where environmental data is collected)
CREATE TABLE monitoring_points (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'air', 'river', 'marine'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'maintenance'
    installed_date DATE,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monitoring records (actual environmental measurements)
CREATE TABLE monitoring_records (
    id SERIAL PRIMARY KEY,
    monitoring_point_id INTEGER REFERENCES monitoring_points(id) ON DELETE CASCADE,
    recorded_at TIMESTAMP NOT NULL,
    
    -- Air quality parameters
    pm25 DECIMAL(10, 2), -- PM2.5 (µg/m³)
    pm10 DECIMAL(10, 2), -- PM10 (µg/m³)
    aqi INTEGER, -- Air Quality Index
    temperature DECIMAL(5, 2), -- Temperature (°C)
    humidity DECIMAL(5, 2), -- Humidity (%)
    
    -- Water quality parameters
    ph DECIMAL(4, 2), -- pH level
    dissolved_oxygen DECIMAL(5, 2), -- DO (mg/L)
    turbidity DECIMAL(10, 2), -- Turbidity (NTU)
    conductivity DECIMAL(10, 2), -- Conductivity (µS/cm)
    
    -- General
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_monitoring_records_point_id ON monitoring_records(monitoring_point_id);
CREATE INDEX idx_monitoring_records_recorded_at ON monitoring_records(recorded_at);

-- Chat sessions (for AI chatbot)
CREATE TABLE chat_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Chat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages (conversation history)
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monitoring_points_updated_at BEFORE UPDATE ON monitoring_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
