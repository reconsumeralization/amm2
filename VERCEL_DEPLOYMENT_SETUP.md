# 🚀 Vercel Deployment Setup Guide
## Modern Men Hair BarberShop - amm2 Project

This guide provides step-by-step instructions for deploying the Modern Men Hair BarberShop application to Vercel with full Supabase and Payload CMS integration.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
3. **GitHub Repository**: Your code should be pushed to GitHub

## 🗄️ Step 1: Set Up Supabase

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details:
   - **Name**: `modernmen-production`
   - **Database Password**: Generate a strong password
   - **Region**: Choose the closest region to your users

### 1.2 Get Supabase Credentials
After project creation, go to Settings → API and copy:
- **Project URL**: `https://your-project-id.supabase.co`
- **anon/public key**: `eyJhbGc...`
- **service_role key**: `eyJhbGc...`

### 1.3 Run Database Migrations
```bash
# Link your Supabase project
npm run supabase:link

# Run migrations
npm run supabase:deploy

# Generate TypeScript types
npm run supabase:types
```

## 🌐 Step 2: Deploy to Vercel

### 2.1 Import Project
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (leave default)

### 2.2 Set Environment Variables

In the Vercel dashboard, go to your project → Settings → Environment Variables and add:

#### **Required Variables:**
```bash
# Application
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_APP_URL=https://amm2.vercel.app

# Authentication
NEXTAUTH_SECRET=your-secure-random-secret-here-32-chars-minimum
NEXTAUTH_URL=https://amm2.vercel.app

# Payload CMS
PAYLOAD_SECRET=your-super-secure-payload-secret-here-32-chars
PAYLOAD_PUBLIC_SERVER_URL=https://amm2.vercel.app

# Supabase (from Step 1.2)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Database (use Supabase for production)
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
```

#### **Optional Variables:**
```bash
# Stripe (for payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (SendGrid/Mailgun)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=noreply@modernmen.com

# AI Services
OPENAI_API_KEY=sk-...
ELEVENLABS_API_KEY=your-key

# Sync Configuration
SYNC_ENABLED=true
SYNC_INTERVAL=300000

# Monitoring
LOG_LEVEL=info
```

### 2.3 Deploy
1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at `https://amm2.vercel.app`

## 🔧 Step 3: Post-Deployment Configuration

### 3.1 Set Up Custom Domain (Optional)
1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update environment variables with new domain

### 3.2 Configure Payload Admin
1. Go to `https://amm2.vercel.app/admin`
2. Create your first admin user
3. Set up initial content and settings

### 3.3 Set Up Supabase Webhooks (Optional)
For real-time features, configure Supabase webhooks:
1. Go to Supabase Dashboard → Database → Webhooks
2. Create webhooks for table changes
3. Point to your Vercel API endpoints

## 🔍 Step 4: Testing & Verification

### 4.1 Test Core Features
```bash
# Test API endpoints
curl https://amm2.vercel.app/api/health

# Test Payload CMS
curl https://amm2.vercel.app/api/payload/collections/users

# Test Supabase connection
curl https://amm2.vercel.app/api/supabase/health
```

### 4.2 Test User Flows
1. **User Registration**: Test signup/login
2. **Appointment Booking**: Test booking system
3. **Admin Panel**: Test Payload CMS admin
4. **Real-time Updates**: Test live features

### 4.3 Monitor Performance
1. Check Vercel Analytics
2. Monitor Supabase usage
3. Set up error tracking (Sentry, LogRocket, etc.)

## 🚨 Troubleshooting

### Build Failures
```bash
# Clear Vercel cache
npx vercel --prod --force

# Check build logs in Vercel dashboard
# Look for TypeScript errors or missing dependencies
```

### Database Connection Issues
```bash
# Verify Supabase credentials
# Check DATABASE_URL format
# Ensure Supabase project is active
```

### Payload CMS Issues
```bash
# Check PAYLOAD_SECRET is set
# Verify admin user exists
# Check database permissions
```

## 📊 Performance Optimization

### Vercel Optimizations
- **Edge Functions**: API routes automatically use Edge Runtime
- **Image Optimization**: Next.js automatic image optimization
- **Caching**: Configure cache headers in `vercel.json`

### Supabase Optimizations
- **RLS Policies**: Row Level Security enabled
- **Indexes**: Proper database indexes
- **Connection Pooling**: Built-in connection pooling

### Payload Optimizations
- **SQLite in Development**: Fast local development
- **PostgreSQL in Production**: Scalable production database
- **Caching**: Built-in Payload caching

## 🔒 Security Checklist

- ✅ **Environment Variables**: All secrets properly set
- ✅ **Database Security**: RLS policies configured
- ✅ **API Security**: CORS and authentication configured
- ✅ **Admin Access**: Payload admin properly secured
- ✅ **SSL/TLS**: Automatic HTTPS enabled

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check Supabase dashboard for errors
3. Verify environment variables are set correctly
4. Test locally with `npm run dev`

## 🎉 Success!

Your Modern Men Hair BarberShop is now live at `https://amm2.vercel.app` with:
- ✅ Full-stack Next.js application
- ✅ Payload CMS for content management
- ✅ Supabase for database and real-time features
- ✅ Vercel for hosting and deployment
- ✅ Production-ready configuration

**Ready to serve customers! 🚀✨**
