---
inclusion: always
---


# pnpm Package Management Rules

This project uses **pnpm** as the package manager. Always use pnpm commands for package management operations.

## Package Management Commands
- Use `pnpm install` to install dependencies
- Use `pnpm add <package>` to add new dependencies
- Use `pnpm remove <package>` to remove dependencies
- Use `pnpm run <script>` to run npm scripts
- Use `pnpm dev` to start development server
- Use `pnpm build` to build for production

## Project Structure
- This is a Next.js 15.5.2 project with Payload CMS integration
- Uses TypeScript with strict type checking
- Has a custom icon mapping system in `src/lib/icon-mapping.ts`
- Uses Tailwind CSS for styling
- Lexical editor integration for rich text content

## Key Dependencies
- Next.js 15.5.2
- Payload CMS with SQLite adapter
- Lexical editor for rich text
- Lucide React icons (mapped through custom system)
- Tailwind CSS
- TypeScript

## Build Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests

## Important Notes
- The project uses a custom icon mapping system to avoid lucide-react import issues
- Lexical editor is configured for rich text fields in Payload collections
- ESLint is configured with CommonJS format (`.eslintrc.cjs`)
- All new pages should follow the existing pattern with proper metadata and TypeScript types
description:
globs:
alwaysApply: true
---
