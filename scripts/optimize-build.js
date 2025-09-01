#!/usr/bin/env node

/**
 * Build Optimization Script
 * Helps optimize Next.js builds for Vercel deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build optimization...\n');

// Function to run commands with error handling
function runCommand(command, description) {
  try {
    console.log(`📦 ${description}...`);
    const result = execSync(command, {
      stdio: 'pipe',
      encoding: 'utf-8',
      timeout: 300000 // 5 minutes timeout
    });
    console.log(`✅ ${description} completed\n`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return null;
  }
}

// Clean previous builds
runCommand('rm -rf .next out node_modules/.cache', 'Cleaning previous builds');

// Analyze bundle size before optimization
console.log('📊 Analyzing bundle size...\n');
runCommand('npx @next/bundle-analyzer', 'Bundle analysis');

// Run build with timing
console.log('🏗️ Running optimized build...\n');
const buildStart = Date.now();

const buildResult = runCommand(
  'NODE_OPTIONS="--max-old-space-size=4096" npm run build',
  'Building application'
);

const buildEnd = Date.now();
const buildTime = ((buildEnd - buildStart) / 1000).toFixed(2);

if (buildResult) {
  console.log(`🎉 Build completed successfully in ${buildTime}s!\n`);

  // Check bundle sizes
  console.log('📦 Bundle size analysis:');
  try {
    const stats = fs.readFileSync('.next/build-manifest.json', 'utf8');
    const manifest = JSON.parse(stats);

    if (manifest.pages && manifest.pages['/']) {
      const mainBundle = manifest.pages['/'];
      console.log(`  📄 Main bundle: ${mainBundle.length} files`);
    }

    // Check if .next directory exists and get its size
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      const getDirSize = (dirPath) => {
        let totalSize = 0;
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            totalSize += getDirSize(filePath);
          } else {
            totalSize += stat.size;
          }
        }

        return totalSize;
      };

      const buildSize = (getDirSize(nextDir) / 1024 / 1024).toFixed(2);
      console.log(`  💾 Build size: ${buildSize} MB`);
    }

  } catch (error) {
    console.log('  ℹ️ Bundle analysis not available');
  }

  console.log('\n🎯 Optimization recommendations:');
  console.log('  • Build completed successfully');
  console.log('  • Check bundle size for optimization opportunities');
  console.log('  • Consider code splitting for large components');
  console.log('  • Review unused dependencies');

} else {
  console.log(`❌ Build failed after ${buildTime}s\n`);

  console.log('🔧 Troubleshooting steps:');
  console.log('  1. Check for TypeScript errors: npm run type-check');
  console.log('  2. Verify dependencies: npm ls --depth=0');
  console.log('  3. Clear cache: rm -rf .next node_modules/.cache');
  console.log('  4. Check Next.js config: next.config.js');
  console.log('  5. Review recent changes for breaking changes');
}

console.log('\n✨ Build optimization complete!\n');

// Exit with appropriate code
process.exit(buildResult ? 0 : 1);
