-- Database initialization script for development
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create development user with full permissions
CREATE USER IF NOT EXISTS modernen_dev WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE modernen_dev TO modernen_dev;
GRANT ALL ON SCHEMA public TO modernen_dev;

-- Create test database
CREATE DATABASE IF NOT EXISTS modernen_test OWNER modernen_dev;

-- Set up basic schema for development
-- You can add more initialization SQL here as needed
