#!/usr/bin/env tsx

/**
 * ModernMen Smoke Check Script
 * Validates critical application endpoints and functionality
 */

import { config } from 'dotenv';
import { validateEnvironmentVariables } from '../src/lib/env-validator';
import { logger } from '../src/lib/logger';

// Load environment variables
config();

interface CheckResult {
  url: string;
  status: number;
  success: boolean;
  error?: string;
  responseTime?: number;
}

/**
 * Check URL availability and response time
 */
async function checkUrl(url: string): Promise<CheckResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'ModernMen-SmokeCheck/1.0',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseTime = Date.now() - startTime;

    return {
      url,
      status: response.status,
      success: response.status >= 200 && response.status < 300,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      url,
      status: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      responseTime,
    };
  }
}

/**
 * Check API endpoint health
 */
async function checkApiHealth(baseUrl: string): Promise<CheckResult> {
  const healthUrl = `${baseUrl}/api/healthcheck`;
  return checkUrl(healthUrl);
}

/**
 * Run comprehensive smoke tests
 */
async function runSmokeTests(): Promise<void> {
  try {
    // Validate environment first
    const envValidation = validateEnvironmentVariables();
    if (!envValidation.isValid) {
      logger.error('Environment validation failed:', envValidation.errors);
      process.exit(1);
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    logger.info(`🚀 Running smoke tests against: ${baseUrl}`);
    logger.info('');

    // Critical pages to check
    const criticalPages = [
      '/',
      '/about',
      '/services',
      '/team',
      '/contact',
      '/book',
      '/blog',
      '/gallery',
      '/testimonials',
      '/faq',
    ];

    // API endpoints to check
    const apiEndpoints = [
      '/api/healthcheck',
      '/api/services',
      '/api/team',
      '/api/testimonials',
    ];

    const results: CheckResult[] = [];

    // Check critical pages
    logger.info('📄 Checking critical pages...');
    for (const path of criticalPages) {
      const url = `${baseUrl}${path}`;
      logger.info(`🔍 Checking: ${url}`);

      const result = await checkUrl(url);
      results.push(result);

      if (result.success) {
        logger.info(`  ✅ ${result.status} - OK (${result.responseTime}ms)`);
      } else {
        logger.error(`  ❌ ${result.status} - FAILED${result.error ? ` (${result.error})` : ''}`);
      }
    }

    logger.info('');

    // Check API endpoints
    logger.info('🔌 Checking API endpoints...');
    for (const path of apiEndpoints) {
      const url = `${baseUrl}${path}`;
      logger.info(`🔍 Checking: ${url}`);

      const result = await checkUrl(url);
      results.push(result);

      if (result.success) {
        logger.info(`  ✅ ${result.status} - OK (${result.responseTime}ms)`);
      } else {
        logger.error(`  ❌ ${result.status} - FAILED${result.error ? ` (${result.error})` : ''}`);
      }
    }

    logger.info('');

    // Check overall API health
    logger.info('🏥 Checking API health...');
    const healthResult = await checkApiHealth(baseUrl);
    results.push(healthResult);

    if (healthResult.success) {
      logger.info(`  ✅ API Health - OK (${healthResult.responseTime}ms)`);
    } else {
      logger.error(`  ❌ API Health - FAILED${healthResult.error ? ` (${healthResult.error})` : ''}`);
    }

    // Generate summary
    logger.info('');
    logger.info('📊 Results Summary:');
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    logger.info(`✅ Successful: ${successful.length}`);
    logger.info(`❌ Failed: ${failed.length}`);

    // Calculate average response time for successful requests
    const successfulWithTiming = successful.filter(r => r.responseTime !== undefined);
    if (successfulWithTiming.length > 0) {
      const avgResponseTime = successfulWithTiming.reduce((sum, r) => sum + (r.responseTime || 0), 0) / successfulWithTiming.length;
      logger.info(`⏱️  Average response time: ${Math.round(avgResponseTime)}ms`);
    }

    if (failed.length > 0) {
      logger.error('');
      logger.error('❌ Failed URLs:');
      failed.forEach(result => {
        logger.error(`  - ${result.url}: ${result.status}${result.error ? ` (${result.error})` : ''}`);
      });
      
      logger.error('');
      logger.error('💥 Smoke tests failed!');
      process.exit(1);
    } else {
      logger.info('');
      logger.info('🎉 All smoke tests passed!');
    }

  } catch (error) {
    logger.error('Smoke test runner failed:', error as Error);
    process.exit(1);
  }
}

// Run the smoke tests
if (require.main === module) {
  runSmokeTests().catch((error) => {
    logger.error('Unhandled error:', error as Error);
    process.exit(1);
  });
}

export { runSmokeTests };
