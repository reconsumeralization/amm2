#!/usr/bin/env node

/**
 * Quick Vercel Setup Script
 * Uses npx to run Vercel commands without global installation
 */

const { execSync } = require('child_process');

function runVercelCommand(command, description) {
  console.log(`🔧 ${description}...`);
  try {
    const result = execSync(`npx vercel ${command}`, {
      encoding: 'utf8',
      stdio: 'inherit'
    });
    console.log(`✅ ${description} - Success`);
    return result;
  } catch (error) {
    console.log(`❌ ${description} - Failed`);
    console.log(`   Error: ${error.message}`);
    return null;
  }
}

function main() {
  console.log('🚀 Quick Vercel Setup for Modern Men Hair BarberShop');
  console.log('===================================================');

  console.log('\n📋 Setup Steps:');
  console.log('1. Login to Vercel');
  console.log('2. Link project');
  console.log('3. Add environment variables');
  console.log('4. Test build');
  console.log('5. Deploy');
  console.log('');

  // Step 1: Login (interactive)
  console.log('🔐 Step 1: Vercel Login');
  console.log('=======================');
  console.log('Run this command manually: npx vercel login');
  console.log('Then follow the browser instructions to authenticate.');
  console.log('');
  console.log('After login completes, press Enter to continue...');

  // Wait for user input
  process.stdin.once('data', () => {
    // Step 2: Link project
    console.log('\n🔗 Step 2: Link Project');
    console.log('======================');
    runVercelCommand('link --yes', 'Linking Vercel project');

    // Step 3: Add environment variables
    console.log('\n🔐 Step 3: Environment Variables');
    console.log('================================');

    const envVars = [
      ['DATABASE_URL', 'postgres://postgres.vbokacytrvsgjahlyppf:bvlQaPZdmhRaKLr7@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x'],
      ['DATABASE_URL_UNPOOLED', 'postgres://postgres.vbokacytrvsgjahlyppf:bvlQaPZdmhRaKLr7@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require'],
      ['PAYLOAD_SECRET', 'your-super-secure-payload-secret-here-32-chars-minimum'],
      ['PAYLOAD_PUBLIC_SERVER_URL', 'https://modernmen-yolo.vercel.app'],
      ['NEXT_PUBLIC_APP_URL', 'https://modernmen-yolo.vercel.app'],
      ['NEXTAUTH_URL', 'https://modernmen-yolo.vercel.app'],
      ['NODE_ENV', 'production'],
      ['NEXT_PUBLIC_SUPABASE_URL', 'https://vbokacytrvsgjahlyppf.supabase.co'],
      ['SUPABASE_URL', 'https://vbokacytrvsgjahlyppf.supabase.co'],
      ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2thY3l0cnZzZ2phaGx5cHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0OTQyOTgsImV4cCI6MjA0OTA3MDI5OH0.0r6qM68hg5my1ynwVpaWWJr6-hv_jV3jBUESrfy6jIc'],
      ['SUPABASE_SERVICE_ROLE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZib2thY3l0cnZzZ2phaGx5cHBmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMzQ5NDI5OCwiZXhwIjoyMDQ5MDcwMjk4fQ.De-7PM0LquziRyT9Y1UAp46T8zhf8v86HkmrR7LOZ7s'],
      ['NEXTAUTH_SECRET', 'your-nextauth-secret-key-here-32-chars-minimum'],
      ['JWT_SECRET', 'your-secure-jwt-secret-here-32-chars-minimum']
    ];

    envVars.forEach(([key, value]) => {
      console.log(`Setting ${key}...`);
      try {
        execSync(`echo "${value.replace(/"/g, '\\"')}" | npx vercel env add ${key} production`, {
          stdio: 'inherit'
        });
        console.log(`✅ Set ${key}`);
      } catch (error) {
        console.log(`❌ Failed to set ${key}: ${error.message}`);
      }
    });

    // Step 4: Test build
    console.log('\n🔨 Step 4: Test Build');
    console.log('===================');
    const buildResult = execSync('npm run build', { encoding: 'utf8' });
    if (buildResult) {
      console.log('✅ Build test passed');
    }

    // Step 5: Deploy
    console.log('\n🚀 Step 5: Deploy to Production');
    console.log('==============================');
    runVercelCommand('--prod', 'Deploying to production');

    // Final status
    console.log('\n🎉 Setup Complete!');
    console.log('==================');
    console.log('Your app should now be live at: https://modernmen-yolo.vercel.app');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Check your deployment at the URL above');
    console.log('2. Test the Payload CMS admin at: https://modernmen-yolo.vercel.app/admin');
    console.log('3. Verify database connections are working');
    console.log('');
    console.log('🔗 Useful commands:');
    console.log('- npx vercel ls              # List deployments');
    console.log('- npx vercel logs           # View logs');
    console.log('- npx vercel env ls         # List environment variables');

    process.exit(0);
  });
}

if (require.main === module) {
  main();
}
