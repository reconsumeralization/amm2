#!/usr/bin/env tsx

/* Security bootstrap: prints policy, validates environment, and suggests commands */

import fs from 'node:fs'
import path from 'node:path'

function readFileSafe(p: string) {
  try { return fs.readFileSync(p, 'utf8') } catch { return '' }
}

function main() {
  const repo = process.cwd()
  const securityPath = path.join(repo, 'SECURITY.md')
  const hasSecurity = fs.existsSync(securityPath)

  console.log('=== Security Bootstrap ===')
  console.log('Repo:', repo)

  if (hasSecurity) {
    console.log('\nSecurity policy found at SECURITY.md')
  } else {
    console.warn('\nNo SECURITY.md found. Consider adding one for responsible disclosure guidance.')
  }

  console.log('\nRecommended commands:')
  console.log('- pnpm audit')
  console.log('- pnpm lint')
  console.log('- pnpm type-check')
  console.log('- pnpm test')

  console.log('\nResponsible testing reminders:')
  console.log('- Use minimal PoCs; avoid affecting prod users/data')
  console.log('- Respect rate limits; do not perform DoS')
  console.log('- Never include secrets in PoCs or logs')

  const envHints: string[] = []
  if (!process.env.NODE_ENV) envHints.push('NODE_ENV not set')
  if (!process.env.PAYLOAD_SECRET) envHints.push('PAYLOAD_SECRET not set')
  if (envHints.length) {
    console.warn('\nEnvironment warnings:')
    for (const w of envHints) console.warn('-', w)
  }

  console.log('\nSee docs/BUG_WORKFLOW.md for reporting templates and workflow diagrams.')
}

main()