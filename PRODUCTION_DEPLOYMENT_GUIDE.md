# 🚀 ModernMen Production Deployment Guide

This guide covers all critical gotchas and solutions for deploying the ModernMen barbershop application to production.

## 📋 Pre-Deployment Checklist

### ✅ Environment Variables
- [ ] All required environment variables are set
- [ ] No placeholder values remain
- [ ] Database URI uses SSL/TLS
- [ ] Stripe keys are live (not test) keys
- [ ] All API keys have proper permissions

### ✅ Database Setup
- [ ] MongoDB Atlas cluster is configured
- [ ] Database user has proper permissions
- [ ] Network access is configured
- [ ] Backup strategy is in place

### ✅ External Services
- [ ] Stripe account is configured
- [ ] OpenAI API key is active
- [ ] Google Calendar API is enabled
- [ ] Email service is configured
- [ ] Bunny CDN is set up (optional)

## 🔧 Critical Gotchas & Solutions

### 1. Settings Collection Misconfiguration

**Problem**: Missing or misconfigured settings can break features.

**Solution**: 
```bash
# Run settings initialization
npm run deploy:check
```

**Prevention**: The system automatically creates default settings if none exist.

### 2. Multi-Tenancy Issues

**Problem**: Data leaks between tenants.

**Solution**: 
- All API routes validate tenant IDs
- Database queries are properly scoped
- Access control is enforced at collection level

**Prevention**: Test with multiple tenants before deployment.

### 3. Responsive Image Optimization Failures

**Problem**: Images fail to optimize or load slowly.

**Solution**:
- Verify Bunny CDN configuration
- Check image size limits in settings
- Ensure WebP fallback is configured

**Prevention**: Test image uploads with various sizes and formats.

### 4. Chatbot Behavior Issues

**Problem**: Chatbot shows/hides incorrectly or crashes.

**Solution**:
- Validate chatbot settings in admin panel
- Check AI triggers configuration
- Test with different user roles

**Prevention**: Test chatbot on all configured paths.

### 5. Google Calendar Sync Failures

**Problem**: Appointments don't sync to Google Calendar.

**Solution**:
- Verify OAuth tokens are valid
- Check calendar ID configuration
- Test sync manually

**Prevention**: Monitor sync logs and implement retry logic.

### 6. Stripe Payment Issues

**Problem**: Payments fail or webhooks don't work.

**Solution**:
- Verify webhook endpoint is accessible
- Check webhook secret configuration
- Test payment flow end-to-end

**Prevention**: Use Stripe's test mode first.

### 7. Performance Bottlenecks

**Problem**: Slow page loads or API responses.

**Solution**:
- Implement caching for settings
- Optimize database queries
- Use CDN for static assets

**Prevention**: Monitor performance metrics.

### 8. Email Delivery Issues

**Problem**: Email notifications don't send.

**Solution**:
- Verify SMTP configuration
- Check email templates
- Test email sending manually

**Prevention**: Use email service with good deliverability.

### 9. AI Integration Failures

**Problem**: AI features don't work.

**Solution**:
- Verify OpenAI API key
- Check rate limits
- Implement fallback responses

**Prevention**: Monitor API usage and implement retry logic.

### 10. Deployment Issues

**Problem**: Build fails or app doesn't start.

**Solution**:
- Run deployment check script
- Verify environment variables
- Check build logs

**Prevention**: Test deployment process locally.

## 🚀 Deployment Steps

### Step 1: Environment Setup
```bash
# Copy environment template
cp env.production.example .env.production

# Edit with your actual values
nano .env.production
```

### Step 2: Pre-Deployment Validation
```bash
# Run comprehensive checks
npm run deploy:check

# Fix any errors before proceeding
```

### Step 3: Database Migration
```bash
# Run database migrations
npm run db:migrate

# Seed initial data if needed
npm run db:seed
```

### Step 4: Build & Deploy
```bash
# Build the application
npm run build

# Deploy to your platform (Vercel, Netlify, etc.)
```

### Step 5: Post-Deployment Verification
```bash
# Test all critical features
- User registration/login
- Appointment booking
- Payment processing
- Email notifications
- AI chatbot
- Image uploads
```

## 🔍 Monitoring & Maintenance

### Health Checks
- Monitor API response times
- Check error rates
- Verify external service status
- Monitor database performance

### Log Monitoring
- Application logs
- API request logs
- Error tracking (Sentry)
- Performance metrics

### Regular Maintenance
- Update dependencies
- Backup database
- Review security settings
- Monitor API usage

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Settings not found" Error
```bash
# Check if settings exist
curl https://yourdomain.com/api/settings

# Create default settings if needed
npm run db:seed
```

#### 2. "Stripe webhook failed" Error
```bash
# Check webhook endpoint
curl -X POST https://yourdomain.com/api/stripe-webhook

# Verify webhook secret
echo $STRIPE_WEBHOOK_SECRET
```

#### 3. "Database connection failed" Error
```bash
# Test database connection
npm run deploy:check

# Check MongoDB Atlas settings
```

#### 4. "Image upload failed" Error
```bash
# Check Bunny CDN configuration
echo $BUNNY_API_KEY
echo $BUNNY_STORAGE_ZONE

# Test image upload manually
```

### Emergency Procedures

#### Database Issues
1. Check MongoDB Atlas status
2. Verify connection string
3. Check network access
4. Restore from backup if needed

#### Payment Issues
1. Check Stripe dashboard
2. Verify webhook configuration
3. Test payment flow
4. Contact Stripe support if needed

#### AI Service Issues
1. Check OpenAI API status
2. Verify API key
3. Check rate limits
4. Implement fallback mode

## 📞 Support

### Internal Resources
- Deployment check script: `npm run deploy:check`
- Settings validation: Admin panel
- API documentation: `/api/docs`

### External Support
- Stripe: https://support.stripe.com
- OpenAI: https://help.openai.com
- MongoDB: https://docs.atlas.mongodb.com
- Vercel: https://vercel.com/support

## 🔒 Security Checklist

### Environment Variables
- [ ] All secrets are at least 32 characters
- [ ] No secrets in version control
- [ ] Different keys for dev/prod
- [ ] Regular key rotation

### Database Security
- [ ] SSL/TLS enabled
- [ ] Network access restricted
- [ ] User permissions minimal
- [ ] Regular backups

### API Security
- [ ] Rate limiting enabled
- [ ] Input validation
- [ ] Error handling
- [ ] CORS configured

### Payment Security
- [ ] PCI compliance
- [ ] Webhook verification
- [ ] Test mode disabled
- [ ] Fraud monitoring

## 📊 Performance Optimization

### Frontend
- Image optimization
- Code splitting
- Caching strategies
- CDN usage

### Backend
- Database indexing
- Query optimization
- Caching layers
- Rate limiting

### Monitoring
- Performance metrics
- Error tracking
- User analytics
- Uptime monitoring

---

**Remember**: Always test thoroughly in a staging environment before deploying to production!
