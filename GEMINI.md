# GEMINI.md

## Project Overview

This is a Next.js project for the "Modern Men Hair BarberShop". It's a full-stack application that uses Payload CMS for content management and Supabase for authentication. The frontend is built with React, TypeScript, and Tailwind CSS.

The application has a strong focus on documentation and search functionality. It includes a comprehensive documentation system with role-based access control and a powerful search feature that is integrated with Payload CMS.

### Key Technologies

*   **Framework:** Next.js 14
*   **UI:** React 18, Tailwind CSS, shadcn/ui
*   **Language:** TypeScript
*   **CMS:** Payload CMS
*   **Database:** PostgreSQL (via Supabase and Payload)
*   **Authentication:** NextAuth.js with Supabase Adapter
*   **Testing:** Jest, Playwright
*   **Deployment:** Vercel

## Building and Running

### Prerequisites

*   Node.js
*   pnpm
*   Docker (for local development)

### Initial Setup

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```

2.  **Set up environment variables:**
    Copy the `.env.example` file to `.env.local` and fill in the required values.
    ```bash
    cp .env.example .env.local
    ```

3.  **Start the development server:**
    ```bash
    pnpm dev
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000).

### All-in-One Development Environment

The project includes a unified script to manage all development services (Next.js, Payload, Storybook, etc.).

*   **Start all services:**
    ```bash
    pnpm dev:all
    ```

*   **Stop all services:**
    ```bash
    pnpm dev:stop
    ```

### Building for Production

To create a production build, run:

```bash
pnpm build
```

### Running in Production

To start the application in production mode, run:

```bash
pnpm start
```

### Testing

*   **Unit & Integration Tests (Jest):**
    ```bash
    pnpm test
    ```

*   **End-to-End Tests (Playwright):**
    ```bash
    pnpm test:e2e
    ```

## Development Conventions

### Code Style

*   The project uses ESLint and Prettier for code linting and formatting.
*   Run `pnpm lint` to check for linting errors.
*   Run `pnpm format` to format the code.

### Git Commits

*   This project uses Husky to run pre-commit hooks. The hooks will run the linter and tests before each commit to ensure code quality.

### Documentation

*   The project has a comprehensive documentation system located in the `/src/app/documentation` directory.
*   The documentation is written in MDX and is integrated with the search functionality.

### Search

*   The application has a powerful search feature that is a core part of the user experience.
*   The search functionality is implemented in the `src/lib/search-service.ts` file and is integrated with Payload CMS.
*   The search UI components are located in the `src/components/search` and `src/components/documentation` directories.
