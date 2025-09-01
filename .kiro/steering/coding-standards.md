---
inclusion: always
---
# Coding Standards & Best Practices

## TypeScript
- Use strict TypeScript configuration
- Always define proper types for props, state, and function parameters
- Use interfaces for object shapes, types for unions/primitives
- Prefer `const` over `let`, avoid `var`

## React Patterns
- Use functional components with hooks
- Prefer `'use client'` directive for client-side components
- Use proper dependency arrays in useEffect hooks
- Implement proper error boundaries

## File Naming
- Use PascalCase for components: `ComponentName.tsx`
- Use camelCase for utilities: `utilityFunction.ts`
- Use kebab-case for pages: `page-name.tsx`

## Import Organization
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { LexicalComposer } from '@lexical/react/LexicalComposer';

// 3. Internal components/utilities
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';

// 4. Types
import type { ComponentProps } from '@/types/component';
```

## Error Handling
- Always implement proper error handling in async operations
- Use try-catch blocks for API calls
- Provide meaningful error messages to users
- Log errors for debugging

## Performance
- Use React.memo for expensive components
- Implement proper memoization with useMemo and useCallback
- Lazy load components when appropriate
- Optimize images and assets

## Accessibility
- Use semantic HTML elements
- Include proper ARIA labels
- Ensure keyboard navigation works
- Maintain proper color contrast ratios

## Testing
- Write unit tests for utility functions
- Write integration tests for complex components
- Use React Testing Library for component tests
- Maintain good test coverage

## Documentation
- Add JSDoc comments for complex functions
- Document component props with TypeScript interfaces
- Keep README files updated
- Document API endpoints
description:
globs:
alwaysApply: true
---
