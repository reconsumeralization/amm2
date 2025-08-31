#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Error code mappings
const errorMappings = {
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'RESOURCE_NOT_FOUND',
  400: 'VALIDATION_ERROR',
  500: 'INTERNAL_SERVER_ERROR',
  409: 'RESOURCE_CONFLICT',
  429: 'RATE_LIMIT_EXCEEDED'
};

// Function to fix createErrorResponse calls
function fixCreateErrorResponse(content, filePath) {
  let modified = false;

  // Pattern: createErrorResponse('message', STATUS_CODE)
  const pattern = /createErrorResponse\(['"`]([^'"`]+)['"`]\s*,\s*(\d+)\)/g;

  const newContent = content.replace(pattern, (match, message, statusCode) => {
    const errorCode = errorMappings[statusCode];
    if (errorCode) {
      modified = true;
      return `createErrorResponse('${message}', '${errorCode}', ${statusCode})`;
    }
    return match;
  });

  return { content: newContent, modified };
}

// Function to fix getPayload imports
function fixGetPayloadImport(content, filePath) {
  let modified = false;

  // Replace direct getPayload import from 'payload'
  const importPattern = /import\s*\{\s*getPayload\s*\}\s*from\s*['"`]payload['"`]/g;
  let newContent = content.replace(importPattern, (match) => {
    modified = true;
    return `import getPayload from '@/payload'`;
  });

  // Also fix any standalone getPayload calls that don't have required parameters
  const callPattern = /\bgetPayload\(\)/g;
  newContent = newContent.replace(callPattern, (match) => {
    modified = true;
    return `getPayload()`; // Keep as is for now, will need manual review
  });

  return { content: newContent, modified };
}

// Function to fix OpenAI imports
function fixOpenAIImport(content, filePath) {
  let modified = false;

  // Fix OpenAI import
  const openAIPattern = /import\s*\{\s*OpenAI\s*\}\s*from\s*['"`]openai['"`]/g;
  const newContent = content.replace(openAIPattern, (match) => {
    modified = true;
    return `import OpenAI from 'openai'`;
  });

  return { content: newContent, modified };
}

// Function to process a single file
async function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    let newContent = content;

    // Apply all fixes
    const errorResponseResult = fixCreateErrorResponse(newContent, filePath);
    newContent = errorResponseResult.content;
    modified = modified || errorResponseResult.modified;

    const importResult = fixGetPayloadImport(newContent, filePath);
    newContent = importResult.content;
    modified = modified || importResult.modified;

    const openAIResult = fixOpenAIImport(newContent, filePath);
    newContent = openAIResult.content;
    modified = modified || openAIResult.modified;

    if (modified) {
      fs.writeFileSync(filePath, newContent);
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    } else {
      console.log(`- No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to find TypeScript files in directories
async function findTSFiles(directories) {
  const files = [];

  for (const dir of directories) {
    try {
      const items = await fs.promises.readdir(dir, { withFileTypes: true, recursive: true });

      for (const item of items) {
        if (item.isFile() && item.name.endsWith('.ts')) {
          const fullPath = path.join(dir, item.name);
          if (!fullPath.includes('node_modules') && !fullPath.includes('.next')) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }
  }

  return files;
}

// Main function
async function main() {
  const directories = [
    'src/app/api',
    'src/lib',
    'src/components',
    'src/hooks'
  ];

  console.log('🔍 Finding TypeScript files...');

  let files;
  try {
    files = await findTSFiles(directories);
    console.log(`📁 Found ${files.length} TypeScript files`);
  } catch (error) {
    console.error('❌ Error finding files:', error);
    return;
  }

  let totalFiles = 0;
  let fixedFiles = 0;

  for (const file of files) {
    totalFiles++;
    try {
      const wasFixed = await processFile(file);
      if (wasFixed) {
        fixedFiles++;
        console.log(`✅ Fixed: ${file}`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`Total files processed: ${totalFiles}`);
  console.log(`Files fixed: ${fixedFiles}`);
  console.log(`Files unchanged: ${totalFiles - fixedFiles}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { processFile, fixCreateErrorResponse, fixGetPayloadImport, fixOpenAIImport };
