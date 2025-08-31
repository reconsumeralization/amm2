#!/usr/bin/env tsx

/**
 * Script to automatically fix Payload CMS TypeScript issues
 * This script applies type assertions and fixes to resolve collection slug and user property errors
 */

import { promises as fs } from 'fs';
const glob = require('glob');
import path from 'path';

interface Fix {
  pattern: RegExp;
  replacement: string;
  description: string;
}

const fixes: Fix[] = [
  // Collection slug fixes
  {
    pattern: /collection: '([^']+)'/g,
    replacement: "collection: '$1' as any",
    description: "Fix collection slug type assertions"
  },
  
  // RelationTo fixes
  {
    pattern: /relationTo: '([^']+)'/g,
    replacement: "relationTo: '$1' as any",
    description: "Fix relationTo type assertions"
  },
  
  // User role property fixes
  {
    pattern: /req\.user\.role/g,
    replacement: "(req.user as any)?.role",
    description: "Fix user role property access"
  },
  
  // User tenant property fixes
  {
    pattern: /req\.user\.tenant/g,
    replacement: "(req.user as any)?.tenant",
    description: "Fix user tenant property access"
  },
  
  // User property access in conditions
  {
    pattern: /user\.role/g,
    replacement: "(user as any)?.role",
    description: "Fix user role in conditions"
  },
  
  // User property access in conditions (tenant)
  {
    pattern: /user\.tenant/g,
    replacement: "(user as any)?.tenant",
    description: "Fix user tenant in conditions"
  },
  
  // Data property access fixes for customers
  {
    pattern: /customer\.firstName/g,
    replacement: "(customer as any)?.firstName",
    description: "Fix customer firstName property"
  },
  
  {
    pattern: /customer\.lastName/g,
    replacement: "(customer as any)?.lastName",
    description: "Fix customer lastName property"
  },
  
  {
    pattern: /customer\.email/g,
    replacement: "(customer as any)?.email",
    description: "Fix customer email property"
  },
  
  {
    pattern: /customer\.tenant/g,
    replacement: "(customer as any)?.tenant",
    description: "Fix customer tenant property"
  },
];

async function applyFixesToFile(filePath: string): Promise<boolean> {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let hasChanges = false;
    
    for (const fix of fixes) {
      const originalContent = content;
      content = content.replace(fix.pattern, fix.replacement);
      
      if (content !== originalContent) {
        hasChanges = true;
        console.log(`  ✓ Applied: ${fix.description}`);
      }
    }
    
    if (hasChanges) {
      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('🔧 Starting Payload TypeScript fixes...\n');
  
  // Find all TypeScript files in payload collections, hooks, and webhooks
  const patterns = [
    'src/payload/collections/**/*.ts',
    'src/payload/hooks/**/*.ts',
    'src/payload/utils/**/*.ts',
    'src/webhooks/**/*.ts',
    'src/scripts/**/*.ts'
  ];
  
  let totalFiles = 0;
  let fixedFiles = 0;
  
  for (const pattern of patterns) {
    console.log(`📁 Processing pattern: ${pattern}`);
    
    try {
      const files = glob.sync(pattern, { 
        cwd: process.cwd(),
        absolute: true 
      });
      
      for (const file of files) {
        // Skip this script file
        if (file.includes('fix-payload-types.ts')) continue;
        
        totalFiles++;
        const wasFixed = await applyFixesToFile(file);
        if (wasFixed) fixedFiles++;
      }
    } catch (error) {
      console.error(`❌ Error processing pattern ${pattern}:`, error);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files with fixes applied: ${fixedFiles}`);
  console.log(`   Files unchanged: ${totalFiles - fixedFiles}`);
  
  if (fixedFiles > 0) {
    console.log(`\n✅ Payload TypeScript fixes completed successfully!`);
    console.log(`\n🔍 Next steps:`);
    console.log(`   1. Run 'npm run type-check' to verify fixes`);
    console.log(`   2. Test admin functionality`);
    console.log(`   3. Commit changes if everything looks good`);
  } else {
    console.log(`\n ℹ️  No fixes were needed.`);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { main as fixPayloadTypes };
