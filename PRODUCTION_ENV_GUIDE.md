# Production Environment Configuration Guide

## Overview

This guide provides step-by-step instructions for configuring the Modern Men Hair BarberShop application for production deployment on Vercel.

## Required Environment Variables

### Core Application Variables

```bash
# Payload CMS Configuration
PAYLOAD_SECRET=your-super-secure-random-secret-key-here
PAYLOAD_PUBLIC_SERVER_URL=https://modernmen.vercel.app

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database
POSTGRES_URL=postgresql://username:password@host:port/database

# Application URLs
NEXT_PUBLIC_APP_URL=https://modernmen.vercel.app
NEXT_PUBLIC_SITE_URL=https://modernmen.vercel.app

# Authentication
NEXTAUTH_URL=https://modernmen.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key-here
```

### External Service Integrations

```bash
# Email Service (SendGrid, Mailgun, etc.)
EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@modernmen.ca

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+13065524111

# Analytics (Google Analytics, Vercel Analytics)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
VERCEL_ANALYTICS_ID=your-vercel-analytics-id

# Payment Processing (Stripe)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# File Storage (AWS S3, Cloudinary)
S3_ACCESS_KEY_ID=your-s3-access-key
S3_SECRET_ACCESS_KEY=your-s3-secret-key
S3_BUCKET_NAME=modernmen-uploads
S3_REGION=us-east-1

# Monitoring and Error Tracking
SENTRY_DSN=https://your-sentry-dsn
LOGTAIL_TOKEN=your-logtail-token
```

### Security and Performance

```bash
# Security Headers
NEXT_PUBLIC_CSP_NONCE=your-csp-nonce
HSTS_MAX_AGE=31536000

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Caching
REDIS_URL=redis://username:password@host:port
CACHE_TTL=3600

# CDN Configuration
NEXT_PUBLIC_CDN_URL=https://cdn.modernmen.ca
```

## Vercel Deployment Setup

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Your Project

```bash
vercel link
```

### 4. Set Environment Variables

```bash
# Set each environment variable
vercel env add PAYLOAD_SECRET
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
# ... continue for all variables
```

### 5. Deploy to Production

```bash
vercel --prod
```

## Database Setup

### PostgreSQL Configuration

1. **Create Database**
   ```sql
   CREATE DATABASE modernmen_production;
   CREATE USER modernmen_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE modernmen_production TO modernmen_user;
   ```

2. **Enable Extensions**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   ```

3. **Set Connection Pool**
   ```sql
   ALTER SYSTEM SET max_connections = 200;
   ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
   ```

### Database Migration

```bash
# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

## Security Configuration

### SSL/TLS Setup

1. **Automatic SSL** (Vercel handles this)
2. **Custom Domain SSL** (if using custom domain)

### Security Headers

The `vercel.json` file includes security headers:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Referrer Policy

### API Rate Limiting

Configure rate limiting in your API routes:

```typescript
// src/lib/ratelimit.ts
export const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
}
```

## Monitoring and Analytics

### Performance Monitoring

1. **Vercel Analytics**
   - Automatically enabled with Vercel deployment
   - View in Vercel dashboard

2. **Custom Performance Monitoring**
   - Use the performance monitor we created
   - Send metrics to your preferred service

### Error Tracking

1. **Sentry Setup**
   ```typescript
   import * as Sentry from '@sentry/nextjs'
   
   Sentry.init({
     dsn: process.env.SENTRY_DSN,
     environment: process.env.NODE_ENV,
     tracesSampleRate: 1.0,
   })
   ```

2. **Logging**
   - Use structured logging
   - Send logs to Logtail or similar service

## Backup Strategy

### Database Backups

1. **Automated Backups**
   ```bash
   # Daily backup script
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

2. **Point-in-Time Recovery**
   - Enable WAL archiving
   - Configure backup retention

### File Backups

1. **S3 Lifecycle Policies**
   - Configure automatic backups
   - Set retention policies

## Scaling Configuration

### Horizontal Scaling

1. **Load Balancing**
   - Vercel automatically handles this
   - Configure multiple regions if needed

2. **Database Scaling**
   - Use read replicas for heavy read loads
   - Consider connection pooling

### Caching Strategy

1. **Redis Cache**
   ```typescript
   import Redis from 'ioredis'
   
   const redis = new Redis(process.env.REDIS_URL)
   ```

2. **CDN Configuration**
   - Configure Cloudflare or similar
   - Set up image optimization

## Health Checks

### Application Health

Create health check endpoints:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  try {
    // Check database connection
    await db.query('SELECT 1')
    
    // Check external services
    await checkEmailService()
    await checkSmsService()
    
    return Response.json({ status: 'healthy' })
  } catch (error) {
    return Response.json({ status: 'unhealthy', error: error.message }, { status: 503 })
  }
}
```

### Monitoring Alerts

Set up alerts for:
- High error rates
- Slow response times
- Database connection issues
- Disk space usage

## Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Check Vercel dashboard
   - Verify variable names match exactly
   - Restart deployment

2. **Database Connection Issues**
   - Verify DATABASE_URL format
   - Check firewall settings
   - Test connection locally

3. **Build Failures**
   - Check build logs in Vercel
   - Verify all dependencies are installed
   - Check TypeScript errors

### Debug Mode

Enable debug logging:

```bash
DEBUG=* vercel --prod
```

## Maintenance

### Regular Tasks

1. **Weekly**
   - Review error logs
   - Check performance metrics
   - Update dependencies

2. **Monthly**
   - Review security updates
   - Analyze usage patterns
   - Optimize database queries

3. **Quarterly**
   - Full security audit
   - Performance review
   - Backup restoration test

## Support

For deployment issues:
- Vercel Documentation: https://vercel.com/docs
- Payload CMS Docs: https://payloadcms.com/docs
- Modern Men Support: support@modernmen.ca
