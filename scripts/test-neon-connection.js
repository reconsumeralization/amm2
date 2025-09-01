#!/usr/bin/env node

/**
 * Neon Database Connection Test Script
 * Tests the connection to Neon PostgreSQL database
 */

const { Client } = require('pg');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(` ${message}`, 'bright');
  log(`${'='.repeat(60)}\n`, 'blue');
}

function logStep(step, message) {
  log(`[${step}] ${message}`, 'yellow');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

async function testDatabaseConnection() {
  logHeader('NEON DATABASE CONNECTION TEST');

  // Check if DATABASE_URL is configured
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    logError('DATABASE_URL environment variable is not set');
    log('Please configure your .env.local file with Neon database credentials', 'yellow');
    process.exit(1);
  }

  // Check database provider
  const isNeonDatabase = databaseUrl.includes('neon.tech');
  const isSupabaseDatabase = databaseUrl.includes('supabase.co');

  if (isNeonDatabase) {
    logStep('1', 'Detected Neon database URL');
    log(`   Database: ${databaseUrl.split('@')[1]?.split('/')[0] || 'Unknown'}`, 'blue');
  } else if (isSupabaseDatabase) {
    logStep('1', 'Detected Supabase database URL');
    log(`   Database: ${databaseUrl.split('@')[1]?.split('/')[0] || 'Unknown'}`, 'blue');
  } else {
    logStep('1', 'Detected generic PostgreSQL database');
  }

  logStep('2', 'Testing database connection...');

  const client = new Client({
    connectionString: databaseUrl,
    // SSL configuration for different providers
    ssl: (isNeonDatabase || isSupabaseDatabase) ? { rejectUnauthorized: false } : false,
    // Connection timeout
    connectionTimeoutMillis: 5000,
  });

  try {
    log('   Connecting to database...', 'yellow');
    await client.connect();

    logSuccess('Database connection established successfully!');

    // Test basic query
    logStep('3', 'Testing basic database query...');
    const result = await client.query('SELECT version()');
    const version = result.rows[0].version;

    logSuccess('Database query executed successfully');
    log(`   PostgreSQL Version: ${version.split(' ')[1]}`, 'blue');

    // Test if we can create a simple table (optional test)
    logStep('4', 'Testing database write permissions...');

    try {
      // Create a test table
      await client.query(`
        CREATE TEMP TABLE neon_test (
          id SERIAL PRIMARY KEY,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
      `);

      // Insert test data
      await client.query(`
        INSERT INTO neon_test (message) VALUES ($1)
      `, ['Neon integration test successful!']);

      // Query the data
      const testResult = await client.query('SELECT * FROM neon_test');
      const testMessage = testResult.rows[0].message;

      logSuccess('Database write operations working correctly');
      log(`   Test message: "${testMessage}"`, 'blue');

      // Clean up test table
      await client.query('DROP TABLE neon_test');

    } catch (writeError) {
      logError(`Database write test failed: ${writeError.message}`);
      log('This might be due to insufficient permissions or existing table conflicts', 'yellow');
    }

    logStep('5', 'Connection test completed');

  } catch (error) {
    logError(`Database connection failed: ${error.message}`);

    // Provide troubleshooting advice
    log('\n🔧 Troubleshooting Tips:', 'bright');
    log('1. Verify your DATABASE_URL is correct', 'yellow');
    log('2. Check your database password', 'yellow');
    log('3. Ensure your Neon database is not paused', 'yellow');
    log('4. Verify SSL mode is set to "require" for Neon', 'yellow');
    log('5. Check if your IP is whitelisted in Neon dashboard', 'yellow');

    process.exit(1);

  } finally {
    await client.end();
    log('\n📊 Connection test finished', 'blue');
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logError(`Unhandled promise rejection: ${error}`);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logError(`Uncaught exception: ${error}`);
  process.exit(1);
});

// Run the test
if (require.main === module) {
  testDatabaseConnection().catch((error) => {
    logError(`Test execution failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { testDatabaseConnection };
