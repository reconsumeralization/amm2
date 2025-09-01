# Vercel Deployment Guide - Modern Men Hair Salon

This guide provides comprehensive instructions for deploying the Modern Men Hair Salon application to Vercel.

## 📋 Prerequisites

- Vercel account (free or paid plan)
- GitHub repository connected to Vercel
- Environment variables configured
- Node.js 18+ installed locally

## 🚀 Quick Start

### 1. Automatic Setup (Recommended)

Run the automated setup script:

```bash
# Make sure you're in the project root
cd modernmen-yolo

# Run the setup script
./scripts/setup-vercel.sh
```

This script will:
- Install Vercel CLI
- Login to your Vercel account
- Link the project
- Set up environment variables
- Deploy to production

### 2. Manual Setup

If you prefer manual setup:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Deploy
vercel --prod
```

## 🔧 Configuration Files

### vercel.json

The `vercel.json` file is pre-configured with:

```json
{
  "version": 2,
  "name": "modernmen-yolo",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "@vercel/node"
    }
  }
}
```

### Environment Variables

Set these in your Vercel dashboard (Project Settings > Environment Variables):

#### Production Environment
```
NEXT_PUBLIC_APP_URL=https://your-domain.com
DATABASE_URL=your_database_url
PAYLOAD_SECRET=your_payload_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
RESEND_API_KEY=your_resend_api_key
```

#### Preview Environment (Staging)
```
NEXT_PUBLIC_APP_URL=https://modernmen-yolo-preview.vercel.app
DATABASE_URL=your_staging_database_url
PAYLOAD_SECRET=your_staging_payload_secret
NEXTAUTH_SECRET=your_staging_nextauth_secret
NEXTAUTH_URL=https://modernmen-yolo-preview.vercel.app
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 📦 Build & Deployment

### Build Commands

```bash
# Local development
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

### Deployment Commands

```bash
# Deploy to production
vercel --prod

# Deploy to staging (preview)
vercel

# Deploy specific branch
vercel --prod --git-ref main

# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]
```

## 🔐 Security Configuration

### Headers Configuration

The `vercel.json` includes security headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

### Environment Variable Security

- Use Vercel's encrypted environment variables
- Never commit secrets to version control
- Use different values for staging/production
- Rotate secrets regularly

## 🚀 Advanced Configuration

### Custom Domains

```bash
# Add custom domain
vercel domains add your-domain.com

# Verify domain
vercel domains inspect your-domain.com

# Remove domain
vercel domains rm your-domain.com
```

### Cron Jobs

The configuration includes scheduled tasks:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/backup",
      "schedule": "0 3 * * 0"
    }
  ]
}
```

### Function Configuration

API routes are configured for optimal performance:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "runtime": "@vercel/node"
    }
  }
}
```

## 📊 Monitoring & Analytics

### Vercel Analytics

Enable Vercel Analytics in your project settings for:

- Real-time performance metrics
- User behavior tracking
- Error monitoring
- Core Web Vitals

### Logging

```bash
# View recent deployments
vercel ls

# View deployment logs
vercel logs [deployment-url]

# View function logs
vercel logs --function
```

## 🔄 Deployment Strategies

### GitHub Integration

1. Connect your GitHub repository to Vercel
2. Configure automatic deployments
3. Set up preview deployments for pull requests

### Manual Deployments

```bash
# Deploy from local machine
vercel --prod

# Deploy specific directory
vercel --prod --cwd ./modernmen-yolo
```

### Environment-Specific Deployments

```bash
# Production deployment
vercel --prod

# Staging deployment
vercel --git-ref develop

# Custom environment
vercel --git-ref feature-branch
```

## 🐛 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Check build logs
vercel logs --follow

# Clear build cache
vercel rm --all

# Rebuild from scratch
npm run clean && npm run build
```

#### Environment Variables

```bash
# List environment variables
vercel env ls

# Update environment variable
vercel env add VARIABLE_NAME

# Remove environment variable
vercel env rm VARIABLE_NAME
```

#### Domain Issues

```bash
# Check domain configuration
vercel domains ls

# Verify DNS settings
vercel domains inspect your-domain.com
```

### Performance Optimization

1. **Enable Vercel Analytics** for performance monitoring
2. **Configure caching** in `vercel.json`
3. **Optimize images** with Next.js Image component
4. **Use Edge Functions** for global distribution

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

## 🎯 Best Practices

### Development Workflow

1. **Use preview deployments** for pull requests
2. **Test thoroughly** before merging to main
3. **Monitor performance** with Vercel Analytics
4. **Keep dependencies updated** for security
5. **Use semantic versioning** for releases

### Security Best Practices

1. **Use HTTPS** (automatically enabled by Vercel)
2. **Configure security headers** (included in vercel.json)
3. **Use environment variables** for secrets
4. **Enable 2FA** on Vercel account
5. **Regular security audits**

### Performance Best Practices

1. **Optimize images** with Next.js Image component
2. **Use caching** appropriately
3. **Minimize bundle size** with code splitting
4. **Monitor Core Web Vitals**
5. **Use Edge Functions** for better performance

---

This deployment guide ensures your Modern Men Hair Salon application is properly configured and deployed on Vercel with optimal performance and security.
