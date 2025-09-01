#!/usr/bin/env node

/**
 * Build Performance Monitor
 * Tracks and analyzes Next.js build performance
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildPerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: null,
      endTime: null,
      duration: null,
      peakMemory: 0,
      warnings: [],
      errors: [],
      bundleSizes: {},
    };
  }

  start() {
    console.log('📊 Starting build performance monitoring...\n');
    this.metrics.startTime = Date.now();
    return this;
  }

  async runBuild() {
    try {
      console.log('🏗️ Running build with performance monitoring...\n');

      // Clean previous build
      if (fs.existsSync('.next')) {
        execSync('rm -rf .next', { stdio: 'pipe' });
      }

      // Run build with memory monitoring
      const buildCommand = 'NODE_OPTIONS="--max-old-space-size=4096 --trace-gc" npm run build';
      const result = execSync(buildCommand, {
        stdio: 'pipe',
        encoding: 'utf-8',
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        timeout: 600000 // 10 minutes timeout
      });

      this.metrics.endTime = Date.now();
      this.metrics.duration = this.metrics.endTime - this.metrics.startTime;

      // Analyze output
      this.analyzeBuildOutput(result);

      return result;
    } catch (error) {
      this.metrics.endTime = Date.now();
      this.metrics.duration = this.metrics.endTime - this.metrics.startTime;
      this.metrics.errors.push(error.message);
      throw error;
    }
  }

  analyzeBuildOutput(output) {
    // Extract warnings
    const warningLines = output.split('\n').filter(line =>
      line.includes('⚠') || line.includes('Warning') || line.includes('WARN')
    );
    this.metrics.warnings = warningLines;

    // Extract bundle information
    const bundleMatches = output.match(/([\d.]+)\s*KB/g);
    if (bundleMatches) {
      this.metrics.bundleSizes = {
        total: bundleMatches[bundleMatches.length - 1],
        chunks: bundleMatches.slice(0, -1),
      };
    }

    // Check for large files
    const largeFileMatches = output.match(/(\d+)\s*KB\s*[^}]+/g);
    if (largeFileMatches) {
      this.metrics.largeFiles = largeFileMatches.filter(match =>
        parseInt(match) > 500 // Files larger than 500KB
      );
    }
  }

  generateReport() {
    const duration = (this.metrics.duration / 1000).toFixed(2);
    const durationMinutes = (this.metrics.duration / 60000).toFixed(2);

    console.log('📈 Build Performance Report');
    console.log('='.repeat(50));
    console.log(`⏱️  Total Duration: ${duration}s (${durationMinutes}min)`);
    console.log(`📦 Bundle Size: ${this.metrics.bundleSizes.total || 'N/A'}`);
    console.log(`⚠️  Warnings: ${this.metrics.warnings.length}`);
    console.log(`❌ Errors: ${this.metrics.errors.length}`);

    if (this.metrics.largeFiles && this.metrics.largeFiles.length > 0) {
      console.log('\n📁 Large Files (>500KB):');
      this.metrics.largeFiles.forEach(file => console.log(`  • ${file}`));
    }

    if (this.metrics.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.metrics.warnings.slice(0, 5).forEach(warning =>
        console.log(`  • ${warning.substring(0, 80)}${warning.length > 80 ? '...' : ''}`)
      );
      if (this.metrics.warnings.length > 5) {
        console.log(`  ... and ${this.metrics.warnings.length - 5} more`);
      }
    }

    // Performance assessment
    console.log('\n🎯 Performance Assessment:');
    if (this.metrics.duration < 120000) { // Less than 2 minutes
      console.log('  ✅ Excellent: Build completed quickly');
    } else if (this.metrics.duration < 300000) { // Less than 5 minutes
      console.log('  ⚠️  Good: Build took moderate time');
    } else {
      console.log('  ❌ Slow: Consider optimization');
    }

    if (this.metrics.warnings.length === 0) {
      console.log('  ✅ Clean: No build warnings');
    } else {
      console.log(`  ⚠️  Has warnings: ${this.metrics.warnings.length} issues`);
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (this.metrics.duration > 300000) {
      console.log('  • Consider code splitting for large components');
      console.log('  • Review and optimize dependencies');
      console.log('  • Implement lazy loading for heavy components');
    }

    if (this.metrics.largeFiles && this.metrics.largeFiles.length > 3) {
      console.log('  • Consider breaking down large files');
      console.log('  • Implement dynamic imports');
    }

    if (this.metrics.warnings.length > 10) {
      console.log('  • Address build warnings for better performance');
    }

    console.log('\n' + '='.repeat(50));
  }

  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      ...this.metrics,
    };

    const reportPath = path.join(process.cwd(), 'build-performance-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${reportPath}`);
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new BuildPerformanceMonitor();

  monitor.start()
    .runBuild()
    .then(() => {
      monitor.generateReport();
      monitor.saveReport();
      console.log('\n✅ Build performance monitoring complete!');
      process.exit(0);
    })
    .catch((error) => {
      monitor.generateReport();
      monitor.saveReport();
      console.log('\n❌ Build failed!');
      console.log('Error:', error.message);
      process.exit(1);
    });
}

module.exports = BuildPerformanceMonitor;
