---
inclusion: always
---
# PayloadCMS Config Import Rules

## Correct Import Paths
Always use the correct relative path from API routes to the payload config:

### From API Routes
```typescript
// ✅ Correct paths from different API route depths
// From: src/app/api/route.ts
import config from '../../../payload.config';

// From: src/app/api/subfolder/route.ts  
import config from '../../../payload.config';

// From: src/app/api/deep/nested/route.ts
import config from '../../../payload.config';

// ❌ Incorrect paths (too many ../)
import config from '../../../../payload.config';
import config from '../../../../../payload.config';
```

### Import Patterns
Use these patterns for different scenarios:

```typescript
// 1. Direct import (preferred for static imports)
import config from '../../../payload.config';

// 2. Dynamic import with getPayload
const payload = await getPayload({ 
  config: await import('../../../payload.config') 
});

// 3. Dynamic import with default export
const payload = await getPayload({ 
  config: await import('../../../payload.config').then(m => m.default) 
});
```

## File Structure Reference
The payload config is located at [src/payload.config.ts](mdc:src/payload.config.ts).

Relative paths from API routes:
- `src/app/api/route.ts` → `../../../payload.config` (3 levels up)
- `src/app/api/subfolder/route.ts` → `../../../payload.config` (3 levels up)
- `src/app/api/deep/nested/route.ts` → `../../../payload.config` (3 levels up)

## Common Mistakes to Avoid
1. **Too many `../`** - This causes "Module not found" errors
2. **Inconsistent paths** - Use the same pattern across all API routes
3. **Missing `.default`** - When using dynamic imports with `getPayload`

## Verification
To verify the correct path, count the directory levels:
- From any API route: go up 3 levels to reach `src/`
- Then reference `payload.config.ts`

Example path resolution:
```
src/app/api/business-documentation/route.ts
↑ (1) app/
↑ (2) src/
↑ (3) project-root/
→ payload.config.ts
```
description:
globs:
alwaysApply: true
---
