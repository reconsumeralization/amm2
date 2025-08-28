/**
 * Environment Variables Validator for ModernMen
 * Ensures all required environment variables are set before deployment
 */

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missing: string[];
  optional: string[];
}

/**
 * Required environment variables for production
 */
const REQUIRED_ENV_VARS = {
  // Database
  DATABASE_URI: 'MongoDB connection string',
  
  // Payload CMS
  PAYLOAD_SECRET: 'Payload CMS secret key',
  
  // Authentication
  NEXTAUTH_SECRET: 'NextAuth.js secret',
  NEXTAUTH_URL: 'NextAuth.js URL (e.g., https://yourdomain.com)',
  
  // Stripe
  STRIPE_SECRET_KEY: 'Stripe secret key',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'Stripe publishable key',
  STRIPE_WEBHOOK_SECRET: 'Stripe webhook secret',
  
  // OpenAI
  OPENAI_API_KEY: 'OpenAI API key',
  
  // Google Calendar (optional but recommended)
  GOOGLE_CLIENT_ID: 'Google OAuth client ID',
  GOOGLE_CLIENT_SECRET: 'Google OAuth client secret',
  
  // Email (optional but recommended)
  SMTP_HOST: 'SMTP server host',
  SMTP_USER: 'SMTP username',
  SMTP_PASS: 'SMTP password',
  
  // Bunny CDN (optional)
  BUNNY_API_KEY: 'Bunny CDN API key',
  BUNNY_STORAGE_ZONE: 'Bunny CDN storage zone name',
} as const;

/**
 * Optional environment variables
 */
const OPTIONAL_ENV_VARS = {
  // Development
  NODE_ENV: 'Node environment (development/production)',
  
  // Logging
  LOG_LEVEL: 'Log level (debug, info, warn, error)',
  
  // Monitoring
  SENTRY_DSN: 'Sentry DSN for error tracking',
  
  // Analytics
  GOOGLE_ANALYTICS_ID: 'Google Analytics ID',
  
  // Social Media
  FACEBOOK_APP_ID: 'Facebook App ID',
  INSTAGRAM_ACCESS_TOKEN: 'Instagram Access Token',
  
  // SMS (optional)
  TWILIO_ACCOUNT_SID: 'Twilio Account SID',
  TWILIO_AUTH_TOKEN: 'Twilio Auth Token',
  TWILIO_PHONE_NUMBER: 'Twilio phone number',
} as const;

/**
 * Validate all environment variables
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const missing: string[] = [];
  const optional: string[] = [];

  // Check required variables
  for (const [key, description] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!process.env[key]) {
      errors.push(`Missing required environment variable: ${key} (${description})`);
      missing.push(key);
    } else if (process.env[key] === 'your-secret-key' || process.env[key] === 'placeholder') {
      errors.push(`Environment variable ${key} contains placeholder value`);
    }
  }

  // Check optional variables
  for (const [key, description] of Object.entries(OPTIONAL_ENV_VARS)) {
    if (!process.env[key]) {
      optional.push(key);
    }
  }

  // Additional validation rules
  validateSpecificVariables(errors, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    missing,
    optional,
  };
}

/**
 * Validate specific environment variables with custom rules
 */
