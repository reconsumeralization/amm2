# Enhanced Onboarding Steps Seeding Script

## Overview

The `seed-onboarding-steps.ts` script has been completely rewritten with comprehensive error handling, security measures, and enterprise-grade features. This document outlines all the improvements and how to use the enhanced script.

## 🚀 New Features

### Security Enhancements
- **Environment Validation**: Only runs in allowed environments (development, staging, production)
- **Permission-Based Access**: Requires admin or super-admin role to execute
- **Rate Limiting**: Maximum 10 executions per minute to prevent abuse
- **Input Sanitization**: Removes scripts, HTML tags, and dangerous content
- **Timeout Protection**: Maximum 5-minute execution time with automatic termination
- **Data Validation**: Strict Zod schemas prevent malformed data insertion

### Error Handling
- **Custom Error Classes**: Specific error types for different failure scenarios
- **Transaction Rollback**: Automatic cleanup on failures
- **Comprehensive Logging**: Detailed execution tracking with sensitive data redaction
- **Graceful Recovery**: Continues processing valid items even if some fail
- **Detailed Error Reporting**: Context-rich error messages for debugging

### Transaction Support
- **Atomic Operations**: All-or-nothing execution with rollback capabilities
- **Progress Tracking**: Real-time statistics and progress monitoring
- **Resource Cleanup**: Automatic cleanup of temporary resources
- **State Management**: Maintains execution state for recovery

### CLI Interface
- **Rich Command Line**: Multiple options for different use cases
- **Help System**: Built-in help with examples
- **Verbose Mode**: Detailed output for debugging
- **Log Export**: Save execution logs to files
- **Status Checking**: Query current seeding status

## 📋 Usage

### Programmatic Usage

```typescript
import { seedOnboardingSteps, checkSeedingStatus } from '@/scripts/seed-onboarding-steps';

// Basic usage
const result = await seedOnboardingSteps();

// With options
const result = await seedOnboardingSteps({
  dryRun: true,           // Preview changes without executing
  force: true,            // Update existing steps
  userRole: 'admin',      // User role for permission validation
  customSteps: [...],     // Use custom step data
  skipValidation: false,  // Skip input validation (not recommended)
  timeout: 300000,        // Custom timeout in milliseconds
});

// Check current status
const status = await checkSeedingStatus();
console.log(`Total steps: ${status.totalSteps}`);
```

### CLI Usage

```bash
# Basic execution
node src/scripts/seed-onboarding-steps.ts

# Dry run (preview changes)
node src/scripts/seed-onboarding-steps.ts --dry-run

# Force update existing steps
node src/scripts/seed-onboarding-steps.ts --force

# Verbose output with custom timeout
node src/scripts/seed-onboarding-steps.ts --verbose --timeout 600000

# Check current seeding status
node src/scripts/seed-onboarding-steps.ts --check-status

# Export logs after execution
node src/scripts/seed-onboarding-steps.ts --export-logs

# Get help
node src/scripts/seed-onboarding-steps.ts --help
```

### CLI Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--dry-run` | `-d` | Show what would be done without making changes | `false` |
| `--force` | `-f` | Force update existing steps | `false` |
| `--verbose` | `-v` | Enable verbose logging | `false` |
| `--user-role` | `-u` | User role for permission validation | `admin` |
| `--timeout` | `-t` | Timeout in milliseconds | `300000` |
| `--skip-validation` | `-s` | Skip input validation (not recommended) | `false` |
| `--export-logs` | `-e` | Export execution logs to file | `false` |
| `--check-status` | `-c` | Check current seeding status | `false` |
| `--help` | `-h` | Show help message | N/A |

## 🔒 Security Features

### Environment Protection
The script only runs in predefined environments:

```typescript
const ALLOWED_ENVIRONMENTS = ['development', 'staging', 'production'];
```

### Permission Validation
Requires specific user roles to execute:

```typescript
const REQUIRED_PERMISSIONS = ['admin', 'super-admin'];
```

### Rate Limiting
Prevents abuse with configurable rate limits:

```typescript
const RATE_LIMIT_MAX_REQUESTS = 10;  // per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
```

### Input Sanitization
Automatically removes dangerous content:

```typescript
// Removes scripts, HTML tags, and trims input
const sanitized = input
  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  .replace(/<[^>]*>/g, '')
  .trim();
```

### Timeout Protection
Prevents runaway processes:

```typescript
const MAX_EXECUTION_TIME = 5 * 60 * 1000; // 5 minutes
```

## 🛡️ Error Handling

### Error Types

```typescript
class SeedingError extends Error {
  // Base error class with code and details
}

class ValidationError extends SeedingError {
  // Data validation failures
}

class SecurityError extends SeedingError {
  // Security and permission failures
}

class DatabaseError extends SeedingError {
  // Database operation failures
}
```

### Error Recovery

The script implements comprehensive error recovery:

1. **Transaction Rollback**: Failed operations are rolled back automatically
2. **Partial Success**: Continues processing valid items when some fail
3. **Resource Cleanup**: Automatically cleans up temporary resources
4. **Detailed Logging**: All errors are logged with full context

### Error Reporting

```typescript
// Errors include execution context
const errorDetails = {
  name: error.name,
  message: error.message,
  code: error.code || 'UNKNOWN_ERROR',
  stack: error.stack,
  stats: executionStats,
  executionId: securityManager.getExecutionId(),
};
```

## 📊 Monitoring & Logging

