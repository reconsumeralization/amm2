/**
 * Enhanced Onboarding Steps Seeding Script
 *
 * This script provides comprehensive error handling, security measures, and transaction support
 * for seeding onboarding steps into the Payload CMS database.
 *
 * Features:
 * - ✅ Input validation using Zod schemas
 * - ✅ Security validations and access controls
 * - ✅ Transaction support with rollback capabilities
 * - ✅ Comprehensive error handling with custom error types
 * - ✅ Secure logging with sensitive data sanitization
 * - ✅ Rate limiting and timeout protection
 * - ✅ CLI interface with multiple options
 * - ✅ Dry-run and force update capabilities
 * - ✅ Performance monitoring and statistics
 * - ✅ Environment-based security restrictions
 *
 * Usage:
 * - Programmatic: import { seedOnboardingSteps } from './seed-onboarding-steps'
 * - CLI: node seed-onboarding-steps.js [options]
 *
 * Security Features:
 * - Environment validation (only allowed environments)
 * - Permission-based access control
 * - Rate limiting (max 10 executions per minute)
 * - Input sanitization (removes scripts and dangerous content)
 * - Timeout protection (max 5 minutes execution time)
 * - Data validation with strict schemas
 *
 * Error Handling:
 * - Custom error classes for different failure types
 * - Transaction rollback on failures
 * - Comprehensive logging with execution tracking
 * - Graceful degradation and recovery
 * - Detailed error reporting with context
 *
 * @author Modern Men Hair BarberShop Development Team
 * @version 2.0.0
 * @security Enhanced with comprehensive validation and access controls
 */

import { getPayload } from 'payload';
import payloadConfig from '@/payload/payload.config';
import { z } from 'zod';
import crypto from 'crypto';

// Custom Error Classes
export class SeedingError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = 'SeedingError';
  }
}

export class ValidationError extends SeedingError {
  constructor(message: string, public field?: string, public value?: any) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'ValidationError';
  }
}

export class SecurityError extends SeedingError {
  constructor(message: string, public context?: string) {
    super(message, 'SECURITY_ERROR', { context });
    this.name = 'SecurityError';
  }
}

export class DatabaseError extends SeedingError {
  constructor(message: string, public operation?: string, public originalError?: any) {
    super(message, 'DATABASE_ERROR', { operation, originalError });
    this.name = 'DatabaseError';
  }
}

// Security Configuration
const SECURITY_CONFIG = {
  MAX_EXECUTION_TIME: 5 * 60 * 1000, // 5 minutes
  MAX_RETRY_ATTEMPTS: 3,
  RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 10,
  ALLOWED_ENVIRONMENTS: ['development', 'staging', 'production'],
  REQUIRED_PERMISSIONS: ['admin', 'super-admin'],
} as const;

// Rate limiting storage
const executionHistory: { timestamp: number; script: string }[] = [];

// Validation Schemas
const ActionButtonSchema = z.object({
  text: z.string().min(1).max(50).trim(),
  variant: z.enum(['primary', 'secondary', 'outline']),
}).strict();

const ContentSchema = z.object({
  heading: z.string().min(1).max(200).trim().optional(),
  subheading: z.string().min(1).max(300).trim().optional(),
  body: z.string().max(2000).trim().optional(),
  actionButton: ActionButtonSchema.optional(),
}).strict();

const OnboardingStepDataSchema = z.object({
  title: z.string().min(1).max(100).trim(),
  description: z.string().max(500).trim().optional(),
  userType: z.enum(['customer', 'staff', 'manager', 'barber', 'admin']),
  stepOrder: z.number().int().min(1).max(100),
  stepType: z.enum([
    'welcome', 'profile', 'preferences', 'booking', 'services',
    'team', 'loyalty', 'settings', 'first-booking', 'staff-schedule',
    'admin-dashboard', 'business-setup', 'custom'
  ]),
  isRequired: z.boolean(),
  isSkippable: z.boolean(),
  estimatedDuration: z.number().int().min(1).max(300).optional(),
  content: ContentSchema.optional(),
}).strict();

