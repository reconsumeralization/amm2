#!/usr/bin/env node

/**
 * Complete Vercel Deployment Guide
 * Run with: node scripts/deploy-to-vercel-guide.js
 */

const { execSync } = require('child_process');

console.log('🚀 Complete Vercel Deployment Guide for ModernMen Project');
console.log('=========================================================');
console.log('');

console.log('📋 Step-by-Step Deployment Process:');
console.log('===================================');
console.log('');

console.log('🔑 STEP 1: Set Up GitHub Secrets');
console.log('=================================');
console.log('');
console.log('Go to: https://github.com/reconsumeralization/amm2/settings/secrets/actions');
console.log('');
console.log('Add these secrets:');
console.log('');

console.log('1. OPENAI_API_KEY');
console.log('   ├─ Go to: https://platform.openai.com/api-keys');
console.log('   ├─ Sign in and create a new secret key');
console.log('   └─ Copy the key and paste it here');
console.log('');

console.log('2. VERCEL_TOKEN');
console.log('   ├─ Go to: https://vercel.com/account/tokens');
console.log('   ├─ Click "Create Token"');
console.log('   ├─ Name: "ModernMen Deployment Token"');
console.log('   └─ Copy the token and paste it here');
console.log('');

console.log('3. VERCEL_ORG_ID');
console.log('   ├─ Go to: https://vercel.com/dashboard');
console.log('   ├─ Click your profile picture (top right)');
console.log('   ├─ Go to Settings → General');
console.log('   └─ Copy the "Team ID" value');
console.log('');

console.log('4. VERCEL_PROJECT_ID');
console.log('   ├─ First create your Vercel project (see Step 2)');
console.log('   ├─ Then go to: Project Settings → General');
console.log('   └─ Copy the "Project ID" value');
console.log('');

