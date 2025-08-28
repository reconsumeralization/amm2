#!/usr/bin/env node

/**
 * ModernMen Production Deployment Check
 * Validates the entire system before deployment
 */

import { validateEnvironmentVariables, generateEnvTemplate } from '../src/lib/env-validator';
import { validateSettings } from '../src/lib/settings-initializer';
import { getEnvironmentConfig } from '../src/lib/env-validator';

interface DeploymentCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  checks: {
    environment: boolean;
    database: boolean;
    settings: boolean;
    apis: boolean;
    integrations: boolean;
  };
}

/**
 * Run comprehensive deployment checks
 */
async function runDeploymentChecks(): Promise<DeploymentCheckResult> {
  const result: DeploymentCheckResult = {
    isValid: true,
    errors: [],
    warnings: [],
    checks: {
      environment: false,
      database: false,
      settings: false,
      apis: false,
      integrations: false,
    },
  };

  console.log('🚀 ModernMen Production Deployment Check\n');

  // 1. Environment Variables Check
  console.log('1. Checking Environment Variables...');
  const envValidation = validateEnvironmentVariables();
  if (envValidation.isValid) {
    console.log('   ✅ Environment variables are valid');
    result.checks.environment = true;
  } else {
    console.log('   ❌ Environment validation failed:');
    envValidation.errors.forEach(error => {
      console.log(`      - ${error}`);
      result.errors.push(error);
    });
    result.isValid = false;
  }

  envValidation.warnings.forEach(warning => {
    console.log(`   ⚠️  ${warning}`);
    result.warnings.push(warning);
  });

  // 2. Database Connection Check
  console.log('\n2. Checking Database Connection...');
  if (process.env.DATABASE_URI) {
    try {
      const { MongoClient } = await import('mongodb');
      const client = new MongoClient(process.env.DATABASE_URI!); 
      await client.connect();
      await client.db().admin().ping();
      await client.close();
      console.log('   ✅ Database connection successful');
      result.checks.database = true;
    } catch (error) {
      console.log('   ❌ Database connection failed:', error);
      result.errors.push(`Database connection failed: ${error}`);
      result.isValid = false;
    }
  } else {
    console.log('   ⚠️  DATABASE_URI not set, skipping database connection check.');
    result.warnings.push('DATABASE_URI not set, skipping database connection check.');
    result.checks.database = true; // Not a failure for the purpose of this check
  }

  // 3. Settings Validation Check
  console.log('\n3. Checking Settings Configuration...');
  try {
    const { getPayload } = await import('payload');
    const config = await import('../src/payload.config');
    const payload = await getPayload({ config: config.default });
    
    const settings = await payload.find({
      collection: 'settings',
      limit: 1,
    });

    if (settings.docs.length > 0) {
      const validation = validateSettings(settings.docs[0]);
      if (validation.isValid) {
        console.log('   ✅ Settings configuration is valid');
        result.checks.settings = true;
      } else {
        console.log('   ❌ Settings validation failed:');
        validation.errors.forEach(error => {
          console.log(`      - ${error}`);
          result.errors.push(error);
        });
        result.isValid = false;
      }
    } else {
      console.log('   ⚠️  No settings found - will use defaults');
      result.warnings.push('No settings found - will use defaults');
      result.checks.settings = true;
    }
  } catch (error) {
    console.log('   ❌ Settings check failed:', error);
    result.errors.push(`Settings check failed: ${error}`);
    result.isValid = false;
  }

  // 4. API Endpoints Check
  console.log('\n4. Checking API Endpoints...');
  const apiChecks = await checkAPIEndpoints();
  if (apiChecks.isValid) {
    console.log('   ✅ API endpoints are accessible');
    result.checks.apis = true;
  } else {
    console.log('   ❌ API endpoints check failed:');
    apiChecks.errors.forEach(error => {
      console.log(`      - ${error}`);
      result.errors.push(error);
    });
    result.isValid = false;
  }

  // 5. External Integrations Check
  console.log('\n5. Checking External Integrations...');
  const integrationChecks = await checkExternalIntegrations();
  if (integrationChecks.isValid) {
    console.log('   ✅ External integrations are configured');
    result.checks.integrations = true;
  } else {
    console.log('   ⚠️  Some integrations are not configured:');
    integrationChecks.warnings.forEach(warning => {
      console.log(`      - ${warning}`);
      result.warnings.push(warning);
    });
    result.checks.integrations = true; // Not critical for deployment
  }

  // 6. Build Check
  console.log('\n6. Checking Build Process...');
  try {
    const { execSync } = await import('child_process');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('   ✅ Build process successful');
  } catch (error) {
    console.log('   ❌ Build process failed:', error);
    result.errors.push(`Build process failed: ${error}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Check API endpoints accessibility
 */
async function checkAPIEndpoints(): Promise<{ isValid: boolean; errors: string[] }> {
  const errors: string[] = [];
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const endpoints = [
    '/api/settings',
    '/api/admin/stats',
    '/api/features/loyalty',
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      if (response.status >= 500) {
        errors.push(`${endpoint} returned ${response.status}`);
      }
    } catch (error) {
      errors.push(`${endpoint} is not accessible: ${error}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check external integrations
 */
async function checkExternalIntegrations(): Promise<{ isValid: boolean; warnings: string[] }> {
  const warnings: string[] = [];
  const config = getEnvironmentConfig();

  if (!config.stripe.isTestMode && !config.stripe.isLiveMode) {
    warnings.push('Stripe is not configured');
  }

  if (!config.openai.isConfigured) {
    warnings.push('OpenAI is not configured');
  }

  if (!config.email.isConfigured) {
    warnings.push('Email service is not configured');
  }

  if (!config.google.isConfigured) {
    warnings.push('Google Calendar is not configured');
  }

  if (!config.bunny.isConfigured) {
    warnings.push('Bunny CDN is not configured');
  }

  return {
    isValid: true, // Not critical for deployment
    warnings,
  };
}

/**
 * Generate deployment report
 */
function generateDeploymentReport(result: DeploymentCheckResult): string {
  let report = '# ModernMen Deployment Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;

  report += `## Overall Status: ${result.isValid ? '✅ READY' : '❌ NOT READY'}\n\n`;

  report += '## Checks Summary\n';
  report += `- Environment Variables: ${result.checks.environment ? '✅' : '❌'}\n`;
  report += `- Database Connection: ${result.checks.database ? '✅' : '❌'}\n`;
  report += `- Settings Configuration: ${result.checks.settings ? '✅' : '❌'}\n`;
  report += `- API Endpoints: ${result.checks.apis ? '✅' : '❌'}\n`;
  report += `- External Integrations: ${result.checks.integrations ? '✅' : '❌'}\n\n`;

  if (result.errors.length > 0) {
    report += '## Errors (Must Fix)\n';
    result.errors.forEach(error => {
      report += `- ${error}\n`;
    });
    report += '\n';
  }

  if (result.warnings.length > 0) {
    report += '## Warnings (Recommended to Fix)\n';
    result.warnings.forEach(warning => {
      report += `- ${warning}\n`;
    });
    report += '\n';
  }

  report += '## Next Steps\n';
  if (result.isValid) {
    report += '✅ Your application is ready for deployment!\n';
    report += '1. Deploy to your hosting platform\n';
    report += '2. Monitor the application logs\n';
    report += '3. Test all features in production\n';
  } else {
    report += '❌ Please fix the errors above before deploying.\n';
    report += '1. Review and fix all errors\n';
    report += '2. Run this check again\n';
    report += '3. Deploy only when all checks pass\n';
  }

  return report;
}

/**
 * Main execution
 */
async function main() {
  try {
    const result = await runDeploymentChecks();

    console.log('\n' + '='.repeat(50));
    console.log('DEPLOYMENT CHECK COMPLETE');
    console.log('='.repeat(50));

    if (result.isValid) {
      console.log('✅ Your application is ready for deployment!');
    } else {
      console.log('❌ Deployment check failed. Please fix the errors above.');
      process.exit(1);
    }

    // Generate report
    const report = generateDeploymentReport(result);
    const fs = await import('fs');
    fs.writeFileSync('deployment-report.md', report);
    console.log('\n📄 Deployment report saved to: deployment-report.md');

    // Show environment template if needed
    if (!result.checks.environment) {
      console.log('\n📝 Environment template:');
      console.log(generateEnvTemplate());
    }

  } catch (error) {
    console.error('❌ Deployment check failed:', error);
    process.exit(1);
  }
}

// Run if called directly
main();

export { runDeploymentChecks, generateDeploymentReport };
