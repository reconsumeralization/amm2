#!/usr/bin/env ts-node

/**
 * export-docs.ts
 *
 * Exports all documents from the Payload `Documentation` collection to markdown files.
 * Each file includes front‑matter with title, slug, and tags.
 *
 * Usage:
 *   ts-node src/tools/export-docs.ts --output ./exported-docs
 *
 * The `--output` (or `-o`) flag specifies the destination directory.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import getPayloadClient from '../payload';

// Resolve script directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default output directory
let outputDir = path.resolve(__dirname, '..', '..', 'exported-docs');

// Simple CLI argument parsing
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--output' || args[i] === '-o') {
    if (i + 1 < args.length) {
      outputDir = path.resolve(args[i + 1]);
      i++;
    }
  }
}

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function exportDocs() {
  const payload = await getPayloadClient();

  // Fetch all documentation entries (no pagination for simplicity)
  const { docs } = await payload.find({
    collection: 'documentation',
    limit: 1000,
  });

  docs.forEach((doc: any) => {
    const fileName = `${doc.slug || doc._id}.md`;
    const filePath = path.join(outputDir, fileName);
    const frontMatter = `---\ntitle: "${doc.title || 'Untitled'}"\nslug: "${doc.slug || doc._id}"\ntags: ${JSON.stringify(doc.tags || [])}\n---\n\n`;
    const content = `${frontMatter}${doc.content || ''}\n`;
    fs.writeFileSync(filePath, content);
    console.log(`✅ Exported ${fileName}`);
  });

  console.log(`\nAll documentation exported to ${outputDir}`);
  process.exit(0);
}

exportDocs().catch(err => {
  console.error('❌ Export failed:', err);
  process.exit(1);
});