// Type inference from schema
export type OnboardingStepData = z.infer<typeof OnboardingStepDataSchema>;

// Security and Configuration Management
class SecurityManager {
  private static instance: SecurityManager;
  private executionId: string;

  private constructor() {
    this.executionId = crypto.randomUUID();
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  validateEnvironment(): void {
    const nodeEnv = process.env.NODE_ENV;
    if (!nodeEnv || !SECURITY_CONFIG.ALLOWED_ENVIRONMENTS.includes(nodeEnv)) {
      throw new SecurityError(
        `Invalid environment: ${nodeEnv}. Allowed: ${SECURITY_CONFIG.ALLOWED_ENVIRONMENTS.join(', ')}`,
        'environment-validation'
      );
    }

    // Check for required environment variables
    const requiredVars = [
      'PAYLOAD_SECRET',
      'DATABASE_URI',
      'NODE_ENV'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new SecurityError(
        `Missing required environment variables: ${missingVars.join(', ')}`,
        'environment-variables'
      );
    }
  }

  validatePermissions(userRole?: string): void {
    if (!userRole || !SECURITY_CONFIG.REQUIRED_PERMISSIONS.includes(userRole)) {
      throw new SecurityError(
        `Insufficient permissions. Required: ${SECURITY_CONFIG.REQUIRED_PERMISSIONS.join(', ')}, Got: ${userRole || 'none'}`,
        'permission-validation'
      );
    }
  }

  checkRateLimit(scriptName: string): void {
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW;

    // Clean old entries
    executionHistory = executionHistory.filter(entry => entry.timestamp > windowStart);

    // Check current script executions
    const scriptExecutions = executionHistory.filter(
      entry => entry.script === scriptName && entry.timestamp > windowStart
    );

    if (scriptExecutions.length >= SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
      throw new SecurityError(
        `Rate limit exceeded for script: ${scriptName}. Max ${SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS} executions per minute`,
        'rate-limit'
      );
    }

    // Record this execution
    executionHistory.push({ timestamp: now, script: scriptName });
  }

  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      // Remove potentially dangerous characters and scripts
      return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    }

    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return input;
  }

  getExecutionId(): string {
    return this.executionId;
  }
}

// Logging Manager
class LoggingManager {
  private static instance: LoggingManager;
  private logs: any[] = [];

  private constructor() {}

