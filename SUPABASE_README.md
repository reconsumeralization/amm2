# Supabase Integration Guide

This guide covers the complete Supabase integration for the Modern Men Hair BarberShop application, including database setup, authentication, real-time features, and deployment.

## 🚀 Overview

Supabase provides:
- **PostgreSQL Database** - Robust relational database
- **Authentication** - User management and auth
- **Real-time** - Live subscriptions and updates
- **Storage** - File upload and management
- **Edge Functions** - Serverless functions
- **Auto-generated APIs** - REST and GraphQL APIs

## 📋 Prerequisites

### Required Tools
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Verify installation
supabase --version
```

### Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Note your project URL and API keys

## 🗄️ Database Schema

### Core Tables

#### Users & Authentication
```sql
-- profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address JSONB,
  preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP WITH TIME ZONE
);
```

#### Appointments
```sql
-- appointments table
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  stylist_id UUID REFERENCES stylists(id) NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  total_price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL
);
```

#### Services
```sql
-- services table
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  features JSONB DEFAULT '[]'
);
```

#### Stylists
```sql
-- stylists table
CREATE TABLE stylists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  bio TEXT,
  specialty TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0.0,
  review_count INTEGER DEFAULT 0,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  working_hours JSONB DEFAULT '{}'
);
```

#### Reviews
```sql
-- reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  stylist_id UUID REFERENCES stylists(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0
);
```

#### Stylist Availability
```sql
-- stylist_availability table
CREATE TABLE stylist_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stylist_id UUID REFERENCES stylists(id) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  booked_slots JSONB DEFAULT '[]'
);
```

## 🔧 Local Development Setup

### 1. Start Supabase Locally
```bash
# Start local Supabase instance
npm run supabase:start

# Or directly with Supabase CLI
supabase start
```

### 2. Reset Database (Development)
```bash
# Reset database and run all migrations + seeds
npm run supabase:reset

# Or step by step
npm run supabase:migrate
npm run supabase:seed
```

### 3. Generate TypeScript Types
```bash
# Generate types from local database
npm run supabase:types

# Types will be saved to src/types/supabase-generated.ts
```

### 4. Check Status
```bash
# Check Supabase status
npm run supabase:status

# View local URLs
# API: http://127.0.0.1:54321
# Studio: http://127.0.0.1:54323
# PostgreSQL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## 🔐 Authentication Setup

### Supabase Auth Configuration
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

### Authentication Methods
```typescript
// Sign Up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword'
})

// Sign In
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
})

// Sign Out
const { error } = await supabase.auth.signOut()

// Get Current User
const { data: { user } } = await supabase.auth.getUser()

// Password Reset
const { error } = await supabase.auth.resetPasswordForEmail(email)
```

### Profile Management
```typescript
// Create/Update Profile
const { data, error } = await supabase
  .from('profiles')
  .upsert({
    id: user.id,
    email: user.email,
    full_name: 'John Doe',
    phone: '+1234567890'
  })

// Get Profile
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

## 🎯 Database Operations

### Using the Supabase Client
```typescript
import { supabase, db } from '@/lib/supabase'

// Direct table operations
const { data, error } = await supabase
  .from('services')
  .select('*')
  .eq('is_active', true)

// Using helper functions
const services = await db.services.getAllServices()
const appointment = await db.appointments.createAppointment(appointmentData)
```

### Common Query Patterns
```typescript
// Get user appointments with stylist info
const { data, error } = await supabase
  .from('appointments')
  .select(`
    *,
    stylist:stylist_id (
      id,
      name,
      specialty
    ),
    service:service_id (
      id,
      name,
      price
    )
  `)
  .eq('user_id', userId)
  .order('appointment_date', { ascending: true })

// Get stylist availability
const { data, error } = await supabase
  .from('stylist_availability')
  .select('*')
  .eq('stylist_id', stylistId)
  .eq('date', date)
  .eq('is_available', true)

// Search services
const { data, error } = await supabase
  .from('services')
  .select('*')
  .ilike('name', `%${searchTerm}%`)
  .eq('is_active', true)
