# Vercel Deployment Guide for Modern Men Hair BarberShop

This comprehensive guide covers the deployment of the Modern Men Hair BarberShop application to Vercel with security best practices, performance optimizations, and monitoring.

## 🚀 Quick Start

### Prerequisites
- Vercel account
- GitHub repository
- Database (PostgreSQL recommended)
- Redis instance (Vercel KV recommended)
- Payment processor (Stripe)
- Email service (SendGrid/Mailgun)

### One-Click Deployment
```bash
# Clone and setup
git clone <your-repo-url>
cd modernmen-yolo

# Install dependencies
npm install

# Setup environment variables
cp env.local.example .env.local
# Edit .env.local with your values

# Deploy to Vercel
bash scripts/vercel-deploy.sh --environment production
```

## 📋 Deployment Checklist

### ✅ Pre-Deployment
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Redis connection configured
- [ ] Payment processor setup
- [ ] Email service configured
- [ ] Domain purchased (optional)

### ✅ Deployment Steps
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Domain connected (optional)
- [ ] SSL certificate configured
- [ ] Monitoring enabled

### ✅ Post-Deployment
- [ ] Application accessible
- [ ] Admin panel working
- [ ] Payment processing tested
- [ ] Email notifications working
- [ ] Performance monitored

## 🔧 Configuration Files

### vercel.json
The `vercel.json` file is optimized for modern Next.js deployment:

```json
{
  "version": 2,
  "name": "modernmen-hair-barbershop",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NODE_ENV": "production",
    "NEXT_TELEMETRY_DISABLED": "1"
  }
}
```

### Environment Variables
Copy `env.local.example` to `.env.local` and configure:

```bash
# Required Variables
NEXTAUTH_SECRET=your-32-char-secret
PAYLOAD_SECRET=your-32-char-payload-secret
DATABASE_URL=postgresql://user:pass@host:5432/db
KV_URL=redis://user:pass@host:port

# Optional but Recommended
STRIPE_SECRET_KEY=sk_live_...
OPENAI_API_KEY=sk-...
SMTP_PASS=your-email-api-key
```

## 🌐 Domain Configuration

### Custom Domain Setup
```bash
# Add domain to Vercel
vercel domains add yourdomain.com

# Configure DNS (add these records to your DNS provider)
# Type: CNAME, Name: www, Value: cname.vercel-dns.com
# Type: CNAME, Name: @, Value: cname.vercel-dns.com

# Verify domain
vercel domains inspect yourdomain.com
```

### SSL Certificate
Vercel automatically provisions SSL certificates for all deployments. Custom domains get Let's Encrypt certificates.

## 🗄️ Database Setup

### Supabase (Recommended for Full-Stack)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize Supabase in your project (already done)
# supabase init

# Start local development
npm run supabase:start

# Reset database and run migrations
npm run supabase:reset

# Generate TypeScript types
npm run supabase:types
```

### Supabase Production Setup
```bash
# Create a new Supabase project at https://supabase.com
# Or link existing project
npm run supabase:link

# Deploy migrations to production
npm run supabase:deploy

# Setup for production
npm run supabase:production
```

### Alternative: Vercel Postgres
```bash
# Install Vercel CLI
npm install -g vercel

# Create Postgres database
vercel postgres create modernmen-prod

# Get connection string
vercel postgres url modernmen-prod
```

### External PostgreSQL
Use any PostgreSQL provider:
- PlanetScale
- AWS RDS
- Google Cloud SQL
- DigitalOcean Managed PostgreSQL

## ⚡ Redis Configuration

### Vercel KV (Recommended)
```bash
# Create KV database
vercel kv create modernmen-prod

# Get connection details
vercel kv show modernmen-prod
```

### Alternative Redis Providers
- Upstash Redis
- Redis Labs
- AWS ElastiCache

## 💳 Payment Integration

### Stripe Setup
```bash
# Install Stripe CLI
npm install -g stripe

# Login to Stripe
stripe login

# Create webhook endpoint
stripe listen --forward-to https://yourdomain.com/api/webhooks/stripe
```

## 📧 Email Configuration

### SendGrid Setup
```bash
# Create SendGrid API key
# Set SMTP credentials in environment variables
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Alternative Email Providers
- Mailgun
- Postmark
- AWS SES
- Resend

