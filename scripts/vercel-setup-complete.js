#!/usr/bin/env node

/**
 * Complete Vercel Setup Script
 * This script handles the entire Vercel setup process including environment variables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`🔧 ${description}...`);
  try {
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} - Success`);
    return result.trim();
  } catch (error) {
    console.log(`❌ ${description} - Failed`);
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

function checkVercelCLI() {
  console.log('\n🚀 Checking Vercel CLI...');
  console.log('=========================');

  const version = runCommand('vercel --version', 'Checking Vercel CLI version');
  if (version) {
    console.log(`   Version: ${version}`);
  }

  const login = runCommand('vercel whoami', 'Checking Vercel login status');
  if (login) {
    console.log(`   Logged in as: ${login}`);
  }

  return version && login;
}

function setupVercelProject() {
  console.log('\n📦 Setting up Vercel project...');
  console.log('==============================');

  // Check if already linked
  if (fs.existsSync('.vercel/project.json')) {
    console.log('✅ Vercel project already linked');
    return true;
  }

  const link = runCommand('vercel link --yes', 'Linking Vercel project');
  return !!link;
}

function configureEnvironmentVariables() {
  console.log('\n🔐 Configuring environment variables...');
  console.log('========================================');

  const envVars = {
    // Database Configuration
    'DATABASE_URL': process.env.DATABASE_URL || 'postgres://postgres.vbokacytrvsgjahlyppf:bvlQaPZdmhRaKLr7@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x',
    'DATABASE_URL_UNPOOLED': process.env.DATABASE_URL_UNPOOLED || 'postgres://postgres.vbokacytrvsgjahlyppf:bvlQaPZdmhRaKLr7@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require',

    // Payload CMS
    'PAYLOAD_SECRET': process.env.PAYLOAD_SECRET || 'your-super-secure-payload-secret-here-32-chars-minimum',
    'PAYLOAD_PUBLIC_SERVER_URL': 'https://modernmen-yolo.vercel.app',

    // Application
    'NEXT_PUBLIC_APP_URL': 'https://modernmen-yolo.vercel.app',
    'NEXTAUTH_URL': 'https://modernmen-yolo.vercel.app',
    'NODE_ENV': 'production',

    // Supabase
    'NEXT_PUBLIC_SUPABASE_URL': 'https://vbokacytrvsgjahlyppf.supabase.co',
    'SUPABASE_URL': 'https://vbokacytrvsgjahlyppf.supabase.co',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2thY3l0cnZzZ2phaGx5cHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0OTQyOTgsImV4cCI6MjA0OTA3MDI5OH0.0r6qM68hg5my1ynwVpaWWJr6-hv_jV3jBUESrfy6jIc',
    'SUPABASE_SERVICE_ROLE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2thY3l0cnZzZ2phaGx5cHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzQ5NDI5OCwiZXhwIjoyMDQ5MDcwMjk4fQ.De-7PM0LquziRyT9Y1UAp46T8zhf8v86HkmrR7LOZ7s',

    // Authentication
    'NEXTAUTH_SECRET': process.env.NEXTAUTH_SECRET || 'your-nextauth-secret-key-here-32-chars-minimum',
    'JWT_SECRET': process.env.JWT_SECRET || 'your-secure-jwt-secret-here-32-chars-minimum',

    // Features
    'NEXT_PUBLIC_ENABLE_CHATBOT': 'true',
    'NEXT_PUBLIC_ENABLE_ANALYTICS': 'true',
    'NEXT_PUBLIC_ENABLE_NOTIFICATIONS': 'true'
  };

  let successCount = 0;
  let totalCount = Object.keys(envVars).length;

  for (const [key, value] of Object.entries(envVars)) {
    try {
      // Use echo to pipe the value to vercel env add
      execSync(`echo "${value}" | vercel env add ${key} production`, {
        stdio: 'pipe',
        input: value
      });
      console.log(`✅ Set ${key}`);
      successCount++;
    } catch (error) {
      console.log(`❌ Failed to set ${key}: ${error.message}`);
    }
  }

  console.log(`\n📊 Environment variables: ${successCount}/${totalCount} configured`);
  return successCount === totalCount;
}

function testBuild() {
  console.log('\n🔨 Testing build process...');
  console.log('===========================');

  const build = runCommand('npm run build', 'Running production build');
  return !!build;
}

function deployToVercel() {
  console.log('\n🚀 Deploying to Vercel...');
  console.log('=========================');

  const deploy = runCommand('vercel --prod', 'Deploying to production');
  return !!deploy;
}

function getDeploymentInfo() {
  console.log('\n📊 Getting deployment information...');
  console.log('===================================');

  try {
    const result = execSync('vercel ls --format json', { encoding: 'utf8' });
    const deployments = JSON.parse(result);

    if (deployments && deployments.length > 0) {
      const latest = deployments[0];
      console.log(`📍 Latest deployment: https://${latest.url}`);
      console.log(`📅 Created: ${new Date(latest.createdAt).toLocaleString()}`);
      console.log(`📊 Status: ${latest.state}`);
      return latest.url;
    }
  } catch (error) {
    console.log('❌ Could not retrieve deployment information');
  }

  return null;
}

function createHealthCheck() {
  console.log('\n🏥 Creating health check endpoint...');
  console.log('====================================');

  const healthCheckPath = path.join(process.cwd(), 'src', 'app', 'api', 'health', 'route.ts');

  if (!fs.existsSync(path.dirname(healthCheckPath))) {
    fs.mkdirSync(path.dirname(healthCheckPath), { recursive: true });
  }

  const healthCheckCode = `import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}`;

  fs.writeFileSync(healthCheckPath, healthCheckCode);
  console.log('✅ Created health check endpoint at /api/health');
}

function main() {
  console.log('🚀 Complete Vercel Setup for Modern Men Hair BarberShop');
  console.log('======================================================');

  let allStepsSuccessful = true;

  // Step 1: Check Vercel CLI
  if (!checkVercelCLI()) {
    console.log('\n❌ Vercel CLI setup failed. Please install and login first.');
    console.log('   Install: npm install -g vercel');
    console.log('   Login: vercel login');
    process.exit(1);
  }

  // Step 2: Setup Vercel project
  if (!setupVercelProject()) {
    console.log('\n❌ Vercel project setup failed.');
    allStepsSuccessful = false;
  }

  // Step 3: Configure environment variables
  if (!configureEnvironmentVariables()) {
    console.log('\n❌ Environment variable configuration failed.');
    allStepsSuccessful = false;
  }

  // Step 4: Create health check
  createHealthCheck();

  // Step 5: Test build
  if (!testBuild()) {
    console.log('\n❌ Build test failed.');
    allStepsSuccessful = false;
  }

  // Step 6: Deploy
  if (allStepsSuccessful && testBuild()) {
    if (deployToVercel()) {
      const deploymentUrl = getDeploymentInfo();
      if (deploymentUrl) {
        console.log('\n🎉 Deployment completed successfully!');
        console.log('====================================');
        console.log(`🌐 Your app is live at: https://${deploymentUrl}`);
        console.log('\n📋 Next steps:');
        console.log('   1. Test your application');
        console.log('   2. Check the Payload CMS admin at: https://' + deploymentUrl + '/admin');
        console.log('   3. Verify database connections');
        console.log('   4. Test user authentication');
        console.log('\n🔗 Useful links:');
        console.log('   - Vercel Dashboard: https://vercel.com/dashboard');
        console.log('   - Deployment Logs: vercel logs');
        console.log('   - Environment Variables: vercel env ls');
      }
    } else {
      console.log('\n❌ Deployment failed.');
      allStepsSuccessful = false;
    }
  } else {
    console.log('\n⚠️  Skipping deployment due to previous failures.');
    console.log('   Fix the issues above and run this script again.');
  }

  if (allStepsSuccessful) {
    console.log('\n🎯 Vercel setup completed successfully!');
    console.log('=====================================');
  } else {
    console.log('\n⚠️  Vercel setup completed with some issues.');
    console.log('=====================================');
    console.log('Please review the errors above and fix them before deploying.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