function validateSpecificVariables(errors: string[], warnings: string[]) {
  // Validate DATABASE_URI format
  if (process.env.DATABASE_URI) {
    if (!process.env.DATABASE_URI.startsWith('mongodb://') && 
        !process.env.DATABASE_URI.startsWith('mongodb+srv://')) {
      errors.push('DATABASE_URI must be a valid MongoDB connection string');
    }
  }

  // Validate NEXTAUTH_URL format
  if (process.env.NEXTAUTH_URL) {
    try {
      new URL(process.env.NEXTAUTH_URL);
    } catch {
      errors.push('NEXTAUTH_URL must be a valid URL');
    }
  }

  // Validate Stripe keys format
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    errors.push('STRIPE_SECRET_KEY must start with "sk_"');
  }

  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
      !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with "pk_"');
  }

  // Validate OpenAI API key format
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('sk-')) {
    errors.push('OPENAI_API_KEY must start with "sk-"');
  }

  // Check for development variables in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.DATABASE_URI?.includes('localhost')) {
      warnings.push('Using localhost database in production environment');
    }

    if (process.env.NEXTAUTH_URL?.includes('localhost')) {
      warnings.push('Using localhost URL in production environment');
    }
  }

  // Validate email configuration
  if (process.env.SMTP_HOST && (!process.env.SMTP_USER || !process.env.SMTP_PASS)) {
    warnings.push('SMTP_HOST is set but SMTP_USER or SMTP_PASS is missing');
  }

  // Validate Google OAuth configuration
  if (process.env.GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_SECRET) {
    warnings.push('GOOGLE_CLIENT_ID is set but GOOGLE_CLIENT_SECRET is missing');
  }

  if (process.env.GOOGLE_CLIENT_SECRET && !process.env.GOOGLE_CLIENT_ID) {
    warnings.push('GOOGLE_CLIENT_SECRET is set but GOOGLE_CLIENT_ID is missing');
  }
}

/**
 * Generate environment variables template
 */
export function generateEnvTemplate(): string {
  let template = '# ModernMen Environment Variables\n';
  template += '# Copy this file to .env.local and fill in your values\n\n';

  template += '# Database\n';
  template += 'DATABASE_URI=mongodb://localhost:27017/modernmen\n\n';

  template += '# Payload CMS\n';
  template += 'PAYLOAD_SECRET=your-secret-key-here\n\n';

  template += '# Authentication\n';
  template += 'NEXTAUTH_SECRET=your-nextauth-secret-here\n';
  template += 'NEXTAUTH_URL=http://localhost:3000\n\n';

  template += '# Stripe\n';
  template += 'STRIPE_SECRET_KEY=sk_test_...\n';
  template += 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...\n';
  template += 'STRIPE_WEBHOOK_SECRET=whsec_...\n\n';

  template += '# OpenAI\n';
  template += 'OPENAI_API_KEY=sk-...\n\n';

  template += '# Google Calendar (Optional)\n';
  template += 'GOOGLE_CLIENT_ID=your-google-client-id\n';
  template += 'GOOGLE_CLIENT_SECRET=your-google-client-secret\n\n';

  template += '# Email (Optional)\n';
  template += 'SMTP_HOST=smtp.gmail.com\n';
  template += 'SMTP_USER=your-email@gmail.com\n';
  template += 'SMTP_PASS=your-app-password\n\n';

  template += '# Bunny CDN (Optional)\n';
  template += 'BUNNY_API_KEY=your-bunny-api-key\n';
  template += 'BUNNY_STORAGE_ZONE=your-storage-zone\n\n';

  template += '# Development\n';
  template += 'NODE_ENV=development\n';
  template += 'LOG_LEVEL=info\n\n';

  template += '# Monitoring (Optional)\n';
  template += '# SENTRY_DSN=https://...\n';
  template += '# GOOGLE_ANALYTICS_ID=G-...\n';

  return template;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Get environment-specific configuration
 */
export function getEnvironmentConfig() {
  const isProd = isProduction();
  
  return {
    isProduction: isProd,
    isDevelopment: !isProd,
    database: {
      uri: process.env.DATABASE_URI,
      isLocalhost: process.env.DATABASE_URI?.includes('localhost') || false,
    },
    stripe: {
      isTestMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') || false,
      isLiveMode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') || false,
    },
    openai: {
      isConfigured: !!process.env.OPENAI_API_KEY,
    },
    email: {
      isConfigured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    },
    google: {
      isConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    bunny: {
      isConfigured: !!(process.env.BUNNY_API_KEY && process.env.BUNNY_STORAGE_ZONE),
    },
  };
}

/**
 * Validate environment on startup
 */
export function validateOnStartup(): void {
  if (isProduction()) {
    const validation = validateEnvironmentVariables();
    
    if (!validation.isValid) {
      console.error('❌ Environment validation failed:');
      validation.errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }

    if (validation.warnings.length > 0) {
      console.warn('⚠️  Environment warnings:');
      validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }

    console.log('✅ Environment validation passed');
  } else {
    console.log('🔧 Development environment - skipping strict validation');
  }
}
