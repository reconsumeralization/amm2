#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple collection type generator
console.log('🚀 Starting Simple Collection Types Generation...');

const collectionsDir = path.join(__dirname, 'src/payload/collections');
const outputPath = path.join(__dirname, 'src/payload/generated-types.ts');

// Collection directories to scan
const collectionDirs = ['commerce', 'content', 'crm', 'staff', 'system'];

let allTypes = [];
let allCollections = [];

// Header
allTypes.push('// Auto-generated Payload Collection Types');
allTypes.push('// Generated at: ' + new Date().toISOString());
allTypes.push('');
allTypes.push('export interface BaseCollection {');
allTypes.push('  id: string;');
allTypes.push('  createdAt: string;');
allTypes.push('  updatedAt: string;');
allTypes.push('}');
allTypes.push('');

// Scan each directory
for (const dir of collectionDirs) {
  const dirPath = path.join(collectionsDir, dir);
  
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️ Directory not found: ${dir}`);
    continue;
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'));
  console.log(`📁 Processing ${dir}: ${files.length} files`);
  
  for (const file of files) {
    const collectionName = path.basename(file, '.ts');
    const pascalName = collectionName.replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
                                   .replace(/^(\w)/, c => c.toUpperCase());
    
    allCollections.push(pascalName);
    
    // Generate basic interface
    allTypes.push(`// ${dir.toUpperCase()} - ${collectionName}`);
    allTypes.push(`export interface ${pascalName} extends BaseCollection {`);
    allTypes.push('  // Collection-specific fields would go here');
    allTypes.push('  [key: string]: any;');
    allTypes.push('}');
    allTypes.push('');
    
    allTypes.push(`export interface Create${pascalName} {`);
    allTypes.push('  [key: string]: any;');
    allTypes.push('}');
    allTypes.push('');
    
    allTypes.push(`export interface Update${pascalName} extends Partial<Create${pascalName}> {`);
    allTypes.push('  id: string;');
    allTypes.push('}');
    allTypes.push('');
    
    console.log(`✅ Generated types for ${collectionName} -> ${pascalName}`);
  }
}

// Add union types
allTypes.push('// Union Types');
allTypes.push(`export type AllCollections = ${allCollections.join(' | ')};`);
allTypes.push('');

// Write to file
fs.writeFileSync(outputPath, allTypes.join('\n'));
console.log(`📄 Types written to: ${path.relative(__dirname, outputPath)}`);
console.log(`🎉 Generated ${allCollections.length} collection types!`);

// Output collection info for database schema generation
const collectionsInfo = {
  collections: allCollections,
  timestamp: new Date().toISOString(),
  directories: collectionDirs,
  outputPath: outputPath
};

fs.writeFileSync('collections-info.json', JSON.stringify(collectionsInfo, null, 2));
console.log('📊 Collection info saved to collections-info.json');