## 🔐 Security Configuration

### Environment Variables Security
```bash
# Never commit secrets to git
# Use Vercel dashboard for sensitive data
# Rotate secrets regularly
# Use different secrets for different environments
```

### CORS Configuration
Vercel handles CORS automatically. For custom CORS:

```javascript
// In your API routes
res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

## 📊 Monitoring & Analytics

### Vercel Analytics
Automatically enabled. View in Vercel dashboard:
- Real-time visitor analytics
- Performance metrics
- Error tracking
- Custom events

### Application Monitoring
```bash
# Check deployment logs
vercel logs

# Monitor functions
vercel functions ls

# View analytics
vercel analytics
```

## 🚀 Performance Optimization

### Build Optimization
```javascript
// next.config.js optimizations
module.exports = {
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: true,
  },
}
```

### Image Optimization
```javascript
// Automatic with Next.js 13+
import Image from 'next/image'

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1920}
  height={1080}
  priority
  placeholder="blur"
/>
```

### Caching Strategy
```javascript
// API Routes with caching
export const revalidate = 3600 // 1 hour

// ISR for static pages
export const revalidate = 60 // 1 minute
```

## 🗄️ Supabase Integration

### Database Schema
The Supabase integration includes a complete database schema for the barber shop:

#### Core Tables
- **`profiles`** - User profiles with authentication
- **`appointments`** - Appointment booking and management
- **`services`** - Available services and pricing
- **`stylists`** - Stylist information and availability
- **`reviews`** - Customer reviews and ratings
- **`stylist_availability`** - Stylist scheduling

#### Key Features
- ✅ **Row Level Security (RLS)** - Automatic data protection
- ✅ **Real-time subscriptions** - Live updates for appointments
- ✅ **Authentication integration** - Seamless auth with Supabase Auth
- ✅ **Type-safe operations** - Full TypeScript support
- ✅ **Optimized queries** - Efficient database operations

### Supabase Client Usage
```typescript
// Client-side usage
import { supabase } from '@/lib/supabase'

// Server-side usage
import { supabaseAdmin } from '@/lib/supabase'

// Example: Create appointment
const { data, error } = await supabase
  .from('appointments')
  .insert({
    user_id: userId,
    stylist_id: stylistId,
    service_id: serviceId,
    appointment_date: date,
    appointment_time: time
  })
  .select()
  .single()

if (error) throw error
return data
```

### Real-time Features
```typescript
// Subscribe to appointment updates
const subscription = supabase
  .channel('user_appointments')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'appointments',
    filter: `user_id=eq.${userId}`
  }, (payload) => {
    console.log('Appointment updated:', payload)
  })
  .subscribe()
```

### Supabase Auth Integration
```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})

// Get current user
const { data: user } = await supabase.auth.getUser()
```

## 🔄 Deployment Strategies

### Preview Deployments
Every push to feature branches creates a preview deployment:
```bash
# Automatic preview deployments
git checkout -b feature/new-feature
git push origin feature/new-feature
# Preview URL: https://feature-new-feature-modernmen.vercel.app
```

### Production Deployment
```bash
# Manual production deployment
git checkout main
git merge feature/completed-feature
git push origin main

# Or use the deployment script
bash scripts/vercel-deploy.sh --environment production
```

### Rollback Strategy
```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy specific commit
vercel deploy --commit sha123456
```

## 🧪 Testing Deployment

### Pre-deployment Tests
```bash
# Run all tests
npm run test:ci

# Build test
npm run build

# Type check
npm run type-check

# Lint check
npm run lint
```

### Post-deployment Tests
```bash
# Health check
curl https://yourdomain.com/api/health

# Admin panel check
curl https://yourdomain.com/admin

# API endpoints test
curl https://yourdomain.com/api/users
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
vercel logs --follow

# Debug locally
npm run build

# Check Node.js version
vercel --version
```

#### Environment Variables
```bash
# List environment variables
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME

# Update existing variables
vercel env update VARIABLE_NAME
```

#### Database Connection Issues
```bash
# Test database connection
npm run db:test