```

## 🔄 Real-time Features

### Subscription Setup
```typescript
// Subscribe to user appointments
const subscription = supabase
  .channel('user_appointments')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'appointments',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Appointment update:', payload)
    // Update UI with new data
  })
  .subscribe()

// Cleanup subscription
subscription.unsubscribe()
```

### Real-time Helpers
```typescript
// src/lib/supabase.ts
export const realtime = {
  subscribeToUserAppointments(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`user_appointments_${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  subscribeToStylistAvailability(stylistId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`stylist_availability_${stylistId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'stylist_availability',
        filter: `stylist_id=eq.${stylistId}`
      }, callback)
      .subscribe()
  }
}
```

## 📁 File Storage

### Storage Setup
```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`user_${userId}.jpg`, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`user_${userId}.jpg`)

// Delete file
const { data, error } = await supabase.storage
  .from('avatars')
  .remove([`user_${userId}.jpg`])
```

## 🚀 Production Deployment

### 1. Create Supabase Project
```bash
# Go to https://supabase.com and create a new project
# Note your project URL and API keys
```

### 2. Link Remote Project
```bash
# Set your project reference
export SUPABASE_PROJECT_REF=your-project-ref

# Link the project
npm run supabase:link
```

### 3. Deploy Migrations
```bash
# Deploy database schema to production
npm run supabase:deploy
```

### 4. Generate Production Types
```bash
# Generate types from production database
npm run supabase:production
```

### 5. Environment Variables
Add to your Vercel environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 🔒 Security Best Practices

### Row Level Security (RLS)
```sql
-- Enable RLS on tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view their own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = user_id);
```

### Environment Variables
```bash
# Never commit secrets to git
# Use different keys for development and production
# Rotate keys regularly
# Use Supabase service role key only on server-side
```

## 🧪 Testing

### Database Tests
```typescript
// Test database connection
const { data, error } = await supabase
  .from('services')
  .select('count')
  .single()

if (error) {
  console.error('Database connection failed:', error)
} else {
  console.log('Database connected successfully')
}
```

### Authentication Tests
```typescript
// Test auth flow
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword'
})

if (error) {
  console.error('Auth test failed:', error)
} else {
  console.log('Auth test passed')
}
```

## 📊 Monitoring

### Supabase Dashboard
- View real-time metrics
- Monitor database performance
- Track API usage
- View logs and errors

### Vercel Integration
```bash
# View deployment logs
vercel logs

# Monitor function performance
vercel functions ls

# View analytics
vercel analytics
```

## 🚨 Troubleshooting

### Common Issues

#### Connection Issues
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Test connection
curl https://your-project-ref.supabase.co/rest/v1/
```

#### Authentication Issues
```bash
# Check auth configuration
supabase status

# Verify user session
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
```

#### Database Issues
```bash
# Check database status
npm run supabase:status

# Reset local database
npm run supabase:reset

# Check migration status
supabase db diff
```

#### Type Issues
```bash
# Regenerate types
npm run supabase:types

# Check for type conflicts
npx tsc --noEmit
```

## 📚 Resources

### Documentation
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)

### Community
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Supabase Twitter](https://twitter.com/supabase)

### Tools
- [Supabase Studio](https://supabase.com/dashboard)
- [pgAdmin](https://www.pgadmin.org/) - Database GUI
- [Postman](https://www.postman.com/) - API Testing

---

## 🎯 Quick Reference

### Local Development
```bash
npm run supabase:start    # Start local Supabase
npm run supabase:reset    # Reset database
npm run supabase:types    # Generate types
npm run dev              # Start Next.js
```

### Production Deployment
```bash
npm run supabase:link     # Link remote project
npm run supabase:deploy   # Deploy migrations
npm run vercel:supabase-deploy  # Deploy everything
```

### Monitoring
```bash
npm run supabase:status   # Check Supabase status
vercel logs               # View deployment logs
vercel analytics          # View analytics
```

---

**Supabase integration complete!** 🎉

Your Modern Men Hair BarberShop now has a robust database, authentication, and real-time capabilities powered by Supabase!
