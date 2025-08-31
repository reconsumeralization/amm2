# Visual Page Editor & Image Editor

## Overview

The ModernMen barbershop project now includes a comprehensive visual page editing system that allows non-technical users (like your wife) to create and edit pages with drag-and-drop functionality and advanced image editing capabilities.

## Features

### 🎨 Visual Page Builder
- **Drag-and-Drop Interface**: Reorder components by dragging them up and down
- **Component Library**: Add text, images, buttons, booking chatbot, barber profiles, and testimonials
- **Real-time Preview**: See changes as you build
- **Responsive Design**: All components automatically adapt to mobile and desktop

### 🖼️ Image Editor
- **Crop & Resize**: Interactive cropping with aspect ratio control
- **Image Effects**: Adjust brightness, contrast, grayscale, and sepia
- **Alt Text Support**: Accessibility-friendly with descriptive text
- **Responsive Optimization**: Automatic generation of multiple sizes for different devices

### 🔧 Settings-Driven Configuration
- **Enable/Disable Features**: Control which components and effects are available
- **Multi-Tenant Support**: Each tenant has their own content and settings
- **Permission Control**: Restrict access to admins and barbers

## Quick Start

### 1. Access the Page Builder
1. Log in to the admin panel (`/admin`)
2. Navigate to "Page Builder" in the Quick Actions section
3. Choose a page template or create a new page

### 2. Add Components
1. Click the "+" buttons to add different types of content:
   - **Text**: Add paragraphs and headings
   - **Image**: Upload and edit images
   - **Button**: Create call-to-action buttons
   - **Booking Chatbot**: Embed the appointment booking system
   - **Barber Profile**: Link to stylist profiles
   - **Testimonial**: Display customer reviews

### 3. Edit Images
1. Click "+ Image" to upload a new image
2. The Image Editor will open automatically
3. Use the cropping tool to select the perfect area
4. Adjust brightness, contrast, and other effects
5. Add descriptive alt text for accessibility
6. Click "Save Image" to add it to your page

### 4. Arrange Components
1. Drag components up and down to reorder them
2. Click "Edit" on any component to modify its content
3. Click "Delete" to remove unwanted components

### 5. Save and Publish
1. Click "Save Page" to store your changes
2. Toggle the "Published" checkbox to make the page live
3. Your page is now accessible to customers

## Component Types

### Text Component
- **Purpose**: Add headings, paragraphs, and formatted text
- **Features**: Rich text editing with basic formatting
- **Use Cases**: Page titles, descriptions, announcements

### Image Component
- **Purpose**: Display photos and graphics
- **Features**: 
  - Interactive cropping
  - Image effects (brightness, contrast, grayscale, sepia)
  - Responsive sizing (mobile, tablet, desktop)
  - Alt text for accessibility
- **Use Cases**: Barber work examples, BarberShop photos, promotional images

### Button Component
- **Purpose**: Create call-to-action links
- **Features**: Customizable text and URL
- **Use Cases**: "Book Appointment", "View Services", "Contact Us"

### Booking Chatbot Component
- **Purpose**: Embed the appointment booking system
- **Features**: Interactive chat interface for scheduling
- **Use Cases**: Direct appointment booking on any page

### Barber Profile Component
- **Purpose**: Link to individual stylist profiles
- **Features**: Customizable link text and URL
- **Use Cases**: "Meet Our Team", individual stylist pages

### Testimonial Component
- **Purpose**: Display customer reviews and feedback
- **Features**: Styled quote format
- **Use Cases**: Social proof, customer reviews

## Image Editor Features

### Cropping
- **Interactive Selection**: Click and drag to select crop area
- **Aspect Ratio**: Free-form or constrained cropping
- **Preview**: See the final result before saving

### Effects
- **Brightness**: Adjust from 0% (black) to 200% (very bright)
- **Contrast**: Adjust from 0% (no contrast) to 200% (high contrast)
- **Grayscale**: Convert to black and white (0-100%)
- **Sepia**: Apply vintage brown tone (0-100%)

### Optimization
- **Automatic Resizing**: Creates multiple sizes for different devices
- **Format Conversion**: Optimizes for WebP when supported
- **Quality Control**: Maintains image quality while reducing file size

## Settings Configuration

### Enable/Disable Features
In the Settings collection (`/admin/collections/settings`), you can control:

