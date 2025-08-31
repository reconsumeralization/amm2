// scripts/check-payload-collections.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indexPath = path.join(__dirname, '..', 'src', 'payload', 'collections', 'index.ts');
if (!fs.existsSync(indexPath)) {
  console.error('index.ts not found at', indexPath);
  process.exit(2);
}
const content = fs.readFileSync(indexPath, 'utf8');

// extract import names and file paths
const importRegex = /import\s+(?:\{?\s*([A-Za-z0-9_,\s]+)\s*\}?\s+from\s+['"]\.\/([A-Za-z0-9_-]+)['"];?)/g;
const imports = [];
let m;
while ((m = importRegex.exec(content)) !== null) {
  const importNames = m[1].split(',').map(s => s.trim()).filter(Boolean);
  const file = m[2];
  imports.push({ importNames, file });
}

const baseDir = path.join(__dirname, '..', 'src', 'payload', 'collections');
const report = [];
for (const imp of imports) {
  const fileTs = path.join(baseDir, imp.file + '.ts');
  const fileTsx = path.join(baseDir, imp.file + '.tsx');
  const exists = fs.existsSync(fileTs) || fs.existsSync(fileTsx);
  if (!exists) {
    report.push({ file: imp.file, status: 'MISSING' });
    continue;
  }
  // check for default or named export hints
  const filePath = fs.existsSync(fileTs) ? fileTs : fileTsx;
  const fileText = fs.readFileSync(filePath, 'utf8');
  for (const name of imp.importNames) {
    const namedExportHere = new RegExp(`export\\s+(const|let|var|interface|type)\\s+${name}\\b`);
    const namedExportBrace = new RegExp(`export\\s*\\{\\s*${name}\\s*\\}`);
    const defaultExportHere = /export\s+default\s+/;
    const foundNamed = namedExportHere.test(fileText) || namedExportBrace.test(fileText);
    const foundDefault = defaultExportHere.test(fileText);
    report.push({
      file: imp.file,
      importName: name,
      path: filePath,
      exists: true,
      hasNamed: foundNamed,
      hasDefault: foundDefault,
    });
  }
}

// summary
const missing = report.filter(r => r.status === 'MISSING');
if (missing.length) {
  console.log('Missing collection files:');
  missing.forEach(m => console.log('  -', m.file));
}
console.log('\nExport checks (true = present):');
report.filter(r => r.exists).forEach(r => {
  console.log(`  ${path.basename(r.path)}  -> named:${r.hasNamed}  default:${r.hasDefault}  (imported as "${r.importName}")`);
});

const problems = report.filter(r => r.exists && !r.hasNamed && !r.hasDefault);
if (problems.length) {
  console.log('\nFiles with NO export patterns detected (might be wrong export type):');
  problems.forEach(p => console.log('  -', p.path));
}

console.log('\nDone.');