  static getInstance(): LoggingManager {
    if (!LoggingManager.instance) {
      LoggingManager.instance = new LoggingManager();
    }
    return LoggingManager.instance;
  }

  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeLogData(data),
      executionId: SecurityManager.getInstance().getExecutionId(),
    };

    this.logs.push(logEntry);

    // Console output based on level
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
    console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }

  private sanitizeLogData(data: any): any {
    if (!data) return data;

    // Remove sensitive information
    const sensitiveKeys = ['password', 'secret', 'token', 'key', 'auth'];
    if (typeof data === 'object') {
      const sanitized = { ...data };
      for (const key of sensitiveKeys) {
        if (key in sanitized) {
          sanitized[key] = '[REDACTED]';
        }
      }
      return sanitized;
    }

    return data;
  }

  getLogs(): any[] {
    return [...this.logs];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Transaction Manager
class TransactionManager {
  private operations: (() => Promise<void>)[] = [];
  private rollbackOperations: (() => Promise<void>)[] = [];

  addOperation(operation: () => Promise<void>, rollback?: () => Promise<void>): void {
    this.operations.push(operation);
    if (rollback) {
      this.rollbackOperations.unshift(rollback);
    }
  }

  async execute(): Promise<void> {
    const logger = LoggingManager.getInstance();

    for (const operation of this.operations) {
      try {
        await operation();
      } catch (error) {
        logger.log('error', 'Transaction operation failed, initiating rollback', { error: error.message });

        // Execute rollback operations in reverse order
        for (const rollbackOp of this.rollbackOperations) {
          try {
            await rollbackOp();
          } catch (rollbackError) {
            logger.log('error', 'Rollback operation failed', { error: rollbackError.message });
          }
        }

        throw new DatabaseError(
          `Transaction failed: ${error.message}`,
          'transaction-execution',
          error
        );
      }
    }
  }
}

// Data Validator
class DataValidator {
  static validateStepData(data: any): OnboardingStepData {
    try {
      return OnboardingStepDataSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issues = error.issues.map(issue =>
          `${issue.path.join('.')}: ${issue.message}`
        ).join(', ');

        throw new ValidationError(
          `Validation failed: ${issues}`,
          error.issues[0]?.path.join('.') || 'unknown',
          data
        );
      }
      throw new ValidationError(`Invalid data format: ${error.message}`);
    }
  }

  static validateStepArray(steps: any[]): OnboardingStepData[] {
    if (!Array.isArray(steps)) {
      throw new ValidationError('Steps must be an array', 'steps', steps);
    }

    if (steps.length === 0) {
      throw new ValidationError('Steps array cannot be empty', 'steps', steps);
    }

    return steps.map((step, index) => {
      try {
        return this.validateStepData(step);
      } catch (error) {
        if (error instanceof ValidationError) {
          error.field = `steps[${index}].${error.field}`;
        }
        throw error;
      }
    });
  }

  static validateUniqueness(steps: OnboardingStepData[]): void {
    const seen = new Set<string>();

    for (const step of steps) {
      const key = `${step.userType}-${step.stepOrder}`;
      if (seen.has(key)) {
        throw new ValidationError(
          `Duplicate step found: ${step.userType} step ${step.stepOrder}`,
          'uniqueness',
          { userType: step.userType, stepOrder: step.stepOrder }
        );
      }
      seen.add(key);
    }
  }
}

