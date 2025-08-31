# 🎨 Professional OG Image Generation System

A comprehensive, automated Open Graph image generation system for Payload CMS that creates beautiful, branded social media images for all your content.

## ✨ Features

- **🎨 Professional Design**: Canvas-based image generation with gradients, typography, and branding
- **🔄 Auto-Updating**: Automatically regenerates images when content changes
- **📝 Multiple Templates**: Blog, Product, Service, Event, Customer, and Default templates
- **🏷️ Category Badges**: Dynamic category indicators with custom colors
- **📱 Responsive**: Optimized for social media sharing (1200x630px)
- **🧹 Auto-Cleanup**: Removes old images to save storage space
- **📋 Draft-Aware**: Only generates images for published content
- **🎯 Universal**: Works across all Payload collections automatically

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install canvas
```

### 2. The System is Already Integrated!

The OG image generation system is automatically applied to all your Payload collections. When you create or update content, OG images are generated automatically.

## 🎨 Available Templates

### Blog Template
- Dark gradient background
- Serif-style typography
- Perfect for articles and blog posts
- Collection badge in top-right

### Product Template
- Light gradient background
- Shopping-themed design
- Ideal for products and packages
- Clean, modern layout

### Service Template
- Elegant styling
- Professional BarberShop branding
- Scissors accent icon
- Perfect for service descriptions

### Event Template
- Calendar-inspired design
- Promotional styling
- Great for sales and events
- Event-specific colors

### Customer Template
- Light, welcoming background
- Customer-focused design
- Perfect for testimonials and reviews
- Trust-building layout

### Default Template
- Universal dark background
- Works for any content type
- Professional and clean
- Highly customizable

## 🔧 Configuration

### Auto-Applied Fields

Every collection with a `title` or `name` field automatically gets:

```typescript
{
  name: 'ogImage',
  type: 'text',
  admin: { readOnly: true, description: 'Auto-generated Open Graph image URL' }
},
{
  name: 'categoryColor',
  type: 'text',
  admin: { description: 'Hex color for OG image background' }
},
{
  name: 'logoUrl',
  type: 'text',
  admin: { description: 'Custom logo URL for OG image' }
}
```

### Custom Configuration

For collections that need specific field mappings:

```typescript
import { autoUpdateOGImageHook } from '../hooks/autoUpdateOGImageHook';

const CustomCollection: CollectionConfig = {
  slug: 'custom-collection',
  fields: [
    // Your fields...
  ],
  hooks: {
    afterChange: [
      autoUpdateOGImageHook({
        titleField: 'customTitleField',
        excerptField: 'customExcerptField',
        categoryField: 'customCategoryField',
        cleanupOldImages: true, // Default: true
      })
    ]
  }
};
```

## 📸 Generated Image Features

- **📐 Dimensions**: 1200x630px (optimal for social sharing)
- **🎨 Dynamic Backgrounds**: Template-specific gradients
- **📝 Smart Typography**: Auto-scaling fonts for long titles
- **🏷️ Category Badges**: Color-coded category indicators
- **🖼️ Logo Integration**: Automatic logo placement
- **📋 Collection Indicators**: Shows which collection the content belongs to
- **✂️ Text Wrapping**: Intelligent text layout
- **🎯 Accent Elements**: Subtle design elements for visual appeal

## 🔄 Auto-Update Logic

Images are automatically regenerated when:

- ✅ Content is first published
- ✅ Title, excerpt, or category changes
- ✅ Content transitions from draft to published
- ✅ Collection is updated with new branding

Images are **NOT** generated for:
- ❌ Draft content
- ❌ Unchanged content
- ❌ Collections without title/name fields

## 🧹 Auto-Cleanup

The system automatically:
- Removes old OG images from filesystem
- Cleans up old Media entries in Payload
- Prevents storage bloat
- Maintains only current, relevant images

## 📊 Performance

- **⚡ Fast Generation**: Canvas-based rendering (much faster than Puppeteer)
- **💾 Efficient Storage**: PNG format with optimized compression
- **🔄 Smart Updates**: Only regenerates when necessary
- **🧵 Non-Blocking**: Errors don't break content saving

## 🎯 Usage Examples

### Basic Content Creation

1. Create a blog post in Payload admin
2. Add title: "Premium Haircut Guide"
3. Add excerpt: "Learn professional haircut techniques..."
4. Set category: "Guide"
5. **OG image is automatically generated!**

### Custom Branding

```typescript
// In your content
{
  title: "Summer Sale Event",
  excerpt: "30% off all services!",
  category: "Promotion",
  categoryColor: "#ff6b35", // Custom color
  logoUrl: "/summer-logo.png" // Custom logo
}
```

## 🛠️ Testing

### Test All Templates

```bash
node scripts/test-all-og-templates.js
```

This generates sample images for all templates to verify the system is working.

### Manual Testing

```javascript
// In browser console or API
fetch('/api/og-regenerate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    collection: 'blog-posts',
    id: 'your-post-id'
  })
});
```

## 📁 File Structure

```
src/
├── utils/
│   └── generateProfessionalOGImage.ts  # Core image generator
├── payload/
│   ├── hooks/
│   │   ├── autoUpdateOGImageHook.ts    # Main hook
│   │   ├── generateOGImageHook.ts      # Alternative hooks
│   │   └── universalOGHook.ts          # Universal hook
│   └── collections/
│       └── index.ts                    # Auto-applies to all collections
└── scripts/
    └── test-all-og-templates.js        # Template testing
