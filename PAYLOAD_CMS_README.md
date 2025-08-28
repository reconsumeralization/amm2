# ModernMen Payload CMS Configuration

## Overview
This document outlines the complete Payload CMS setup for ModernMen Hair Salon, including white labeling, collections, and configurations.

## ✅ White Labeling Features

### Admin Panel Branding
- **Logo & Icon**: Custom ModernMen logo with amber gradient branding (`@/components/payload/Logo.tsx`, `@/components/payload/Icon.tsx`)
- **Title Suffix**: "- ModernMen Admin" appears in browser tabs
- **Custom CSS**: Full visual theme applied via `/public/payload-admin.css`
- **Color Scheme**: Amber/orange primary colors (#d97706, #b45309) with gray accents
- **Typography**: Modern fonts with proper hierarchy

### Visual Enhancements
- **Gradient Buttons**: Primary buttons use ModernMen amber gradient
- **Navigation Styling**: Custom sidebar with ModernMen colors
- **Dashboard Branding**: Custom welcome message and card layouts
- **Responsive Design**: Mobile-friendly admin interface
- **Dark Mode Support**: Automatic dark/light theme switching

## 📊 Collections Structure

### Core Collections
1. **Users** - Authentication and user management with roles (admin, manager, barber, customer)
2. **Tenants** - Multi-tenant support for different salon locations
3. **Appointments** - Booking system with status tracking and payments
4. **Customers** - Customer profiles with loyalty points and preferences
5. **Services** - Service catalog with pricing and duration
6. **Stylists** - Barber profiles with specialties and bio
7. **Media** - Advanced file management with optimization
8. **MediaFolders** - Hierarchical folder organization for media files

### Business Collections
- **ClockRecords** - Staff time tracking and payroll
- **StaffSchedules** - Employee scheduling and availability
- **Orders** - Product sales and inventory management
- **Products** - Retail product catalog
- **Events** - Special events and promotions
- **Testimonials** - Customer reviews and feedback

### Content Management
- **Content** - Dynamic pages and content blocks
- **BusinessDocumentation** - Internal documentation system
- **Settings** - Global and tenant-specific configurations
- **EditorTemplates** - Reusable content templates
- **EditorThemes** - Visual themes for content
- **EditorPlugins** - Content editor extensions

## 🔧 Technical Configuration

### Database Setup
```typescript
db: postgresAdapter({
  pool: {
    connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://localhost:5432/modernmen',
  },
})
```

### Authentication
- **Auto-login** in development mode (admin@modernmen.com / admin123)
- **Role-based access control** with proper permissions
- **Multi-tenant support** with tenant-specific data isolation

### File Upload Configuration
```typescript
upload: {
  staticDir: 'media',
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', ...],
  imageSizes: [
    { name: 'thumbnail', width: 300, height: 300 },
    { name: 'card', width: 600, height: 400 },
    { name: 'hero', width: 1200, height: 600 },
    { name: 'full', width: 1920, height: 1080 }
  ]
}
```

## 🎨 Custom Components

### Logo Component (`/src/components/payload/Logo.tsx`)
```tsx
const Logo = () => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-gradient-to-br from-amber-600 to-amber-700 rounded-md flex items-center justify-center">
      <span className="text-white font-bold text-sm">MM</span>
    </div>
    <span className="text-xl font-bold text-gray-800">ModernMen</span>
    <span className="text-sm text-gray-500 font-medium">Admin</span>
  </div>
);
```

### Icon Component (`/src/components/payload/Icon.tsx`)
```tsx
const Icon = () => (
  <div className="w-6 h-6 bg-gradient-to-br from-amber-600 to-amber-700 rounded flex items-center justify-center">
    <span className="text-white font-bold text-xs">MM</span>
  </div>
);
```

## 🔒 Security Features

### Access Control
- **Role-based permissions** for all collections
- **Tenant-specific access** controls
- **User-specific data** filtering
- **Admin-only operations** for sensitive actions

### Data Validation
- **Field validation** with custom validators
- **File type restrictions** for uploads
- **Size limits** and compression
- **SQL injection protection** via Payload ORM

## 📈 Advanced Features

### Media Management
- **Hierarchical folder structure** with MediaFolders collection
- **Automatic image optimization** with multiple sizes
- **Usage tracking** for media files
- **Permission-based access** control
- **Metadata extraction** and storage

### Business Logic
- **Loyalty point calculation** with tier upgrades
- **Appointment scheduling** with conflict detection
- **Staff time tracking** with shift validation
- **Inventory management** for products
- **Multi-tenant configuration** support

## 🚀 Usage Instructions

### Admin Panel Access
1. Navigate to `/admin` in your browser
2. Login with your credentials (or auto-login in development)
3. Access collections via the sidebar navigation
4. Use the custom ModernMen-themed interface

### API Usage
- **REST API**: Available at `/api/admin/collections`
- **GraphQL**: Auto-generated GraphQL endpoint
- **Custom Endpoints**: Next.js API routes for additional functionality

### Content Management
1. **Create Media Folders**: Organize files in hierarchical structure
2. **Upload Media**: Use the file upload interface with automatic optimization
3. **Manage Users**: Create and manage user accounts with proper roles
4. **Configure Settings**: Use the Settings collection for tenant-specific options

## 🎯 Development Notes

### Environment Variables
```bash
DATABASE_URL=postgresql://localhost:5432/modernmen
PAYLOAD_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### TypeScript Support
- All collections are fully typed
- Custom interfaces for business logic
- Type-safe API responses
- Proper error handling

### Performance Optimizations
- **Database indexes** on frequently queried fields
- **Image optimization** with multiple formats
- **Lazy loading** for large datasets
- **Efficient queries** with proper relationships

## 🔧 Maintenance

### Regular Tasks
- **Database backups** via PostgreSQL tools
- **Media cleanup** for unused files
- **User access reviews** for security
- **Performance monitoring** via built-in metrics

### Troubleshooting
- Check logs in `/api/admin` endpoints
- Verify environment variables
- Test database connectivity
- Review permission settings

---

**ModernMen Payload CMS** is fully configured and ready for production use with complete white labeling, advanced media management, and business-specific functionality.