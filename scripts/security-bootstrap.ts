#!/usr/bin/env tsx

/**
 * ModernMen Security Bootstrap
 * Validates security configuration and provides security testing guidance
 */

import fs from 'node:fs'
import path from 'node:path'
import { validateEnvironmentVariables } from '../src/lib/env-validator'

function readFileSafe(filePath: string): string {
  try { 
    return fs.readFileSync(filePath, 'utf8') 
  } catch { 
    return '' 
  }
}

function checkSecurityFiles(): { hasSecurity: boolean; hasWorkflow: boolean } {
  const repo = process.cwd()
  const securityPath = path.join(repo, 'SECURITY.md')
  const workflowPath = path.join(repo, 'docs', 'BUG_WORKFLOW.md')
  
  return {
    hasSecurity: fs.existsSync(securityPath),
    hasWorkflow: fs.existsSync(workflowPath)
  }
}

function validateSecurityEnvironment(): string[] {
  const warnings: string[] = []
  
  // Critical environment variables for security
  const criticalEnvVars = [
    'NODE_ENV',
    'PAYLOAD_SECRET',
    'NEXTAUTH_SECRET',
    'DATABASE_URI'
  ]
  
  criticalEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      warnings.push(`${envVar} not set`)
    }
  })
  
  // Check for development environment in production
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_APP_URL?.includes('localhost')) {
    warnings.push('Production environment with localhost URL detected')
  }
  
  return warnings
}

function displaySecurityGuidelines(): void {
  console.log('\n🔒 Security Testing Guidelines:')
  console.log('- Test only against development/staging environments')
  console.log('- Use minimal PoCs; avoid affecting production users/data')
  console.log('- Respect rate limits; do not perform DoS attacks')
  console.log('- Never include secrets in PoCs, logs, or reports')
  console.log('- Follow responsible disclosure practices')
  console.log('- Document findings with clear reproduction steps')
}

function displayRecommendedCommands(): void {
  console.log('\n🛠️  Recommended Security Commands:')
  console.log('- pnpm audit                    # Check for vulnerable dependencies')
  console.log('- pnpm audit --fix              # Auto-fix vulnerable dependencies')
  console.log('- pnpm lint                     # Run ESLint security rules')
  console.log('- pnpm type-check               # TypeScript type safety check')
  console.log('- pnpm test                     # Run security-related tests')
  console.log('- pnpm test:security            # Run dedicated security tests')
  console.log('- tsx scripts/deploy-check.ts   # Comprehensive deployment validation')
}

function displaySecurityTestingAreas(): void {
  console.log('\n🎯 Key Security Testing Areas:')
  console.log('- Authentication & Authorization (NextAuth.js)')
  console.log('- API Route Security (/api/* endpoints)')
  console.log('- Payload CMS Admin Access (/admin/*)')
  console.log('- File Upload Security (image optimization)')
  console.log('- Rate Limiting (auth, API endpoints)')
  console.log('- Input Validation (forms, API parameters)')
  console.log('- Environment Variable Exposure')
  console.log('- CORS Configuration')
  console.log('- Database Query Security (MongoDB)')
}

function main(): void {
  const repo = process.cwd()
  
  console.log('🔐 ModernMen Security Bootstrap')
  console.log('================================')
  console.log(`Repository: ${repo}`)
  
  // Check security documentation
  const { hasSecurity, hasWorkflow } = checkSecurityFiles()
  
  if (hasSecurity) {
    console.log('\n✅ Security policy found at SECURITY.md')
  } else {
    console.warn('\n⚠️  No SECURITY.md found. Consider adding one for responsible disclosure guidance.')
  }
  
  if (hasWorkflow) {
    console.log('✅ Bug workflow documentation found at docs/BUG_WORKFLOW.md')
  } else {
    console.warn('⚠️  No docs/BUG_WORKFLOW.md found. Consider adding bug reporting templates.')
  }
  
  // Validate environment
  console.log('\n🔍 Environment Security Check:')
  const envValidation = validateEnvironmentVariables()
  const securityWarnings = validateSecurityEnvironment()
  
  if (envValidation.isValid && securityWarnings.length === 0) {
    console.log('✅ Environment configuration appears secure')
  } else {
    if (!envValidation.isValid) {
      console.log('❌ Environment validation failed:')
      envValidation.errors.forEach(error => console.log(`   - ${error}`))
    }
    
    if (securityWarnings.length > 0) {
      console.log('⚠️  Security warnings:')
      securityWarnings.forEach(warning => console.log(`   - ${warning}`))
    }
  }
  
  displayRecommendedCommands()
  displaySecurityTestingAreas()
  displaySecurityGuidelines()
  
  console.log('\n📚 Additional Resources:')
  console.log('- Security Policy: SECURITY.md')
  console.log('- Bug Reporting: docs/BUG_WORKFLOW.md')
  console.log('- Testing Guide: src/app/documentation/developer/testing/page.tsx')
  console.log('- API Documentation: src/app/documentation/developer/api/page.tsx')
  
  console.log('\n🚀 Ready for security testing!')
}

main()