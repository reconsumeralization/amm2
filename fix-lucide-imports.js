import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Icon mapping from old named imports to new ESM imports
const iconMapping = {
  'Check': 'check',
  'XIcon': 'x',
  'Clock': 'clock',
  'Star': 'star',
  'Users': 'users',
  'Scissors': 'scissors',
  'Award': 'award',
  'Phone': 'phone',
  'Mail': 'mail',
  'LogOut': 'log-out',
  'Loader2': 'loader-2',
  'LoaderCircle': 'loader-circle',
  'User': 'user',
  'TrendingUp': 'trending-up',
  'DollarSign': 'dollar-sign',
  'Calendar': 'calendar',
  'FileText': 'file-text',
  'AlertCircle': 'alert-circle',
  'LogIn': 'log-in',
  'Activity': 'activity',
  'RefreshCw': 'refresh-cw',
  'CheckCircle': 'check-circle',
  'XCircle': 'x-circle',
  'MapPin': 'map-pin',
  'MessageCircle': 'message-circle',
  'Send': 'send',
  'Minimize': 'minimize-2',
  'Maximize': 'maximize-2',
  'Bot': 'bot',
  'Image': 'image',
  'Upload': 'upload',
  'Undo': 'undo',
  'Redo': 'redo',
  'Heading1': 'heading-1',
  'Heading2': 'heading-2',
  'Bold': 'bold',
  'Italic': 'italic',
  'Underline': 'underline',
  'Quote': 'quote',
  'Strikethrough': 'strikethrough',
  'Code': 'code',
  'AlignLeft': 'align-left',
  'AlignCenter': 'align-center',
  'AlignRight': 'align-right',
  'AlignJustify': 'align-justify',
  'List': 'list',
  'ListOrdered': 'list-ordered',
  'Link': 'link',
  'Sparkles': 'sparkles',
  'ExternalLink': 'external-link',
  'Trophy': 'trophy',
  'Crown': 'crown',
  'Zap': 'zap',
  'Target': 'target',
  'Gift': 'gift',
  'Package': 'package',
  'Map': 'map',
  'ShoppingCart': 'shopping-cart',
  'Search': 'search',
  'ShoppingBag': 'shopping-bag',
  'Heart': 'heart',
  'Eye': 'eye',
  'Filter': 'filter',
  'Grid3X3': 'grid-3x3',
  'Minus': 'minus',
  'Plus': 'plus',
  'Timer': 'timer',
  'CreditCard': 'credit-card',
  'Share2': 'share-2',
  'MessageSquare': 'message-square',
  'ThumbsUp': 'thumbs-up',
  'MousePointer': 'mouse-pointer',
  'Type': 'type',
  'Sliders': 'sliders',
  'RotateCcw': 'rotate-ccw',
  'Move': 'move',
  'ZoomIn': 'zoom-in',
  'ZoomOut': 'zoom-out',
  'Crop': 'crop',
  'Save': 'save',
  'Settings': 'settings',
  'Instagram': 'instagram',
  'Facebook': 'facebook'
};

// Function to fix a single file
function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Find lucide-react import statements
    const importRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"]/g;

    content = content.replace(importRegex, (match, imports) => {
      const iconNames = imports.split(',').map(icon => icon.trim());
      const newImports = iconNames.map(iconName => {
        const iconKey = iconName in iconMapping ? iconMapping[iconName] : iconName.toLowerCase().replace(/icon$/, '');
        return `import ${iconName} from 'lucide-react/dist/esm/icons/${iconKey}'`;
      }).join('\n');

      hasChanges = true;
      return newImports;
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Find all TypeScript/React files
async function main() {
  try {
    const files = await glob('src/**/*.{ts,tsx}', {
      ignore: ['node_modules/**', 'dist/**', '.next/**']
    });

    console.log(`Found ${files.length} files to process`);

    files.forEach(fixFile);

    console.log('Lucide React import fix completed!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
