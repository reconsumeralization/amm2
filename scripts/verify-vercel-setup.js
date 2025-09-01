#!/usr/bin/env node

/**
 * Verification script for Vercel deployment setup
 * Run with: node scripts/verify-vercel-setup.js
 */

const { execSync } = require('child_process');

function runCommand(command, description) {
  try {
    console.log(`🔍 ${description}...`);
    const result = execSync(command, { encoding: 'utf8' }).trim();
    console.log(`✅ ${description} - Success`);
    return result;
  } catch (error) {
    console.log(`❌ ${description} - Failed`);
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

function checkGitHubSecrets() {
  console.log('\n🔐 Checking GitHub Secrets Setup...');
  console.log('=====================================');

  const secrets = [
    'OPENAI_API_KEY',
    'VERCEL_TOKEN',
    'VERCEL_ORG_ID',
    'VERCEL_PROJECT_ID',
    'PAYLOAD_SECRET'
  ];

  console.log('\n⚠️  Note: This script cannot verify actual secret values.');
  console.log('   Please ensure these secrets are set in your GitHub repository:');
  console.log('   https://github.com/reconsumeralization/amm2/settings/secrets/actions\n');

  secrets.forEach(secret => {
    console.log(`   - ${secret}: [${secret in process.env ? 'Set in local env' : 'Check GitHub secrets'}]`);
  });
}

function checkVercelCLI() {
  console.log('\n🚀 Checking Vercel CLI...');
  console.log('=========================');

  const vercelVersion = runCommand('vercel --version', 'Vercel CLI version check');
  if (vercelVersion) {
    console.log(`   Version: ${vercelVersion}`);
  }

  const vercelWhoami = runCommand('vercel whoami', 'Vercel authentication check');
  if (vercelWhoami) {
    console.log(`   Logged in as: ${vercelWhoami}`);
  }
}

function checkNodeVersion() {
  console.log('\n📦 Checking Node.js Version...');
  console.log('==============================');

  const nodeVersion = runCommand('node --version', 'Node.js version check');
  if (nodeVersion) {
    console.log(`   Node.js: ${nodeVersion}`);
  }

  const npmVersion = runCommand('npm --version', 'NPM version check');
  if (npmVersion) {
    console.log(`   NPM: ${npmVersion}`);
  }
}

function checkProjectStructure() {
  console.log('\n📁 Checking Project Structure...');
  console.log('================================');

  const checks = [
    ['package.json', 'Package.json exists'],
    ['next.config.js', 'Next.js config exists'],
    ['vercel.json', 'Vercel config exists'],
    ['src/payload.config.ts', 'Payload config exists'],
    ['.github/workflows/ci-cd.yml', 'CI/CD workflow exists']
  ];

  checks.forEach(([file, description]) => {
    const fs = require('fs');
    if (fs.existsSync(file)) {
      console.log(`✅ ${description}`);
    } else {
      console.log(`❌ ${description} - Missing: ${file}`);
    }
  });
}

function displaySetupInstructions() {
  console.log('\n📋 Setup Instructions:');
  console.log('======================');
  console.log('');
  console.log('1. GitHub Secrets (https://github.com/reconsumeralization/amm2/settings/secrets/actions):');
  console.log('   - OPENAI_API_KEY: Get from https://platform.openai.com/api-keys');
  console.log('   - VERCEL_TOKEN: Get from https://vercel.com/account/tokens');
  console.log('   - VERCEL_ORG_ID: Get from https://vercel.com/dashboard → Settings → General');
  console.log('   - VERCEL_PROJECT_ID: Get from https://vercel.com/dashboard → [Project] → Settings → General');
  console.log('   - PAYLOAD_SECRET: Generate a secure random string');
  console.log('');
  console.log('2. Vercel Project Setup:');
  console.log('   - Go to https://vercel.com/dashboard');
  console.log('   - Click "Add New..." → "Project"');
  console.log('   - Import: reconsumeralization/amm2');
  console.log('   - Configure build settings (Next.js, default settings)');
  console.log('');
  console.log('3. Environment Variables in Vercel:');
  console.log('   - NEXT_PUBLIC_APP_URL: Your Vercel domain');
  console.log('   - DATABASE_URL: Your database connection string');
  console.log('   - PAYLOAD_SECRET: Same as GitHub secret');
  console.log('');
  console.log('4. Test Deployment:');
  console.log('   - Push to develop branch → triggers staging deployment');
  console.log('   - Push to main branch → triggers production deployment');
  console.log('');
  console.log('5. Monitor Deployments:');
  console.log('   - GitHub: Actions tab');
  console.log('   - Vercel: Dashboard → Deployments');
}

if (require.main === module) {
  console.log('🔍 Vercel Deployment Setup Verification');
  console.log('======================================');

  checkGitHubSecrets();
  checkVercelCLI();
  checkNodeVersion();
  checkProjectStructure();
  displaySetupInstructions();

  console.log('\n🎯 Ready to deploy!');
  console.log('===================');
  console.log('Once all secrets are configured, your CI/CD pipeline will automatically:');
  console.log('✅ Run tests and linting');
  console.log('✅ Build and deploy to staging (develop branch)');
  console.log('✅ Deploy to production (main branch)');
  console.log('✅ Provide AI-powered code reviews on PRs');
  console.log('');
  console.log('🚀 Happy deploying!');
}