# Check database URL format
echo $DATABASE_URL

# Verify database credentials
psql $DATABASE_URL -c "SELECT 1"
```

#### Performance Issues
```bash
# Check function timeouts
vercel functions ls

# Monitor cold starts
vercel analytics --since 1d

# Optimize bundle size
npm run bundle:analyze
```

## 📈 Scaling

### Function Scaling
```javascript
// Increase function timeout
export const maxDuration = 30

// Optimize function size
export const runtime = 'nodejs18.x'
```

### Database Scaling
- Use connection pooling
- Implement caching strategies
- Optimize database queries
- Consider read replicas

### CDN Optimization
Vercel automatically uses their global CDN. For additional optimization:
```javascript
// Cache static assets
res.setHeader('Cache-Control', 'public, max-age=31536000')

// Compress responses
res.setHeader('Content-Encoding', 'gzip')
```

## 🔧 Maintenance

### Regular Tasks
```bash
# Update dependencies
npm update

# Security audit
npm audit

# Rebuild and redeploy
vercel --prod

# Clean up old deployments
vercel rm --all
```

### Backup Strategy
```bash
# Database backups
pg_dump $DATABASE_URL > backup.sql

# Upload to cloud storage
aws s3 cp backup.sql s3://your-backups/

# Automated backups with cron
# Set up in Vercel dashboard
```

## 🎯 Best Practices

### Security
- Use HTTPS everywhere
- Implement CSP headers
- Regular security audits
- Keep dependencies updated
- Use environment variables for secrets

### Performance
- Optimize images automatically
- Implement caching strategies
- Use CDN for static assets
- Monitor Core Web Vitals
- Implement lazy loading

### Reliability
- Use preview deployments for testing
- Implement proper error handling
- Set up monitoring and alerts
- Regular backup procedures
- Plan for disaster recovery

## 📞 Support

### Vercel Support
- Documentation: https://vercel.com/docs
- Community: https://vercel.community
- Status Page: https://vercel-status.com

### Application Support
- Check logs: `vercel logs`
- Monitor functions: `vercel functions ls`
- View analytics: `vercel analytics`
- Contact: support@modernmen.com

## 📋 Quick Commands

```bash
# Development
npm run dev                    # Local development server
npm run build                  # Production build
npm run start                  # Start production server

# Supabase Development
npm run supabase:start         # Start local Supabase
npm run supabase:reset         # Reset database and run migrations
npm run supabase:types         # Generate TypeScript types
npm run supabase:status        # Check Supabase status

# Supabase Production
npm run supabase:link          # Link remote Supabase project
npm run supabase:deploy        # Deploy migrations to production
npm run supabase:production    # Complete production setup

# Deployment
vercel                         # Deploy to preview
vercel --prod                  # Deploy to production
npm run vercel:supabase-deploy # Deploy both Vercel + Supabase

# Environment Management
vercel env ls                  # List Vercel environment variables
npm run supabase:link          # Link Supabase project

# Monitoring
vercel logs                    # View Vercel deployment logs
npm run supabase:status        # View Supabase status
vercel analytics               # View Vercel analytics
vercel functions ls           # List Vercel serverless functions

# Management
vercel rm                      # Remove Vercel deployment
vercel rollback                # Rollback Vercel deployment
npm run supabase:stop          # Stop local Supabase
npm run supabase:reset         # Reset Supabase database

# Combined Commands
npm run supabase:start && npm run dev  # Start full development environment
```

## 🎉 Success Checklist

- [ ] ✅ Application deployed successfully
- [ ] ✅ Admin panel accessible
- [ ] ✅ User authentication working
- [ ] ✅ Payment processing functional
- [ ] ✅ Email notifications sent
- [ ] ✅ Domain configured (if applicable)
- [ ] ✅ SSL certificate active
- [ ] ✅ Monitoring enabled
- [ ] ✅ Performance optimized
- [ ] ✅ Security measures in place

---

**Deployment completed successfully!** 🚀

Your Modern Men Hair BarberShop is now live on Vercel with enterprise-grade security, performance optimizations, and monitoring capabilities.