console.log('5. PAYLOAD_SECRET');
console.log('   ├─ Generate a secure random string');
console.log('   ├─ You can use: openssl rand -hex 32');
console.log('   └─ Or use: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
console.log('');

console.log('6. STAGING_DATABASE_URL (Optional)');
console.log('   ├─ Your staging database connection string');
console.log('   └─ Example: postgresql://user:pass@host:5432/dbname');
console.log('');

console.log('7. PRODUCTION_DATABASE_URL (Optional)');
console.log('   ├─ Your production database connection string');
console.log('   └─ Example: postgresql://user:pass@host:5432/dbname');
console.log('');

console.log('💻 STEP 2: Create Vercel Project');
console.log('================================');
console.log('');
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Click "Add New..." → "Project"');
console.log('3. Click "Import Git Repository"');
console.log('4. Search for and select: reconsumeralization/amm2');
console.log('5. Configure project settings:');
console.log('   ├─ Framework Preset: Next.js');
console.log('   ├─ Root Directory: ./ (leave default)');
console.log('   ├─ Build Command: npm run build');
console.log('   └─ Output Directory: .next (leave default)');
console.log('6. Click "Deploy"');
console.log('');
console.log('⚠️  Note: The first deployment might fail due to missing environment variables.');
console.log('   This is expected - we\'ll fix it in the next steps.');
console.log('');

console.log('🌍 STEP 3: Configure Environment Variables');
console.log('===========================================');
console.log('');
console.log('In your Vercel project dashboard:');
console.log('');
console.log('1. Go to Settings → Environment Variables');
console.log('2. Add these variables:');
console.log('');

console.log('   NEXT_PUBLIC_APP_URL');
console.log('   ├─ Production: https://your-project.vercel.app');
console.log('   └─ Preview: https://your-project-staging.vercel.app');
console.log('');

console.log('   DATABASE_URL');
console.log('   ├─ Your database connection string');
console.log('   └─ Example: postgresql://user:pass@host:5432/modernmen_prod');
console.log('');

console.log('   PAYLOAD_SECRET');
console.log('   ├─ Same value as your GitHub secret');
console.log('   └─ This should match your PAYLOAD_SECRET from Step 1');
console.log('');

console.log('   NODE_ENV');
console.log('   ├─ Production: production');
console.log('   └─ Preview: preview');
console.log('');

console.log('🔄 STEP 4: Test Deployment');
console.log('===========================');
console.log('');
console.log('1. Push to develop branch:');
console.log('   git checkout develop');
console.log('   git push origin develop');
console.log('');
console.log('2. This should trigger:');
console.log('   ├─ ✅ Tests and linting');
console.log('   ├─ ✅ Build process');
console.log('   └─ 🚀 Staging deployment to Vercel');
console.log('');
console.log('3. Check deployment status:');
console.log('   ├─ GitHub: Actions tab → CI/CD Pipeline');
console.log('   └─ Vercel: Dashboard → Deployments');
console.log('');

console.log('🚀 STEP 5: Production Deployment');
console.log('=================================');
console.log('');
console.log('Once staging is working:');
console.log('');
console.log('1. Merge develop to main:');
console.log('   git checkout main');
console.log('   git merge develop');
console.log('   git push origin main');
console.log('');
console.log('2. This triggers production deployment');
console.log('3. Monitor at: https://vercel.com/dashboard');
console.log('');

console.log('🤖 STEP 6: AI Code Review Setup');
console.log('===============================');
console.log('');
console.log('Test AI-powered code reviews:');
console.log('');
console.log('1. Create a pull request');
console.log('2. The AI will automatically:');
console.log('   ├─ ✅ Analyze code quality');
console.log('   ├─ 🔒 Check for security issues');
console.log('   ├─ ⚡ Review performance');
console.log('   └─ 📝 Comment on the PR');
console.log('');
console.log('3. View results in: Actions → CI/CD Pipeline logs');
console.log('');

console.log('🔧 STEP 7: Troubleshooting');
console.log('===========================');
console.log('');
console.log('Common Issues:');
console.log('');

console.log('❌ Build Fails:');
console.log('   ├─ Check environment variables in Vercel');
console.log('   ├─ Verify database connectivity');
console.log('   └─ Check build logs in Vercel dashboard');
console.log('');

console.log('❌ Secrets Missing:');
console.log('   ├─ Verify all GitHub secrets are set');
console.log('   ├─ Check secret names match exactly');
console.log('   └─ Ensure secrets have proper permissions');
console.log('');

console.log('❌ Database Connection:');
console.log('   ├─ Verify DATABASE_URL format');
console.log('   ├─ Check database server is accessible');
console.log('   └─ Ensure database credentials are correct');
console.log('');

console.log('📞 STEP 8: Support & Monitoring');
console.log('================================');
console.log('');
console.log('Monitor your deployments:');
console.log('├─ GitHub Actions: https://github.com/reconsumeralization/amm2/actions');
console.log('├─ Vercel Dashboard: https://vercel.com/dashboard');
console.log('└─ Application: Your Vercel domain');
console.log('');
console.log('Get help:');
console.log('├─ Vercel Docs: https://vercel.com/docs');
console.log('├─ GitHub Actions: https://docs.github.com/en/actions');
console.log('└─ Check workflow logs for detailed error messages');
console.log('');

console.log('🎉 SUCCESS CHECKLIST');
console.log('====================');
console.log('');
console.log('✅ GitHub secrets configured');
console.log('✅ Vercel project created');
console.log('✅ Environment variables set');
console.log('✅ Staging deployment working');
console.log('✅ Production deployment working');
console.log('✅ AI code review functional');
console.log('✅ Database connected');
console.log('');
console.log('🚀 Your ModernMen project is now live on Vercel!');
console.log('');

console.log('💡 Quick Commands:');
console.log('==================');
console.log('');
console.log('# Check deployment status');
console.log('gh workflow list');
console.log('gh run list');
console.log('');
console.log('# View latest deployment');
console.log('gh run view --log');
console.log('');
console.log('# Check Vercel deployments');
console.log('vercel deployments ls  # (if Vercel CLI installed)');

console.log('');
console.log('🎯 Ready to deploy? Follow the steps above and get your project live!');
console.log('============================================================================');

// Offer to run the setup script
console.log('');
console.log('🔧 Would you like to run the interactive setup script?');
console.log('Run: .\\scripts\\setup-vercel-ai.ps1');
console.log('(This will help you configure all the secrets interactively)');