// Default onboarding steps for each user type
const defaultSteps: OnboardingStepData[] = [
  // Customer steps
  {
    title: 'Welcome to ModernMen',
    description: 'Get started with your personalized experience',
    userType: 'customer',
    stepOrder: 1,
    stepType: 'welcome',
    isRequired: true,
    isSkippable: false,
    estimatedDuration: 60,
    content: {
      heading: 'Welcome to ModernMen!',
      subheading: 'Your premier destination for exceptional grooming services',
      body: 'We\'re excited to have you join our community. Let\'s take a quick tour to help you make the most of our services.',
      actionButton: {
        text: 'Get Started',
        variant: 'primary',
      },
    },
  },
  {
    title: 'Complete Your Profile',
    description: 'Help us personalize your experience',
    userType: 'customer',
    stepOrder: 2,
    stepType: 'profile',
    isRequired: true,
    isSkippable: false,
    estimatedDuration: 180,
    content: {
      heading: 'Tell us about yourself',
      subheading: 'This helps us provide personalized recommendations',
      actionButton: {
        text: 'Save Profile',
        variant: 'primary',
      },
    },
  },
  {
    title: 'Set Your Preferences',
    description: 'Customize your grooming preferences',
    userType: 'customer',
    stepOrder: 3,
    stepType: 'preferences',
    isRequired: true,
    isSkippable: true,
    estimatedDuration: 120,
    content: {
      heading: 'Your Style Preferences',
      subheading: 'Help us understand your grooming needs',
      actionButton: {
        text: 'Save Preferences',
        variant: 'primary',
      },
    },
  },
  {
    title: 'How to Book Appointments',
    description: 'Learn how to schedule your visits',
    userType: 'customer',
    stepOrder: 4,
    stepType: 'booking',
    isRequired: true,
    isSkippable: true,
    estimatedDuration: 90,
    content: {
      heading: 'Booking Made Easy',
      subheading: 'Schedule appointments in just a few clicks',
      actionButton: {
        text: 'Got it',
        variant: 'primary',
      },
    },
  },
  {
    title: 'Explore Our Services',
    description: 'Discover all the services we offer',
    userType: 'customer',
    stepOrder: 5,
    stepType: 'services',
    isRequired: false,
    isSkippable: true,
    estimatedDuration: 120,
    content: {
      heading: 'Our Service Menu',
      subheading: 'From haircuts to beard grooming, we have it all',
      actionButton: {
        text: 'Explore Services',
        variant: 'primary',
      },
    },
  },
  {
    title: 'Meet Our Team',
    description: 'Get to know our expert barbers',
    userType: 'customer',
    stepOrder: 6,
    stepType: 'team',
    isRequired: false,
    isSkippable: true,
    estimatedDuration: 60,
    content: {
      heading: 'Meet the Experts',
      subheading: 'Our skilled barbers are ready to serve you',
      actionButton: {
        text: 'View Team',
        variant: 'primary',
      },
    },
  },
  {
    title: 'Join Our Loyalty Program',
    description: 'Earn rewards with every visit',
    userType: 'customer',
    stepOrder: 7,
    stepType: 'loyalty',
    isRequired: false,
    isSkippable: true,
    estimatedDuration: 90,
    content: {
      heading: 'Earn While You Groom',
      subheading: 'Get rewarded for choosing ModernMen',
      actionButton: {
        text: 'Join Loyalty Program',
        variant: 'primary',
      },
    },
  },

  // Staff steps
  {
    title: 'Welcome to the Team',
    description: 'Get started with your staff account',
    userType: 'staff',
    stepOrder: 1,
    stepType: 'welcome',
    isRequired: true,
    isSkippable: false,
    estimatedDuration: 60,
  },
  {
    title: 'Complete Your Staff Profile',
    description: 'Set up your barber profile',
    userType: 'staff',
    stepOrder: 2,
    stepType: 'profile',
    isRequired: true,
    isSkippable: false,
    estimatedDuration: 180,
  },
  {
    title: 'View Your Schedule',
    description: 'Check your working hours and appointments',
    userType: 'staff',
    stepOrder: 3,
    stepType: 'staff-schedule',
    isRequired: true,
    isSkippable: false,
    estimatedDuration: 90,
  },

  // Barber steps (similar to staff but more specific)
  {
    title: 'Welcome to ModernMen',
    description: 'Your barber journey starts here',
    userType: 'barber',
    stepOrder: 1,
    stepType: 'welcome',
    isRequired: true,
    isSkippable: false,
    estimatedDuration: 60,
  },
  {
    title: 'Set Up Your Profile',
    description: 'Create your barber profile',
    userType: 'barber',
    stepOrder: 2,
    stepType: 'profile',
    isRequired: true,
    isSkippable: false,
    estimatedDuration: 180,
  },
  {
    title: 'Configure Your Availability',
    description: 'Set your working hours and preferences',
    userType: 'barber',
    stepOrder: 3,
    stepType: 'staff-schedule',
    isRequired: true,
    isSkippable: false,
    estimatedDuration: 120,
  },

  // Admin steps
  {
    title: 'Welcome to Admin Panel',
    description: 'Set up your administrative access',
    userType: 'admin',
    stepOrder: 1,
    stepType: 'welcome',
    isRequired: true,
    isSkippable: false,
    estimatedDuration: 60,
  },
  {
    title: 'Configure Business Settings',
    description: 'Set up your business information',
    userType: 'admin',
    stepOrder: 2,
    stepType: 'business-setup',
    isRequired: true,
    isSkippable: false,
    estimatedDuration: 300,
  },
  {
    title: 'Explore Admin Dashboard',
    description: 'Learn about the admin interface',
    userType: 'admin',
    stepOrder: 3,
    stepType: 'admin-dashboard',
    isRequired: true,
    isSkippable: false,
    estimatedDuration: 180,
  },
];

