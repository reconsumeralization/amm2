# Vercel AI Setup Script for Windows PowerShell
# This script helps configure Vercel AI integration for the ModernMen project

param(
    [switch]$Interactive = $true
)

Write-Host "🤖 Setting up Vercel AI Integration for ModernMen Project" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Required GitHub Secrets:" -ForegroundColor Yellow
Write-Host "==========================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. VERCEL_AI_API_KEY" -ForegroundColor Green
Write-Host "   - Get from: https://vercel.com/dashboard → Your Project → Settings → Integrations → AI"
Write-Host "   - Description: API key for Vercel AI services"
Write-Host ""
Write-Host "2. VERCEL_TOKEN" -ForegroundColor Green
Write-Host "   - Get from: https://vercel.com/account/tokens"
Write-Host "   - Description: Vercel CLI token for deployments"
Write-Host ""
Write-Host "3. STAGING_DATABASE_URL" -ForegroundColor Green
Write-Host "   - Your staging database connection string"
Write-Host "   - Description: Database URL for staging environment"
Write-Host ""
Write-Host "4. PRODUCTION_DATABASE_URL" -ForegroundColor Green
Write-Host "   - Your production database connection string"
Write-Host "   - Description: Database URL for production environment"
Write-Host ""
Write-Host "5. STAGING_APP_URL" -ForegroundColor Green
Write-Host "   - Your Vercel staging domain (e.g., https://your-project-staging.vercel.app)"
Write-Host "   - Description: App URL for staging environment"
Write-Host ""
Write-Host "6. PRODUCTION_APP_URL" -ForegroundColor Green
Write-Host "   - Your Vercel production domain (e.g., https://your-project.vercel.app)"
Write-Host "   - Description: App URL for production environment"
Write-Host ""

if ($Interactive) {
    $setupSecrets = Read-Host "Do you want to set up GitHub secrets now? (y/N)"
    if ($setupSecrets -match "^[Yy]$") {
        # Check if GitHub CLI is available
        if (Get-Command gh -ErrorAction SilentlyContinue) {
            Write-Host ""
            Write-Host "🔑 Setting up GitHub secrets..." -ForegroundColor Yellow
            Write-Host "================================" -ForegroundColor Yellow

            # VERCEL_AI_API_KEY
            $vercelAiKey = Read-Host "Enter your Vercel AI API Key"
            if ($vercelAiKey) {
                $vercelAiKey | gh secret set VERCEL_AI_API_KEY
                Write-Host "✅ VERCEL_AI_API_KEY set" -ForegroundColor Green
            }

            # VERCEL_TOKEN
            $vercelToken = Read-Host "Enter your Vercel Token"
            if ($vercelToken) {
                $vercelToken | gh secret set VERCEL_TOKEN
                Write-Host "✅ VERCEL_TOKEN set" -ForegroundColor Green
            }

            # Database URLs
            $stagingDbUrl = Read-Host "Enter your staging database URL"
            if ($stagingDbUrl) {
                $stagingDbUrl | gh secret set STAGING_DATABASE_URL
                Write-Host "✅ STAGING_DATABASE_URL set" -ForegroundColor Green
            }

            $prodDbUrl = Read-Host "Enter your production database URL"
            if ($prodDbUrl) {
                $prodDbUrl | gh secret set PRODUCTION_DATABASE_URL
                Write-Host "✅ PRODUCTION_DATABASE_URL set" -ForegroundColor Green
            }

            # App URLs
            $stagingAppUrl = Read-Host "Enter your staging app URL"
            if ($stagingAppUrl) {
                $stagingAppUrl | gh secret set STAGING_APP_URL
                Write-Host "✅ STAGING_APP_URL set" -ForegroundColor Green
            }

            $prodAppUrl = Read-Host "Enter your production app URL"
            if ($prodAppUrl) {
                $prodAppUrl | gh secret set PRODUCTION_APP_URL
                Write-Host "✅ PRODUCTION_APP_URL set" -ForegroundColor Green
            }

            Write-Host ""
            Write-Host "🎉 GitHub secrets configured successfully!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "❌ GitHub CLI not available. Please install it from https://cli.github.com/" -ForegroundColor Red
            Write-Host "   Or manually set up the secrets in GitHub repository settings." -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "🔗 Vercel Project Setup:" -ForegroundColor Yellow
Write-Host "=======================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "2. Click 'Add New...' → 'Project'" -ForegroundColor White
Write-Host "3. Import your GitHub repository: reconsumeralization/amm2" -ForegroundColor White
Write-Host "4. Configure build settings:" -ForegroundColor White
Write-Host "   - Framework Preset: Next.js" -ForegroundColor Gray
Write-Host "   - Root Directory: ./ (leave default)" -ForegroundColor Gray
Write-Host "   - Build Command: npm run build" -ForegroundColor Gray
Write-Host "   - Output Directory: .next (leave default)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Add Environment Variables in Vercel:" -ForegroundColor White
Write-Host "   - PAYLOAD_SECRET: your_payload_secret" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_APP_URL: https://your-domain.vercel.app" -ForegroundColor Gray
Write-Host "   - DATABASE_URL: your_database_url" -ForegroundColor Gray
Write-Host "   - NEXT_PUBLIC_VERCEL_ENV: production" -ForegroundColor Gray
Write-Host "   - VERCEL_ENV: production" -ForegroundColor Gray
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "==============" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Push these workflow files to GitHub:" -ForegroundColor Cyan
Write-Host "   git add ." -ForegroundColor White
Write-Host "   git commit -m 'feat: add AI-powered development workflows'" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "2. Create a test pull request to trigger AI code review" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Use manual workflows:" -ForegroundColor Cyan
Write-Host "   - Go to Actions tab → 'AI-Powered Development Tools'" -ForegroundColor White
Write-Host "   - Click 'Run workflow' to generate documentation or run security audits" -ForegroundColor White
Write-Host ""
Write-Host "4. Monitor AI feedback in:" -ForegroundColor Cyan
Write-Host "   - Pull request comments" -ForegroundColor White
Write-Host "   - Actions workflow logs" -ForegroundColor White
Write-Host "   - Security vulnerability reports" -ForegroundColor White
Write-Host ""

Write-Host "🎯 AI Features Now Available:" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Automated Code Review on PRs" -ForegroundColor Green
Write-Host "✅ AI-Generated Documentation" -ForegroundColor Green
Write-Host "✅ Security Vulnerability Scanning" -ForegroundColor Green
Write-Host "✅ Performance Analysis & Optimization" -ForegroundColor Green
Write-Host "✅ Changelog Generation" -ForegroundColor Green
Write-Host "✅ Bundle Size Analysis" -ForegroundColor Green
Write-Host ""

Write-Host "📖 For more information, see:" -ForegroundColor Yellow
Write-Host "- .github/workflows/README.md" -ForegroundColor White
Write-Host "- AI features documentation in main README" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Setup complete! Your AI-powered development environment is ready." -ForegroundColor Green
