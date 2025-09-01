#!/bin/bash

# Modern Men Hair Salon - Vercel Setup Script
# This script helps set up Vercel deployment for the Modern Men project

set -e

echo "🚀 Setting up Vercel for Modern Men Hair Salon"
echo "=============================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Logging into Vercel..."
vercel login

# Link project to Vercel
echo "🔗 Linking project to Vercel..."
vercel link --yes

# Setup environment variables
echo "🔧 Setting up environment variables..."

# Production environment
echo "🌍 Configuring production environment..."
vercel env add NEXT_PUBLIC_APP_URL production
vercel env add DATABASE_URL production
vercel env add PAYLOAD_SECRET production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production
vercel env add SMTP_USER production
vercel env add SMTP_PASS production
vercel env add RESEND_API_KEY production

# Preview environment (staging)
echo "🧪 Configuring preview environment..."
vercel env add NEXT_PUBLIC_APP_URL preview
vercel env add DATABASE_URL preview
vercel env add PAYLOAD_SECRET preview
vercel env add NEXTAUTH_SECRET preview
vercel env add NEXTAUTH_URL preview
vercel env add SUPABASE_URL preview
vercel env add SUPABASE_ANON_KEY preview
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
vercel env add STRIPE_PUBLISHABLE_KEY preview
vercel env add STRIPE_SECRET_KEY preview

# Development environment
echo "💻 Configuring development environment..."
vercel env add NEXT_PUBLIC_APP_URL development

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Vercel setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Set the environment variable values in your Vercel dashboard"
echo "2. Configure your domain in Vercel"
echo "3. Set up monitoring and alerts"
echo "4. Configure team access if needed"
echo ""
echo "🔗 Useful commands:"
echo "  vercel env ls              # List environment variables"
echo "  vercel domains ls          # List domains"
echo "  vercel logs                # View deployment logs"
echo "  vercel inspect <url>       # Inspect a deployment"
echo "  vercel git disconnect      # Disconnect Git integration"
echo ""
echo "📖 Documentation: https://vercel.com/docs"
