#!/bin/bash

# Modern Men Hair Salon - Vercel Setup Script
# This script helps set up Vercel deployment for the Modern Men project

set -e

echo "🚀 Setting up Vercel for Modern Men Hair Salon"
echo "=============================================="

# Function to run vercel commands
run_vercel() {
    if command -v vercel &> /dev/null; then
        vercel "$@"
    elif npx vercel --version &>/dev/null; then
        npx vercel "$@"
    else
        echo "❌ Vercel CLI not available. Please install it first."
        return 1
    fi
}

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null && ! npx vercel --version &>/dev/null; then
    echo "📦 Installing Vercel CLI..."

    # Try global installation first
    if npm install -g vercel 2>/dev/null; then
        echo "✅ Vercel CLI installed globally"
    else
        echo "⚠️  Global installation failed due to permissions."
        echo "🔄 The script will try to use npx instead."
        echo ""

        # Check if npx can run vercel
        if ! npx vercel --version &>/dev/null; then
            echo "❌ Neither global installation nor npx worked."
            echo ""
            echo "💡 Solutions:"
            echo "   1. Run with sudo: sudo $0"
            echo "   2. Install Node.js with nvm: https://github.com/nvm-sh/nvm"
            echo "   3. Manually install: npm install -g vercel"
            echo "   4. Use npm with different permissions: npm install -g vercel --unsafe-perm=true"
            exit 1
        fi
    fi
fi

# Login to Vercel
echo "🔐 Logging into Vercel..."
run_vercel login

# Link project to Vercel
echo "🔗 Linking project to Vercel..."
run_vercel link --yes

# Setup environment variables
echo "🔧 Setting up environment variables..."

# Production environment
echo "🌍 Configuring production environment..."
run_vercel env add NEXT_PUBLIC_APP_URL production
run_vercel env add DATABASE_URL production
run_vercel env add PAYLOAD_SECRET production
run_vercel env add NEXTAUTH_SECRET production
run_vercel env add NEXTAUTH_URL production
run_vercel env add SUPABASE_URL production
run_vercel env add SUPABASE_ANON_KEY production
run_vercel env add SUPABASE_SERVICE_ROLE_KEY production
run_vercel env add STRIPE_PUBLISHABLE_KEY production
run_vercel env add STRIPE_SECRET_KEY production
run_vercel env add SMTP_HOST production
run_vercel env add SMTP_PORT production
run_vercel env add SMTP_USER production
run_vercel env add SMTP_PASS production
run_vercel env add RESEND_API_KEY production

# Preview environment (staging)
echo "🧪 Configuring preview environment..."
run_vercel env add NEXT_PUBLIC_APP_URL preview
run_vercel env add DATABASE_URL preview
run_vercel env add PAYLOAD_SECRET preview
run_vercel env add NEXTAUTH_SECRET preview
run_vercel env add NEXTAUTH_URL preview
run_vercel env add SUPABASE_URL preview
run_vercel env add SUPABASE_ANON_KEY preview
run_vercel env add SUPABASE_SERVICE_ROLE_KEY preview
run_vercel env add STRIPE_PUBLISHABLE_KEY preview
run_vercel env add STRIPE_SECRET_KEY preview

# Development environment
echo "💻 Configuring development environment..."
run_vercel env add NEXT_PUBLIC_APP_URL development

# Deploy to production
echo "🚀 Deploying to production..."
run_vercel --prod

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
echo "💡 Note: This script automatically handles permission issues by using npx when needed."
echo ""
echo "📖 Documentation: https://vercel.com/docs"