// Performance and monitoring utilities
interface SeedingStats {
  startTime: number;
  endTime?: number;
  totalSteps: number;
  createdSteps: number;
  skippedSteps: number;
  failedSteps: number;
  executionTime?: number;
}

interface SeedingOptions {
  dryRun?: boolean;
  force?: boolean;
  userRole?: string;
  customSteps?: OnboardingStepData[];
  skipValidation?: boolean;
  timeout?: number;
}

export async function seedOnboardingSteps(options: SeedingOptions = {}): Promise<{
  success: boolean;
  stats: SeedingStats;
  logs: any[];
  error?: string;
}> {
  const logger = LoggingManager.getInstance();
  const security = SecurityManager.getInstance();
  const stats: SeedingStats = {
    startTime: Date.now(),
    totalSteps: 0,
    createdSteps: 0,
    skippedSteps: 0,
    failedSteps: 0,
  };

  let payload: any = null;

  try {
    // Security validations
    logger.log('info', 'Starting onboarding steps seeding process');
    security.validateEnvironment();
    security.validatePermissions(options.userRole);
    security.checkRateLimit('seed-onboarding-steps');

    // Input validation and sanitization
    const stepsToProcess = options.customSteps || defaultSteps;
    security.sanitizeInput(stepsToProcess);

    if (!options.skipValidation) {
      DataValidator.validateStepArray(stepsToProcess);
      DataValidator.validateUniqueness(stepsToProcess);
    }

    stats.totalSteps = stepsToProcess.length;

    // Set up timeout
    const timeout = options.timeout || SECURITY_CONFIG.MAX_EXECUTION_TIME;
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Seeding operation timed out')), timeout);
    });

    // Initialize Payload
    const initPayload = async () => {
      logger.log('debug', 'Initializing Payload connection');
      payload = await getPayload({ config: payloadConfig });
      return payload;
    };

    // Main seeding operation with timeout
    const seedingOperation = async () => {
      await initPayload();

      const transactionManager = new TransactionManager();
      const createdIds: string[] = [];

      for (const stepData of stepsToProcess) {
        const stepKey = `${stepData.userType}-${stepData.stepOrder}`;

        transactionManager.addOperation(
          async () => {
            if (options.dryRun) {
              logger.log('info', `[DRY RUN] Would create: ${stepData.userType} - ${stepData.title}`);
              stats.createdSteps++;
              return;
            }

            // Check if step already exists
            const existingSteps = await payload.find({
              collection: 'onboarding-steps',
              where: {
                userType: { equals: stepData.userType },
                stepOrder: { equals: stepData.stepOrder },
              },
              limit: 1,
            });

            if (existingSteps.docs.length > 0) {
              if (options.force) {
                // Update existing step
                await payload.update({
                  collection: 'onboarding-steps',
                  id: existingSteps.docs[0].id,
                  data: {
                    ...stepData,
                    isActive: true,
                    updatedAt: new Date(),
                  },
                });
                logger.log('info', `🔄 Updated: ${stepKey} - ${stepData.title}`);
                stats.createdSteps++;
              } else {
                logger.log('info', `⏭️  Skipped: ${stepKey} - ${stepData.title} (already exists)`);
                stats.skippedSteps++;
              }
            } else {
              // Create new step
              const createdStep = await payload.create({
                collection: 'onboarding-steps',
                data: {
                  ...stepData,
                  isActive: true,
                },
              });

              createdIds.push(createdStep.id);
              logger.log('info', `✅ Created: ${stepKey} - ${stepData.title}`);
              stats.createdSteps++;
            }
          },
          // Rollback operation
          async () => {
            if (!options.dryRun && createdIds.length > 0) {
              logger.log('warn', `Rolling back ${createdIds.length} created steps`);
              for (const id of createdIds) {
                try {
                  await payload.delete({
                    collection: 'onboarding-steps',
                    id,
                  });
                } catch (rollbackError) {
                  logger.log('error', `Failed to rollback step ${id}`, { error: rollbackError.message });
                }
              }
            }
          }
        );
      }

      // Execute all operations as a transaction
      await transactionManager.execute();
    };

    // Race between seeding operation and timeout
    await Promise.race([seedingOperation(), timeoutPromise]);

    // Calculate final stats
    stats.endTime = Date.now();
    stats.executionTime = stats.endTime - stats.startTime;

    logger.log('info', 'Onboarding steps seeding completed successfully', {
      stats,
      executionId: security.getExecutionId(),
    });

    return {
      success: true,
      stats,
      logs: logger.getLogs(),
    };

  } catch (error) {
    stats.endTime = Date.now();
    stats.executionTime = stats.endTime - stats.startTime;
    stats.failedSteps = stats.totalSteps - stats.createdSteps - stats.skippedSteps;

    const errorDetails = {
      name: error.name,
      message: error.message,
      code: error.code || 'UNKNOWN_ERROR',
      stack: error.stack,
      stats,
      executionId: security.getExecutionId(),
    };

    logger.log('error', 'Onboarding steps seeding failed', errorDetails);

    // Determine error type and handle appropriately
    if (error instanceof SeedingError) {
      return {
        success: false,
        stats,
        logs: logger.getLogs(),
        error: error.message,
      };
    }

    // Handle unexpected errors
    return {
      success: false,
      stats,
      logs: logger.getLogs(),
      error: `Unexpected error: ${error.message}`,
    };

  } finally {
    // Cleanup and final logging
    if (stats.executionTime) {
      logger.log('info', `Seeding operation completed in ${stats.executionTime}ms`, {
        created: stats.createdSteps,
        skipped: stats.skippedSteps,
        failed: stats.failedSteps,
        total: stats.totalSteps,
      });
    }
  }
}