### Execution Statistics

```typescript
interface SeedingStats {
  startTime: number;
  endTime?: number;
  totalSteps: number;
  createdSteps: number;
  skippedSteps: number;
  failedSteps: number;
  executionTime?: number;
}
```

### Secure Logging

```typescript
// Automatically redacts sensitive data
const sensitiveKeys = ['password', 'secret', 'token', 'key', 'auth'];

logger.log('info', 'Operation completed', {
  userId: '12345',      // Safe
  password: '[REDACTED]', // Redacted
  token: '[REDACTED]',   // Redacted
});
```

### Log Export

```bash
# Export logs to JSON file
node src/scripts/seed-onboarding-steps.ts --export-logs
# Creates: seeding-logs-[timestamp].json
```

## 🔧 Configuration

### Environment Variables

Required environment variables:

```env
# Required
PAYLOAD_SECRET=your-secret-key
DATABASE_URI=your-database-url
NODE_ENV=development|staging|production

# Optional
LOG_LEVEL=info|warn|error|debug
```

### Security Configuration

```typescript
const SECURITY_CONFIG = {
  MAX_EXECUTION_TIME: 5 * 60 * 1000,     // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,                 // Retry failed operations
  RATE_LIMIT_WINDOW: 60 * 1000,          // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 10,           // Max requests per window
  ALLOWED_ENVIRONMENTS: ['development', 'staging', 'production'],
  REQUIRED_PERMISSIONS: ['admin', 'super-admin'],
};
```

## 📈 Performance Features

### Execution Monitoring

- Real-time progress tracking
- Performance statistics
- Memory usage monitoring
- Execution time measurement

### Optimization Features

- Batch processing for large datasets
- Connection pooling
- Query optimization
- Resource cleanup

## 🧪 Testing

### Dry Run Mode

```bash
# Test execution without making changes
node src/scripts/seed-onboarding-steps.ts --dry-run --verbose
```

### Validation Testing

```typescript
// Test data validation
const result = await seedOnboardingSteps({
  customSteps: testData,
  skipValidation: false,  // Force validation
});
```

## 🚨 Troubleshooting

### Common Issues

#### Permission Denied
```bash
# Check user role
node src/scripts/seed-onboarding-steps.ts --user-role admin
```

#### Timeout Errors
```bash
# Increase timeout
node src/scripts/seed-onboarding-steps.ts --timeout 600000
```

#### Database Connection Issues
```bash
# Check environment variables
echo $DATABASE_URI
echo $PAYLOAD_SECRET
```

#### Rate Limiting
```bash
# Wait before retrying (rate limit: 10 per minute)
sleep 60
node src/scripts/seed-onboarding-steps.ts
```

### Debug Mode

```bash
# Enable verbose logging
node src/scripts/seed-onboarding-steps.ts --verbose --export-logs
```

## 📝 API Reference

### Main Functions

#### `seedOnboardingSteps(options?)`
Executes the seeding process with optional configuration.

**Parameters:**
- `options.dryRun`: Boolean - Preview changes without executing
- `options.force`: Boolean - Update existing steps
- `options.userRole`: String - User role for permissions
- `options.customSteps`: Array - Custom step data
- `options.skipValidation`: Boolean - Skip validation (not recommended)
- `options.timeout`: Number - Timeout in milliseconds

**Returns:**
```typescript
{
  success: boolean;
  stats: SeedingStats;
  logs: any[];
  error?: string;
}
```

#### `checkSeedingStatus()`
Retrieves current seeding status.

**Returns:**
```typescript
{
  totalSteps: number;
  activeSteps: number;
  stepsByUserType: Record<string, number>;
}
```

#### `exportSeedingLogs()`
Exports current execution logs as JSON string.

**Returns:** JSON string of execution logs

## 🔄 Migration Guide

### From Version 1.0

```typescript
// Old usage
await seedOnboardingSteps();

// New usage with error handling
const result = await seedOnboardingSteps();
if (!result.success) {
  console.error('Seeding failed:', result.error);
  // Handle error appropriately
}
```

### Backward Compatibility

The script maintains backward compatibility through:

```typescript
// Legacy function for existing code
export async function seedOnboardingStepsLegacy(): Promise<void> {
  const result = await seedOnboardingSteps();
  if (!result.success) {
    throw new Error(result.error || 'Seeding failed');
  }
}
```

## 🎯 Best Practices

### Security
1. Always use `--dry-run` first in production
2. Never skip validation in production environments
3. Regularly rotate environment secrets
4. Monitor execution logs for anomalies
5. Use specific user roles with minimal permissions

### Performance
1. Use appropriate timeouts for your environment
2. Monitor execution statistics
3. Export logs for auditing
4. Schedule executions during low-traffic periods

### Error Handling
1. Always check the return value's `success` property
2. Log errors with full context for debugging
3. Implement retry logic for transient failures
4. Use the detailed error messages for troubleshooting

## 📞 Support

For issues or questions:

1. Check the execution logs: `--export-logs`
2. Use verbose mode: `--verbose`
3. Review error codes in the logs
4. Check environment configuration
5. Verify database connectivity

## 🔄 Version History

- **v2.0.0**: Complete rewrite with security, error handling, and transactions
- **v1.0.0**: Basic seeding functionality

---

**Note**: This enhanced script provides enterprise-grade reliability and security for critical data seeding operations. Always test thoroughly in development before deploying to production.
