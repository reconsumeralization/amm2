// Quick build test script
const { execSync } = require('child_process');

console.log('🧪 Testing Next.js build locally...\n');

try {
  // Clean any previous build
  console.log('🧹 Cleaning previous build...');
  execSync('rm -rf .next out', { stdio: 'inherit' });

  // Run the build
  console.log('🏗️ Running build...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('✅ Build successful! Ready for deployment.');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  console.log('\n🔧 Common fixes:');
  console.log('1. Check for syntax errors in components');
  console.log('2. Verify environment variables');
  console.log('3. Clear node_modules and reinstall');
  console.log('4. Check Next.js configuration');

  process.exit(1);
}