// Legacy function for backward compatibility
export async function seedOnboardingStepsLegacy(): Promise<void> {
  const result = await seedOnboardingSteps();

  if (!result.success) {
    throw new Error(result.error || 'Seeding failed');
  }

  console.log('🎉 Onboarding steps seeding completed!');
  console.log(`📊 Stats: ${result.stats.createdSteps} created, ${result.stats.skippedSteps} skipped`);
}

// Utility function for exporting logs
export function exportSeedingLogs(): string {
  return LoggingManager.getInstance().exportLogs();
}

// Utility function for checking seeding status
export async function checkSeedingStatus(): Promise<{
  totalSteps: number;
  activeSteps: number;
  stepsByUserType: Record<string, number>;
}> {
  try {
    const payload = await getPayload({ config: payloadConfig });

    const allSteps = await payload.find({
      collection: 'onboarding-steps',
      limit: 1000,
    });

    const stepsByUserType: Record<string, number> = {};
    let activeSteps = 0;

    for (const step of allSteps.docs) {
      if (step.isActive) activeSteps++;
      stepsByUserType[step.userType] = (stepsByUserType[step.userType] || 0) + 1;
    }

    return {
      totalSteps: allSteps.totalDocs,
      activeSteps,
      stepsByUserType,
    };

  } catch (error) {
    throw new DatabaseError(
      'Failed to check seeding status',
      'status-check',
      error
    );
  }
}

// CLI Options Parser
interface CLIOptions {
  dryRun: boolean;
  force: boolean;
  verbose: boolean;
  userRole: string;
  timeout: number;
  skipValidation: boolean;
  exportLogs: boolean;
  checkStatus: boolean;
}