```

## 🎨 Customization

### Add New Templates

```typescript
// In generateProfessionalOGImage.ts
function generateYourCustomTemplate(...) {
  // Your custom design logic
}

// Add to template map
const templateMap = {
  'your-collection': 'yourCustomTemplate',
  // ...
};
```

### Custom Colors

```typescript
// Add to getCategoryColor function
const colorMap = {
  'your-category': '#your-color',
  // ...
};
```

### Custom Fonts

```typescript
// Register custom fonts
registerFont(path.join(__dirname, '../fonts/YourFont.ttf'), {
  family: 'YourFontFamily'
});
```

## 🔍 Troubleshooting

### Images Not Generating

1. Check collection has `title` or `name` field
2. Verify content is published (not draft)
3. Check server logs for errors
4. Ensure Canvas dependencies are installed

### Poor Image Quality

1. Check logo file exists and is SVG/PNG
2. Verify font files are available
3. Check output directory permissions
4. Review Canvas rendering errors

### Storage Issues

1. Enable cleanup in hook options
2. Check filesystem permissions
3. Monitor Payload Media collection size
4. Consider implementing image optimization

## 📈 Monitoring

The system provides comprehensive logging:

```
[OG] Generating OG image for blog-posts: Your Title
[OG] Generated: /media/generated-og/blog-posts-123-2024-01-15.png
[OG] Cleaned up old Media entry: old-image.png
```

## 🚀 Advanced Features

### Custom Field Mapping

```typescript
autoUpdateOGImageHook({
  titleField: 'headline',
  excerptField: 'summary',
  categoryField: 'topic',
  categoryColorField: 'brandColor',
  logoUrlField: 'brandLogo'
})
```

### Conditional Generation

```typescript
autoUpdateOGImageHook({
  // Only generate for specific categories
  condition: (doc) => doc.category === 'featured'
})
```

### Custom Templates per Collection

```typescript
// Override template for specific collection
const collectionTemplates = {
  'special-collection': 'specialTemplate'
};
```

## 📋 API Reference

### Hook Options

```typescript
interface AutoUpdateOGHookOptions {
  titleField?: string;           // Default: 'title'
  excerptField?: string;         // Default: 'excerpt'
  categoryField?: string;        // Default: 'category'
  categoryColorField?: string;   // Default: 'categoryColor'
  logoUrlField?: string;         // Default: 'logoUrl'
  statusField?: string;          // Default: 'status'
  publishedField?: string;       // Default: 'published'
  cleanupOldImages?: boolean;    // Default: true
}
```

### Template Options

```typescript
type OGTemplate = 'default' | 'blog' | 'product' | 'event' | 'service' | 'customer';
```

## 🎯 Best Practices

1. **Use SVG logos** for crisp scaling
2. **Choose readable fonts** for web display
3. **Test on social platforms** before publishing
4. **Monitor storage usage** and cleanup regularly
5. **Use consistent branding** across templates
6. **Test with long titles** to ensure proper wrapping

## 📞 Support

The system includes comprehensive error handling and logging. Check your Payload logs for any issues:

```bash
# Check Payload logs
tail -f /path/to/payload/logs

# Look for [OG] prefixed messages
grep "\[OG\]" /path/to/logs
```

## 🎉 You're All Set!

Your Payload CMS now automatically generates professional, branded OG images for all your content. The system is:

- ✅ **Production-ready** with error handling
- ✅ **Scalable** across all collections
- ✅ **Efficient** with smart updates and cleanup
- ✅ **Beautiful** with professional design templates
- ✅ **Automatic** - set it and forget it!

Happy content creation! 🎨✨
