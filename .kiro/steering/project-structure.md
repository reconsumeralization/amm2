---
inclusion: always
---
# ModernMen Hair barber Project Structure

## Core Architecture
This is a Next.js 15 application with PayloadCMS integration for a hair barber management system.

## Key Directories

### `/src/app/` - Next.js App Router
- Main application pages and API routes
- Uses the new App Router structure with `page.tsx` files

### `/src/components/` - React Components
- **`/editor/`** - Lexical rich text editor components
- **`/admin/`** - Admin dashboard components  
- **`/ui/`** - Reusable UI components (shadcn/ui based)
- **`/barber/`** - Barber-specific components
- **`/chatbot/`** - AI chatbot components

### `/src/collections/` - PayloadCMS Collections
- Database schema definitions for all entities
- Includes: Appointments, Customers, Services, Stylists, etc.

### `/src/lib/` - Utility Libraries
- Database connections, API utilities, authentication helpers

### `/src/hooks/` - Custom React Hooks
- Application-specific hooks for state management

### `/src/types/` - TypeScript Type Definitions
- Shared type definitions across the application

## Key Configuration Files

- [package.json](mdc:package.json) - Dependencies and scripts
- [payload.config.ts](mdc:src/payload.config.ts) - PayloadCMS configuration
- [next.config.js](mdc:next.config.js) - Next.js configuration
- [tailwind.config.js](mdc:tailwind.config.js) - Tailwind CSS configuration

## Package Manager
This project uses **pnpm** as the package manager. Always use `pnpm` commands:
```bash
pnpm install
pnpm add <package>
pnpm dev
pnpm build
```

## Environment Setup
- Copy [env.example](mdc:env.example) to `.env.local` for development
- Copy [env.production.example](mdc:env.production.example) for production

## Testing
- Jest configuration in [jest.config.js](mdc:jest.config.js)
- Tests located in `/src/__tests__/`
- Run tests with `pnpm test`

## Documentation
- API documentation in `/docs/`
- Component documentation in Storybook format
description:
globs:
alwaysApply: true
---
