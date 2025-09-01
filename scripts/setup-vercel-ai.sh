#!/bin/bash

# Vercel AI Setup Script
# This script helps configure Vercel AI integration for the ModernMen project

set -e

echo "🤖 Setting up Vercel AI Integration for ModernMen Project"
echo "======================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if GitHub CLI is available
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
else
    echo "⚠️  GitHub CLI not found. Please install it from https://cli.github.com/"
    echo "   Or manually set up the secrets in GitHub repository settings."
fi

echo ""
echo "📋 Required GitHub Secrets:"
echo "=========================="
echo ""
echo "1. VERCEL_AI_API_KEY"
echo "   - Get from: https://vercel.com/dashboard → Your Project → Settings → Integrations → AI"
echo "   - Description: API key for Vercel AI services"
echo ""
echo "2. VERCEL_TOKEN"
echo "   - Get from: https://vercel.com/account/tokens"
echo "   - Description: Vercel CLI token for deployments"
echo ""
echo "3. STAGING_DATABASE_URL"
echo "   - Your staging database connection string"
echo "   - Description: Database URL for staging environment"
echo ""
echo "4. PRODUCTION_DATABASE_URL"
echo "   - Your production database connection string"
echo "   - Description: Database URL for production environment"
echo ""
echo "5. STAGING_APP_URL"
echo "   - Your Vercel staging domain (e.g., https://your-project-staging.vercel.app)"
echo "   - Description: App URL for staging environment"
echo ""
echo "6. PRODUCTION_APP_URL"
echo "   - Your Vercel production domain (e.g., https://your-project.vercel.app)"
echo "   - Description: App URL for production environment"
echo ""

# Interactive setup
read -p "Do you want to set up GitHub secrets now? (y/N): " setup_secrets

if [[ $setup_secrets =~ ^[Yy]$ ]]; then
    if command -v gh &> /dev/null; then
        echo ""
        echo "🔑 Setting up GitHub secrets..."
        echo "================================"

        # VERCEL_AI_API_KEY
        read -p "Enter your Vercel AI API Key: " vercel_ai_key
        if [ ! -z "$vercel_ai_key" ]; then
            echo "$vercel_ai_key" | gh secret set VERCEL_AI_API_KEY
            echo "✅ VERCEL_AI_API_KEY set"
        fi

        # VERCEL_TOKEN
        read -p "Enter your Vercel Token: " vercel_token
        if [ ! -z "$vercel_token" ]; then
            echo "$vercel_token" | gh secret set VERCEL_TOKEN
            echo "✅ VERCEL_TOKEN set"
        fi

        # Database URLs
        read -p "Enter your staging database URL: " staging_db_url
        if [ ! -z "$staging_db_url" ]; then
            echo "$staging_db_url" | gh secret set STAGING_DATABASE_URL
            echo "✅ STAGING_DATABASE_URL set"
        fi

        read -p "Enter your production database URL: " prod_db_url
        if [ ! -z "$prod_db_url" ]; then
            echo "$prod_db_url" | gh secret set PRODUCTION_DATABASE_URL
            echo "✅ PRODUCTION_DATABASE_URL set"
        fi

        # App URLs
        read -p "Enter your staging app URL: " staging_app_url
        if [ ! -z "$staging_app_url" ]; then
            echo "$staging_app_url" | gh secret set STAGING_APP_URL
            echo "✅ STAGING_APP_URL set"
        fi

        read -p "Enter your production app URL: " prod_app_url
        if [ ! -z "$prod_app_url" ]; then
            echo "$prod_app_url" | gh secret set PRODUCTION_APP_URL
            echo "✅ PRODUCTION_APP_URL set"
        fi

        echo ""
        echo "🎉 GitHub secrets configured successfully!"
    else
        echo ""
        echo "❌ GitHub CLI not available. Please manually set up the secrets:"
        echo "   Go to: https://github.com/your-username/your-repo/settings/secrets/actions"
        echo "   Add the secrets listed above."
    fi
fi

echo ""
echo "🔗 Vercel Project Setup:"
echo "======================="
echo ""
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click 'Add New...' → 'Project'"
echo "3. Import your GitHub repository: reconsumeralization/amm2"
echo "4. Configure build settings:"
echo "   - Framework Preset: Next.js"
echo "   - Root Directory: ./ (leave default)"
echo "   - Build Command: npm run build"
echo "   - Output Directory: .next (leave default)"
echo ""
echo "5. Add Environment Variables in Vercel:"
echo "   - PAYLOAD_SECRET: your_payload_secret"
echo "   - NEXT_PUBLIC_APP_URL: https://your-domain.vercel.app"
echo "   - DATABASE_URL: your_database_url"
echo "   - NEXT_PUBLIC_VERCEL_ENV: production"
echo "   - VERCEL_ENV: production"
echo ""

echo "📋 Next Steps:"
echo "=============="
echo ""
echo "1. Push these workflow files to GitHub:"
echo "   git add ."
echo "   git commit -m 'feat: add AI-powered development workflows'"
echo "   git push origin main"
echo ""
echo "2. Create a test pull request to trigger AI code review"
echo ""
echo "3. Use manual workflows:"
echo "   - Go to Actions tab → 'AI-Powered Development Tools'"
echo "   - Click 'Run workflow' to generate documentation or run security audits"
echo ""
echo "4. Monitor AI feedback in:"
echo "   - Pull request comments"
echo "   - Actions workflow logs"
echo "   - Security vulnerability reports"
echo ""

echo "🎯 AI Features Now Available:"
echo "============================="
echo ""
echo "✅ Automated Code Review on PRs"
echo "✅ AI-Generated Documentation"
echo "✅ Security Vulnerability Scanning"
echo "✅ Performance Analysis & Optimization"
echo "✅ Changelog Generation"
echo "✅ Bundle Size Analysis"
echo ""

echo "📖 For more information, see:"
echo "- .github/workflows/README.md"
echo "- AI features documentation in main README"
echo ""

echo "🚀 Setup complete! Your AI-powered development environment is ready."
