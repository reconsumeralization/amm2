---
inclusion: always
---
# PayloadCMS Admin Interface Setup

## Current Issue
The PayloadCMS admin interface is not properly configured, causing 404 errors when accessing `/admin/collections/appointments`.

## Current Setup
- PayloadCMS is configured in [src/payload.config.ts](mdc:src/payload.config.ts)
- Admin route is protected by middleware in [src/middleware.ts](mdc:src/middleware.ts)
- Custom admin page exists at [src/app/admin/page.tsx](mdc:src/app/admin/page.tsx)

## Problem
The project is missing the proper PayloadCMS admin interface integration. PayloadCMS requires specific setup to serve its admin interface through Next.js.

## Solutions

### Option 1: Use Custom Admin Interface (Current)
The project currently uses a custom admin interface instead of the PayloadCMS admin:
- Access admin at `/admin/dashboard`
- Custom components in `/src/components/admin/`
- Custom API routes for data management

### Option 2: Proper PayloadCMS Admin Integration
To use the full PayloadCMS admin interface, you need:

1. **Install PayloadCMS Admin Package**:
```bash
pnpm add @payloadcms/next-payload
```

2. **Create Admin Route Handler**:
```typescript
// src/app/admin/[[...segments]]/route.ts
import { createPayloadClient } from '@payloadcms/next-payload'
import { nextHandler } from '@payloadcms/next-payload'
import config from '../../../payload.config'

const { initPayload } = createPayloadClient({ config })

export const { GET, POST, PUT, DELETE } = nextHandler({
  initPayload,
  secret: process.env.PAYLOAD_SECRET,
})
```

3. **Update PayloadCMS Config**:
```typescript
// src/payload.config.ts
export default buildConfig({
  admin: {
    user: 'users',
    // Ensure admin route is properly configured
    route: '/admin',
  },
  // ... rest of config
})
```

## Current Workaround
Until proper PayloadCMS admin integration is implemented:
- Use the custom admin interface at `/admin/dashboard`
- Access collections through custom API routes
- Use the existing admin components for data management

## Testing Admin Access
1. Ensure you're logged in as an admin user
2. Visit `/admin/dashboard` for the custom interface
3. Use API routes like `/api/appointments` for data operations

## Common Issues
- **404 on `/admin/collections/***: PayloadCMS admin not properly integrated
- **Authentication errors**: Check middleware and session configuration
- **Database connection**: Verify DATABASE_URI environment variable
description:
globs:
alwaysApply: true
---
