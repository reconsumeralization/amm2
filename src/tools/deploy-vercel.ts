#!/usr/bin/env ts-node

/**
 * deploy-vercel.ts
 *
 * Builds the Next.js app and deploys it to Vercel using the Vercel CLI.
 *
 * Usage: `npm run tools:deploy`
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve project root (two levels up from src/tools)
const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..', '..');

function runCommand(command: string, args: string[], description: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`🚀 ${description}...`);
    const proc = spawn(command, args, {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${description} failed with exit code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    // 1. Build the project
    await runCommand('npm', ['run', 'build'], 'Building the project');

    // 2. Deploy using Vercel CLI
    await runCommand('npx', ['vercel', 'deploy', '--prod', '--confirm'], 'Deploying to Vercel');

    console.log('✅ Deployment completed successfully.');
  } catch (err) {
    console.error('❌ Deployment error:', err);
    process.exit(1);
  }
}

main();