```json
{
  "editor": {
    "enabledPlugins": ["pageBuilder", "imageEditor"],
    "pageBuilder": {
      "enabled": true,
      "components": ["text", "image", "button", "bookingChatbot", "barberProfile", "testimonial"]
    },
    "imageEditor": {
      "enabled": true,
      "effects": ["brightness", "contrast", "grayscale", "sepia"]
    }
  }
}
```

### Image Optimization Settings
```json
{
  "editor": {
    "imageOptimization": {
      "maxImageSize": 5242880,
      "responsiveSizes": [
        { "width": 320, "label": "mobile" },
        { "width": 768, "label": "tablet" },
        { "width": 1200, "label": "desktop" }
      ],
      "formats": ["jpeg", "webp"],
      "quality": 80
    }
  }
}
```

## API Endpoints

### Content Management
- `GET /api/content?slug={slug}&tenantId={tenantId}` - Fetch page content
- `POST /api/content` - Create new page content
- `PUT /api/content` - Update existing page content
- `DELETE /api/content?id={id}` - Delete page content

### Image Processing
- `POST /api/media` - Upload original image
- `POST /api/image-optimize` - Generate responsive versions

## Database Schema

### Content Collection
```typescript
interface Content {
  id: string;
  title: string;
  slug: string;
  tenant: string;
  content: ComponentProps[];
  description?: string;
  isPublished: boolean;
  publishedAt?: Date;
  meta?: {
    keywords?: string;
    description?: string;
  };
}
```

### Component Structure
```typescript
interface ComponentProps {
  id: string;
  type: 'text' | 'image' | 'button' | 'bookingChatbot' | 'barberProfile' | 'testimonial';
  content?: string;
  src?: string;
  alt?: string;
  url?: string;
  srcSet?: string;
  sizes?: string;
}
```

## Best Practices

### For Content Creators
1. **Start with a Plan**: Sketch out your page layout before building
2. **Use High-Quality Images**: Upload images at least 1200px wide for best results
3. **Write Descriptive Alt Text**: Help visually impaired users understand your images
4. **Test on Mobile**: Preview your pages on different screen sizes
5. **Keep it Simple**: Don't overload pages with too many components

### For Administrators
1. **Configure Settings**: Set up which components and effects are available
2. **Monitor Usage**: Check which pages are most popular
3. **Backup Content**: Regularly export important page content
4. **Train Users**: Provide guidance on best practices for content creation

## Troubleshooting

### Common Issues

**Image Editor Not Opening**
- Check that `settings.editor.imageEditor.enabled` is `true`
- Verify the image file is under the maximum size limit
- Ensure the file type is supported (JPEG, PNG, WebP)

**Page Builder Not Loading**
- Verify `settings.editor.pageBuilder.enabled` is `true`
- Check that the user has admin or barber permissions
- Ensure all required components are properly configured

**Images Not Optimizing**
- Check the `/api/image-optimize` endpoint is working
- Verify Bunny CDN credentials are configured
- Ensure the media collection is properly set up

**Components Not Saving**
- Check network connectivity
- Verify the `/api/content` endpoint is accessible
- Ensure the user has proper permissions

### Performance Tips
1. **Optimize Images**: Use the image editor to crop and compress images before adding them
2. **Limit Components**: Don't add too many components to a single page
3. **Use Caching**: Enable browser caching for better performance
4. **Monitor File Sizes**: Keep individual images under 5MB

## Security Considerations

### Access Control
- Only admins and barbers can access the page builder
- Content is tenant-specific and isolated
- Image uploads are validated for type and size

### Data Protection
- All content is stored securely in the database
- Images are processed server-side
- No sensitive data is exposed in the frontend

### Input Validation
- All user inputs are sanitized
- File uploads are validated for type and size
- SQL injection is prevented through parameterized queries

## Future Enhancements

### Planned Features
- **Advanced Image Effects**: Filters, overlays, and text on images
- **Component Templates**: Pre-built layouts for common page types
- **Version History**: Track changes and revert to previous versions
- **Collaboration**: Multiple users editing the same page
- **Analytics**: Track page performance and user engagement

### Integration Opportunities
- **E-commerce**: Product catalogs and shopping carts
- **Social Media**: Direct sharing to social platforms
- **Email Marketing**: Newsletter signup forms
- **Customer Reviews**: Integration with review platforms

## Support

For technical support or questions about the visual page editor:

1. **Check Documentation**: Review this guide and other documentation
2. **Test in Development**: Try features in a development environment first
3. **Contact Development Team**: Reach out for complex issues
4. **Community Forum**: Share tips and solutions with other users

---

*This documentation is part of the ModernMen barbershop project. For more information, see the main README.md file.*
