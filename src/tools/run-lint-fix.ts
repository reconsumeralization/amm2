#!/usr/bin/env ts-node

/**
 * run-lint-fix.ts
 *
 * Executes ESLint with the `--fix` flag across the entire codebase
 * and prints a concise summary of the operation.
 *
 * Usage: `npm run tools:lint-fix`
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve project root (two levels up from src/tools)
const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..', '..');

function runEslint() {
  const eslint = spawn('npx', ['eslint', '.', '--ext', '.ts,.tsx', '--fix'], {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true,
  });

  eslint.on('close', code => {
    if (code === 0) {
      console.log('✅ ESLint completed successfully.');
    } else {
      console.error(`❌ ESLint exited with code ${code}.`);
    }
  });
}

runEslint();