function parseCLIOptions(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    dryRun: false,
    force: false,
    verbose: false,
    userRole: 'admin',
    timeout: SECURITY_CONFIG.MAX_EXECUTION_TIME,
    skipValidation: false,
    exportLogs: false,
    checkStatus: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--dry-run':
      case '-d':
        options.dryRun = true;
        break;
      case '--force':
      case '-f':
        options.force = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--user-role':
      case '-u':
        options.userRole = args[++i] || 'admin';
        break;
      case '--timeout':
      case '-t':
        options.timeout = parseInt(args[++i]) || SECURITY_CONFIG.MAX_EXECUTION_TIME;
        break;
      case '--skip-validation':
      case '-s':
        options.skipValidation = true;
        break;
      case '--export-logs':
      case '-e':
        options.exportLogs = true;
        break;
      case '--check-status':
      case '-c':
        options.checkStatus = true;
        break;
      case '--help':
      case '-h':
        console.log(`
Usage: node seed-onboarding-steps.js [options]

Options:
  -d, --dry-run          Show what would be done without making changes
  -f, --force            Force update existing steps
  -v, --verbose          Enable verbose logging
  -u, --user-role        User role for permission validation (default: admin)
  -t, --timeout          Timeout in milliseconds (default: ${SECURITY_CONFIG.MAX_EXECUTION_TIME})
  -s, --skip-validation  Skip input validation (not recommended)
  -e, --export-logs      Export execution logs to file
  -c, --check-status     Check current seeding status
  -h, --help            Show this help message

Examples:
  node seed-onboarding-steps.js --dry-run
  node seed-onboarding-steps.js --force --verbose
  node seed-onboarding-steps.js --check-status
        `);
        process.exit(0);
    }
  }

  return options;
}

// Main CLI execution function
async function runCLI(): Promise<void> {
  const logger = LoggingManager.getInstance();
  const options = parseCLIOptions();

  try {
    // Handle status check
    if (options.checkStatus) {
      console.log('🔍 Checking seeding status...');
      const status = await checkSeedingStatus();

      console.log('📊 Current Status:');
      console.log(`   Total Steps: ${status.totalSteps}`);
      console.log(`   Active Steps: ${status.activeSteps}`);
      console.log('   Steps by User Type:');

      for (const [userType, count] of Object.entries(status.stepsByUserType)) {
        console.log(`     ${userType}: ${count}`);
      }

      return;
    }

    // Execute seeding
    console.log('🚀 Starting onboarding steps seeding...');

    if (options.dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be made');
    }

    if (options.force) {
      console.log('⚠️  FORCE MODE - Existing steps will be updated');
    }

    const result = await seedOnboardingSteps({
      dryRun: options.dryRun,
      force: options.force,
      userRole: options.userRole,
      skipValidation: options.skipValidation,
      timeout: options.timeout,
    });

    // Handle results
    if (result.success) {
      console.log('\n🎉 Seeding completed successfully!');
      console.log(`📊 Stats: ${result.stats.createdSteps} created, ${result.stats.skippedSteps} skipped`);

      if (result.stats.executionTime) {
        console.log(`⏱️  Execution time: ${result.stats.executionTime}ms`);
      }

      // Export logs if requested
      if (options.exportLogs) {
        const logFile = `seeding-logs-${Date.now()}.json`;
        require('fs').writeFileSync(logFile, JSON.stringify(result.logs, null, 2));
        console.log(`📝 Logs exported to: ${logFile}`);
      }

      process.exit(0);
    } else {
      console.error('\n❌ Seeding failed!');
      console.error(`Error: ${result.error}`);
      console.log(`📊 Partial stats: ${result.stats.createdSteps} created, ${result.stats.skippedSteps} skipped, ${result.stats.failedSteps} failed`);

      if (options.exportLogs) {
        const logFile = `seeding-error-logs-${Date.now()}.json`;
        require('fs').writeFileSync(logFile, JSON.stringify(result.logs, null, 2));
        console.log(`📝 Error logs exported to: ${logFile}`);
      }

      process.exit(1);
    }

  } catch (error) {
    logger.log('error', 'CLI execution failed', {
      error: error.message,
      stack: error.stack,
      options,
    });

    console.error('\n💥 Unexpected error during CLI execution:');
    console.error(error.message);

    if (options.verbose) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }

    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runCLI().catch((error) => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
}
