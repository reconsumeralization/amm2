---
inclusion: always
---

# 🎯 Cursor Rules Master Guide

Welcome to the **Modern Men Hair BarberShop** project! This comprehensive rule set will help you navigate, understand, and contribute effectively to our codebase.

## 📚 Available Rules

### **Core Navigation Rules:**
1. **[Payload Structure](payload-structure.mdc)** - CMS collections and database patterns
2. **[API Patterns](api-patterns.mdc)** - REST API routes and conventions
3. **[Builder System](builder-system.mdc)** - Visual page builder with 19 collections
4. **[Component Organization](component-organization.mdc)** - React components and hooks
5. **[Styling Patterns](styling-patterns.mdc)** - Tailwind CSS and theming
6. **[File Organization](file-organization.mdc)** - Directory structure and imports
7. **[Testing Patterns](testing-patterns.mdc)** - Jest and testing best practices
8. **[Project Patterns](project-patterns.mdc)** - Overall development conventions

## 🏗️ Project Architecture

### **Technology Stack:**
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: PayloadCMS 3.0 (MongoDB)
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: NextAuth.js
- **Database**: MongoDB
- **Deployment**: Vercel

### **Key Features:**
- ✅ **Visual Page Builder** - 19 collections for drag-and-drop content
- ✅ **Multi-tenant Architecture** - Support for multiple businesses
- ✅ **Role-based Access Control** - Admin, Manager, Editor, User roles
- ✅ **SEO Optimization** - Built-in meta tags and Open Graph
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Real-time Updates** - Live preview and instant feedback

## 🚀 Quick Start Guide

### **For New Developers:**

1. **Clone and Install:**
   ```bash
   git clone <repository-url>
   cd modernmen-yolo
   pnpm install
   ```

2. **Environment Setup:**
   ```bash
   cp .env.example .env.local
   # Fill in your environment variables
   ```

3. **Development:**
   ```bash
   pnpm run dev          # Start development server
   pnpm run build        # Production build
   pnpm run type-check   # TypeScript checking
   pnpm run test         # Run tests
   ```

### **Understanding the Codebase:**

1. **Start with [Project Patterns](project-patterns.mdc)** for overall conventions
2. **Read [Payload Structure](payload-structure.mdc)** to understand the CMS
3. **Explore [Builder System](builder-system.mdc)** for visual page creation
4. **Check [API Patterns](api-patterns.mdc)** for backend integration
5. **Review [Component Organization](component-organization.mdc)** for frontend patterns

## 📁 Key Directories

### **Frontend Structure:**
```
src/
├── app/              # Next.js App Router (pages & API routes)
├── components/       # React components by feature
├── hooks/            # Custom React hooks
├── lib/              # Utilities & shared logic
├── types/            # TypeScript definitions
├── utils/            # Helper functions
└── payload/          # CMS configuration
```

### **Backend Structure:**
```
src/payload/
├── collections/     # Database collections by domain
│   ├── builder/     # Visual page builder (19 collections)
│   ├── commerce/    # E-commerce functionality
│   ├── crm/         # Customer relationship management
│   ├── content/     # Content management system
│   └── staff/       # Staff management system
├── components/      # Admin interface components
├── hooks/           # Payload-specific hooks
└── endpoints/       # Custom API endpoints
```

## 🎯 Development Workflow

### **Feature Development:**
```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Follow established patterns (see rules)
# 3. Write tests for new functionality
# 4. Update documentation if needed

# 5. Commit with conventional format
git commit -m "feat: add new feature description"

# 6. Push and create PR
git push origin feature/new-feature
```

### **Code Quality Checks:**
```bash
# Type checking
pnpm run type-check

# Linting
pnpm run lint

# Testing
pnpm run test

# Build verification
pnpm run build
```

## 🔧 Essential Patterns

### **Component Creation:**
```typescript
// Use TypeScript interfaces
interface ComponentProps {
  title: string
  onAction?: () => void
  variant?: 'primary' | 'secondary'
}

// Follow naming conventions
export function UserProfile({ title, onAction, variant = 'primary' }: ComponentProps) {
  // Implementation
}
```

### **API Route Structure:**
```typescript
// Consistent error handling
export async function GET() {
  try {
    const data = await getData()
    return createSuccessResponse(data)
  } catch (error) {
    return createErrorResponse('Error occurred', 'ERROR_CODE', 500)
  }
}
```

### **Database Operations:**
```typescript
// Use Payload's built-in methods
const users = await payload.find({
  collection: 'users',
  where: {
    role: { equals: 'admin' }
  }
})
```

## 🎨 Design System

### **Color Palette:**
- **Primary**: Blue (#3b82f6)
- **Secondary**: Gray (#64748b)
- **Success**: Green (#10b981)
- **Error**: Red (#ef4444)

### **Typography:**
- **Headings**: Inter (font-inter)
- **Body**: System font stack
- **Monospace**: For code blocks

### **Component Library:**
- **UI Components**: shadcn/ui based
- **Icons**: Lucide React
- **Styling**: Tailwind CSS utilities

## 🧪 Testing Strategy

### **Test Types:**
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API routes and database operations
- **E2E Tests**: Full user workflows with Playwright

### **Testing Commands:**
```bash
# Unit tests
pnpm run test:unit

# Integration tests
pnpm run test:integration

# E2E tests
pnpm run test:e2e

# All tests
pnpm run test
```

## 🚀 Deployment

### **Environment Variables:**
```env
# Database
DATABASE_URI=mongodb://localhost:27017/modernmen

# Authentication
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# Payload CMS
PAYLOAD_SECRET=your-payload-secret

# External Services
STRIPE_SECRET_KEY=sk_test_...
SMTP_HOST=smtp.gmail.com
```

### **Build Process:**
```bash
# Development
pnpm run dev

# Production build
pnpm run build

# Deploy to Vercel
pnpm run deploy:vercel
```

## 📋 Contribution Guidelines

### **Code Style:**
- ✅ Use TypeScript for all new code
- ✅ Follow ESLint and Prettier configurations
- ✅ Use conventional commit messages
- ✅ Write tests for new features
- ✅ Update documentation as needed

### **Pull Request Process:**
1. **Create feature branch** from `main`
2. **Follow established patterns** from these rules
3. **Write comprehensive tests**
4. **Update relevant documentation**
5. **Request code review**
6. **Merge after approval**

## 🆘 Troubleshooting

### **Common Issues:**

#### **Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check TypeScript errors
pnpm run type-check
```

#### **Database Issues:**
```bash
# Reset Payload database
pnpm run db:reset

# Generate types after schema changes
pnpm run generate:types
```

#### **Styling Issues:**
```bash
# Clear Tailwind cache
rm -rf .next/cache

# Rebuild CSS
pnpm run build
```

## 📞 Getting Help

### **Resources:**
- **Documentation**: Check `/docs` folder
- **Issues**: GitHub Issues for bugs and features
- **Discussions**: GitHub Discussions for questions
- **Code Examples**: Look at existing components and API routes

### **Best Practices:**
- **Search existing code** before creating new patterns
- **Follow established conventions** from these rules
- **Ask questions** in GitHub Discussions
- **Document new patterns** when established

## 🎉 Welcome to the Team!

You're now equipped with everything needed to contribute effectively to the **Modern Men Hair BarberShop** project. These rules ensure consistent, maintainable, and scalable code across the entire application.

**Happy coding! 🚀**