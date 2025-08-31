// scripts/test-og-system.js
import puppeteer from 'puppeteer';
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Testing OG Image Generation System...');

// Test basic imports
try {
  console.log('✓ Puppeteer available');
  console.log('✓ Marked available');

  // Test basic functionality
  const html = marked.parse('**Hello World**');
  console.log('✓ Marked parsing works:', html.substring(0, 50) + '...');

} catch (error) {
  console.error('✗ Import error:', error.message);
}

const outputDir = path.resolve('./public/media/generated-og');
console.log('Output directory:', outputDir);

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('✓ Created output directory');
} else {
  console.log('✓ Output directory exists');
}

// List files in the directory
const files = fs.readdirSync(outputDir);
console.log('Files in output directory:', files.length);

console.log('Basic system check complete!');
