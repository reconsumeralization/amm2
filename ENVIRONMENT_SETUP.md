# Neon Database Integration Setup Guide

## 🚀 Neon Database Configuration

This guide will help you integrate your Neon database with the Modern Men Hair BarberShop project.

### Prerequisites
- Neon account and project created
- Database credentials from Neon dashboard
- Vercel project set up (for deployment)

### Database URLs Provided
```
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-morning-flower-adfadjif-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:YOUR_PASSWORD@ep-morning-flower-adfadjif.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## 📋 Setup Steps

### 1. Create Local Environment File

Create a `.env.local` file in the root directory with the following content:

```env
# =================================================================
# Modern Men Hair BarberShop - Local Environment Configuration
# =================================================================

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development

# =================================================================
# PAYLOAD CMS CONFIGURATION
# =================================================================

PAYLOAD_SECRET=your-super-secure-payload-secret-here-32-chars-minimum
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# =================================================================
# DATABASE CONFIGURATION
# =================================================================
# Choose ONE database option below:

# Option 1: NEON DATABASE (Recommended for Production)
DATABASE_URL=postgresql://neondb_owner:YOUR_ACTUAL_NEON_PASSWORD@ep-morning-flower-adfadjif-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:YOUR_ACTUAL_NEON_PASSWORD@ep-morning-flower-adfadjif.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# Option 2: SUPABASE DATABASE (Alternative)
# DATABASE_URL=postgres://postgres.vbokacytrvsgjahlyppf:bvlQaPZdmhRaKLr7@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x

# =================================================================
# SUPABASE CONFIGURATION (Required for additional features)
# =================================================================

# Supabase Project URLs
NEXT_PUBLIC_SUPABASE_URL=https://vbokacytrvsgjahlyppf.supabase.co
SUPABASE_URL=https://vbokacytrvsgjahlyppf.supabase.co

# Supabase Authentication Keys
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2thY3l0cnZzZ2phaGx5cHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0OTQyOTgsImV4cCI6MjA0OTA3MDI5OH0.0r6qM68hg5my1ynwVpaWWJr6-hv_jV3jBUESrfy6jIc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2thY3l0cnZzZ2phaGx5cHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzQ5NDI5OCwiZXhwIjoyMDQ5MDcwMjk4fQ.De-7PM0LquziRyT9Y1UAp46T8zhf8v86HkmrR7LOZ7s

# =================================================================
# AUTHENTICATION & SECURITY
# =================================================================

NEXTAUTH_SECRET=your-nextauth-secret-key-here-32-chars-minimum
JWT_SECRET=your-secure-jwt-secret-here-32-chars-minimum

# =================================================================
# DEVELOPMENT SETTINGS
# =================================================================

DEBUG=true
PAYLOAD_DEBUG=false
```

### 2. Replace Password Placeholder

Replace `YOUR_ACTUAL_NEON_PASSWORD` with your actual Neon database password from the Neon dashboard.

### 3. Generate Secure Secrets

Generate secure random strings (32+ characters) for:
- `PAYLOAD_SECRET`
- `NEXTAUTH_SECRET`
- `JWT_SECRET`

You can use this command to generate secure secrets:
```bash
openssl rand -base64 32
```

### 4. Test Database Connection

Run the development server to test the connection:
```bash
npm run dev
```

Visit `http://localhost:3000/admin` to verify Payload CMS is working with Neon.

### 5. Vercel Deployment Configuration

For Vercel deployment, set these environment variables in your Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

```
# Database Configuration (Choose ONE):
# Option 1: Neon Database
DATABASE_URL=postgresql://neondb_owner:YOUR_ACTUAL_NEON_PASSWORD@ep-morning-flower-adfadjif-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:YOUR_ACTUAL_NEON_PASSWORD@ep-morning-flower-adfadjif.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

# Option 2: Supabase Database
# DATABASE_URL=postgres://postgres.vbokacytrvsgjahlyppf:bvlQaPZdmhRaKLr7@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x

# Core Application Variables (Required)
PAYLOAD_SECRET=your-super-secure-payload-secret-here-32-chars-minimum
PAYLOAD_PUBLIC_SERVER_URL=https://modernmen-yolo.vercel.app
NEXT_PUBLIC_APP_URL=https://modernmen-yolo.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key-here-32-chars-minimum
JWT_SECRET=your-secure-jwt-secret-here-32-chars-minimum
NODE_ENV=production

# Supabase Configuration (Required for additional features)
NEXT_PUBLIC_SUPABASE_URL=https://vbokacytrvsgjahlyppf.supabase.co
SUPABASE_URL=https://vbokacytrvsgjahlyppf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2thY3l0cnZzZ2phaGx5cHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0OTQyOTgsImV4cCI6MjA0OTA3MDI5OH0.0r6qM68hg5my1ynwVpaWWJr6-hv_jV3jBUESrfy6jIc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2thY3l0cnZzZ2phaGx5cHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzQ5NDI5OCwiZXhwIjoyMDQ5MDcwMjk4fQ.De-7PM0LquziRyT9Y1UAp46T8zhf8v86HkmrR7LOZ7s
```

### 6. Database Schema Setup

The Payload CMS will automatically create the necessary database tables when you first run the application with the Neon database URL configured.

### 7. Verify Integration

After setup, verify that:

1. ✅ Application starts without database connection errors
2. ✅ Payload CMS admin panel loads at `/admin`
3. ✅ You can create/edit content in the admin panel
4. ✅ Data is being saved to the Neon database
5. ✅ Vercel deployment succeeds with the new environment variables

## 🔧 Troubleshooting

### Common Issues

1. **Connection Refused Error**
   - Verify your Neon database password is correct
   - Check that the database is not paused in Neon dashboard
   - Ensure SSL mode is set to `require`

2. **Payload CMS Not Loading**
   - Verify `PAYLOAD_SECRET` is set and is at least 32 characters
   - Check that `DATABASE_URL` is properly configured
   - Ensure PostgreSQL adapter is correctly installed

3. **Environment Variables Not Working**
   - For local development, ensure `.env.local` is in the root directory
   - For Vercel, check that variables are set in the correct environment (Production/Preview/Development)
   - Restart your development server after changing `.env.local`

### Database Connection Test

You can test your database connection with this simple script:

```javascript
// test-db-connection.js
const { Client } = require('pg')

const client = new Client({
  connectionString: process.env.DATABASE_URL
})

async function testConnection() {
  try {
    await client.connect()
    console.log('✅ Database connection successful!')
    await client.end()
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  }
}

testConnection()
```

Run with: `node test-db-connection.js`

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs/)
- [Payload CMS Documentation](https://payloadcms.com/docs/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🎉 Integration Complete!

Once you've completed these steps, your Modern Men Hair BarberShop application will be successfully integrated with Neon database and ready for production deployment on Vercel.
