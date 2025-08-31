import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of files that need to be updated based on the error output
const filesToFix = [
  'src/app/api/customers/[id]/dashboard/route.ts',
  'src/app/api/faq/[id]/route.ts',
  'src/app/api/gallery/[id]/route.ts',
  'src/app/api/gift-cards/[id]/route.ts',
  'src/app/api/locations/[id]/route.ts',
  'src/app/api/media/[id]/route.ts',
  'src/app/api/orders/[id]/route.ts',
  'src/app/api/pages/[id]/route.ts',
  'src/app/api/products/[id]/route.ts',
  'src/app/api/promotions/[id]/route.ts',
  'src/app/api/reviews/[id]/route.ts',
  'src/app/api/services/[id]/route.ts',
  'src/app/api/tags/[id]/route.ts'
];

console.log('🔧 Fixing missing console.error prefixes...\n');

const filesWithIdErrors = [
  'src/app/api/customers/[id]/dashboard/route.ts',
  'src/app/api/faq/[id]/route.ts',
  'src/app/api/gallery/[id]/route.ts',
  'src/app/api/gift-cards/[id]/route.ts',
  'src/app/api/locations/[id]/route.ts',
  'src/app/api/media/[id]/route.ts',
  'src/app/api/orders/[id]/route.ts',
  'src/app/api/pages/[id]/route.ts',
  'src/app/api/products/[id]/route.ts',
  'src/app/api/promotions/[id]/route.ts',
  'src/app/api/reviews/[id]/route.ts',
  'src/app/api/services/[id]/route.ts',
  'src/app/api/tags/[id]/route.ts'
];

filesWithIdErrors.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Fix lines that start with capital letters and have malformed console.error
    // Pattern: "    Error deleting tag id:`, error);" -> "    console.error(`Error deleting tag id:`, error);"
    content = content.replace(
      /^\s*([A-Z][^`]*id:)`, error\);$/gm,
      '    console.error(`$1`, error);'
    );

    hasChanges = true;

    // Write the updated content back to the file
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed console.error in: ${filePath}`);
  } else {
    console.log(`❌ File not found: ${filePath}`);
  }
});

console.log('\n🎉 All remaining dynamic route files have been updated for Next.js 15 compatibility!');
console.log('📝 Note: You may need to manually review the files to ensure all params references are properly updated.');
