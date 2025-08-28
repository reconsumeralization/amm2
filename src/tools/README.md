# Development Tools

The `src/tools` directory contains a collection of utility scripts that help with common development tasks for the Modern Men Hair Salon project.

## Scripts

| Script | Description | Run Command |
|--------|-------------|-------------|
| `generate-payload-types.ts` | Generates TypeScript types for all Payload collections and writes them to `src/payload-types.ts`. | `npm run tools:generate-types` |
| `seed-database.ts` | Populates the Payload PostgreSQL database with demo data from JSON seed files located in `src/tools/seeds/`. | `npm run tools:seed-db` |
| `run-lint-fix.ts` | Executes ESLint with the `--fix` flag across the entire codebase and prints a summary. | `npm run tools:lint-fix` |
| `export-docs.ts` | Exports all documents from the Payload `Documentation` collection to markdown files (including front‑matter). | `npm run tools:export-docs` |
| `deploy-vercel.ts` | Builds the Next.js app and deploys it to Vercel using the Vercel CLI. | `npm run tools:deploy` |

## Usage Details

### 1. Generate Payload Types
```bash
npm run tools:generate-types
```
Creates/overwrites `src/payload-types.ts` with up‑to‑date type definitions.

### 2. Seed Database
Place JSON seed files (e.g., `users.json`, `services.json`) in `src/tools/seeds/`. Then run:
```bash
npm run tools:seed-db
```
The script will read each file and create the corresponding records via the Payload API.

### 3. Lint & Auto‑Fix
```bash
npm run tools:lint-fix
```
Runs ESLint with `--fix` on all `.ts` and `.tsx` files.

### 4. Export Documentation
```bash
npm run tools:export-docs -- --output ./my-docs
```
Exports each documentation entry to a markdown file in the specified output directory (defaults to `exported-docs`).

### 5. Deploy to Vercel
```bash
npm run tools:deploy
```
Builds the project and deploys the production build to Vercel.

---

All scripts are written in TypeScript and can be executed directly with `ts-node` (the shebang `#!/usr/bin/env ts-node` is included). Ensure you have the necessary environment variables (e.g., database connection, Payload secret) configured before running the scripts.
