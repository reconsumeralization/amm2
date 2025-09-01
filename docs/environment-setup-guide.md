# Environment Setup Guide - Modern Men Hair Salon

This guide provides comprehensive instructions for setting up environment variables for the Modern Men Hair Salon application across different environments.

## 📋 Environment Files Overview

The project includes several environment configuration files:

- `env.example` - Template with all available variables
- `env.local.example` - Local development template
- `env.production.example` - Production deployment template
- `env.vercel.example` - Vercel-specific configuration template

## 🔧 Environment Variables Reference

### Core Application Configuration

```bash
# Application URL (used for redirects and API calls)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Application Environment
NODE_ENV=development

# Disable Next.js telemetry
NEXT_TELEMETRY_DISABLED=1
```

### Database Configuration

```bash
# Primary Database (PostgreSQL recommended for production)
DATABASE_URL=postgresql://username:password@localhost:5432/modernmen_db

# Alternative databases for development
# SQLite for development
DATABASE_URL=file:./database.db

# MongoDB (if using MongoDB)
MONGODB_URI=mongodb://localhost:27017/modernmen
```

### Authentication Configuration

```bash
# NextAuth.js Configuration (generate secure random strings)
NEXTAUTH_SECRET=your-super-secret-nextauth-key-here-minimum-32-chars
NEXTAUTH_URL=http://localhost:3000

# Payload CMS Secret (generate secure random string)
PAYLOAD_SECRET=your-super-secret-payload-key-here-minimum-32-chars
```

### Supabase Configuration

```bash
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anonymous Key (safe to expose publicly)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Supabase Service Role Key (keep secret - admin access only)
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### Payment Processing (Stripe)

```bash
# Stripe Publishable Key (safe to expose publicly)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Stripe Secret Key (keep secret)
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key

# Stripe Webhook Secret (for webhook verification)
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

### Email Configuration

```bash
# SMTP Configuration (Gmail, Outlook, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Alternative: Resend (recommended for production)
RESEND_API_KEY=re_your-resend-api-key
```

### AI/ML Services

```bash
# OpenAI API Key (for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# Vercel AI API Key (if using Vercel AI)
VERCEL_AI_API_KEY=your-vercel-ai-api-key
```

### Analytics & Monitoring

```bash
# Google Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Sentry DSN (for error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### File Storage

```bash
# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Alternative: AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1
```

## 🚀 Quick Setup Commands

### Generate Secure Secrets

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Generate Payload secret
openssl rand -base64 32

# Alternative: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Local Development Setup

```bash
# Copy environment template
cp env.local.example .env.local

# Edit with your values
nano .env.local

# Start development server
npm run dev
```

### Vercel Deployment Setup

```bash
# Using the automated script (recommended)
npm run vercel:setup

# Or manually
npm install -g vercel
vercel login
vercel link

# Set environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_APP_URL
vercel env add DATABASE_URL
# ... add other required variables

# Deploy
npm run vercel:deploy
```

## 🔐 Security Best Practices

### Environment Variable Security

1. **Never commit `.env` files to version control**
2. **Use different values for each environment**
3. **Rotate secrets regularly**
4. **Use Vercel's encrypted environment variables in production**
5. **Keep service role keys and secrets secure**

### Secret Generation Guidelines

```bash
# NextAuth Secret: Minimum 32 characters
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Payload Secret: Minimum 32 characters
PAYLOAD_SECRET=$(openssl rand -base64 32)

# Database passwords: Use strong, unique passwords
DB_PASSWORD=$(openssl rand -base64 16)
```

## 🌍 Environment-Specific Configurations

### Development Environment

```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/modernmen_dev
PAYLOAD_PUBLIC_ENABLE_GRAPHQL_PLAYGROUND=true
DEBUG=true
```

### Staging Environment

```bash
# Vercel Preview Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://modernmen-staging.vercel.app
DATABASE_URL=postgresql://user:pass@host:5432/modernmen_staging
NEXTAUTH_URL=https://modernmen-staging.vercel.app
```

### Production Environment

```bash
# Vercel Production Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
DATABASE_URL=postgresql://user:pass@host:5432/modernmen_prod
NEXTAUTH_URL=https://your-domain.com
NEXT_TELEMETRY_DISABLED=1
```

## 🔧 Required Services Setup

### PostgreSQL Database

```bash
# Local PostgreSQL
createdb modernmen_db
createuser modernmen_user
psql -c "ALTER USER modernmen_user PASSWORD 'your-password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE modernmen_db TO modernmen_user;"

# Connection string format
DATABASE_URL=postgresql://modernmen_user:your-password@localhost:5432/modernmen_db
```

### Supabase Setup

```bash
# Create new Supabase project
supabase init
supabase start

# Get connection details from Supabase dashboard
# Project URL: https://your-project.supabase.co
# Anon Key: eyJ...
# Service Role Key: eyJ...
```

### Stripe Setup

```bash
# Get API keys from Stripe dashboard
# Test mode for development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

## 📋 Environment Variables Checklist

### Required Variables
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `DATABASE_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `PAYLOAD_SECRET`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### Optional Variables
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- [ ] `RESEND_API_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `VERCEL_AI_API_KEY`
- [ ] `NEXT_PUBLIC_GA_ID`
- [ ] `NEXT_PUBLIC_SENTRY_DSN`

## 🔍 Validation Commands

### Test Database Connection

```bash
# Test PostgreSQL connection
psql "$DATABASE_URL" -c "SELECT version();"

# Test Supabase connection
curl -H "apikey: $SUPABASE_ANON_KEY" \
     "$SUPABASE_URL/rest/v1/"
```

### Validate Configuration

```bash
# Check NextAuth configuration
npm run build

# Validate environment variables
node -e "
console.log('Environment validation:');
console.log('NEXTAUTH_SECRET length:', process.env.NEXTAUTH_SECRET?.length || 0);
console.log('PAYLOAD_SECRET length:', process.env.PAYLOAD_SECRET?.length || 0);
console.log('Database URL present:', !!process.env.DATABASE_URL);
"
```

## 🚨 Troubleshooting

### Common Issues

#### "NEXTAUTH_SECRET is required"

```bash
# Generate and set NextAuth secret
export NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

#### "Database connection failed"

```bash
# Check database connection
psql "$DATABASE_URL" -c "SELECT 1;"

# Verify database exists
psql -l | grep modernmen
```

#### "Supabase connection failed"

```bash
# Check Supabase URL and keys
curl -H "apikey: $SUPABASE_ANON_KEY" \
     "$SUPABASE_URL/rest/v1/" | jq .

# Verify keys are correct in Supabase dashboard
```

## 📚 Additional Resources

- [NextAuth.js Environment Variables](https://next-auth.js.org/configuration/options)
- [Payload CMS Configuration](https://payloadcms.com/docs/configuration/overview)
- [Supabase Environment Setup](https://supabase.com/docs/guides/local-development)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

This environment setup guide ensures your Modern Men Hair Salon application has all necessary configuration for secure and reliable operation across all environments.
