# Testing Guide

This project implements a comprehensive testing strategy with multiple layers to ensure code quality, prevent regressions, and maintain confidence in deployments.

## Testing Pyramid

We follow a testing pyramid approach:

```
┌─────────────────┐
│   E2E Tests     │ ← User workflows, critical paths
│   (Playwright)  │
├─────────────────┤
│ Integration     │ ← API endpoints, database interactions
│   Tests         │
│   (Jest + Supertest)
├─────────────────┤
│   Unit Tests    │ ← Individual functions, components
│   (Jest + RTL)  │
└─────────────────┘
```

## Setup

### Prerequisites

1. **Node.js 18+**
2. **PostgreSQL** (for integration tests)
3. **Redis** (optional, for full integration)

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Environment Setup

Create a `.env.test` file for test-specific configuration:

```bash
# Test Database
DATABASE_URL=postgresql://postgres:test_password@localhost:5432/modernen_test

# Test Redis (optional)
REDIS_URL=redis://localhost:6379

# Test App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Test-specific secrets
PAYLOAD_SECRET=test-payload-secret
NEXTAUTH_SECRET=test-nextauth-secret
```

## Running Tests

### All Tests

```bash
npm test
```

### Unit Tests Only

```bash
npm run test:unit
```

### Integration Tests Only

```bash
npm run test:integration
```

### E2E Tests Only

```bash
npm run test:e2e
```

### Code Coverage

```bash
npm run test:coverage
```

### Watch Mode

```bash
npm run test:watch
```

## Test Structure

```
src/
├── __tests__/
│   ├── unit/           # Unit tests
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── lib/
│   ├── integration/    # Integration tests
│   │   ├── api/
│   │   └── database/
│   └── e2e/           # End-to-end tests
│       ├── booking-flow.spec.ts
│       └── user-auth.spec.ts
├── test-utils/         # Test utilities and helpers
│   ├── test-app.ts
│   ├── test-user.ts
│   └── test-service.ts
```

## Writing Tests

### Unit Tests

Use Jest with React Testing Library for component testing:

```typescript
// src/__tests__/unit/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Hello World</Button>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Tests

Use Supertest for API testing:

```typescript
// src/__tests__/integration/api/appointments.test.ts
import request from 'supertest'
import { createTestApp } from '@/test-utils/test-app'

describe('Appointment API', () => {
  let app: any

  beforeAll(async () => {
    app = await createTestApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('creates appointment successfully', async () => {
    const response = await request(app)
      .post('/api/appointments')
      .send({
        serviceId: 'service-1',
        startTime: '2024-01-01T10:00:00Z',
        customerDetails: {
          firstName: 'John',
          email: 'john@example.com'
        }
      })
      .expect(201)

    expect(response.body).toHaveProperty('id')
  })
})
```

### E2E Tests

Use Playwright for browser automation:

```typescript
// src/__tests__/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test'

test('should book appointment successfully', async ({ page }) => {
  await page.goto('/book')

  // Fill out booking form
  await page.fill('[name="firstName"]', 'John')
  await page.fill('[name="email"]', 'john@example.com')
  await page.click('button[type="submit"]')

  // Verify success
  await expect(page.locator('text=Appointment booked!')).toBeVisible()
})
```

## Test Utilities

### Test App Setup

```typescript
import { createTestApp } from '@/test-utils/test-app'

const app = await createTestApp()
// Use with supertest
```

### Test Data Factories

```typescript
import { createTestUser, createTestStaff } from '@/test-utils/test-user'
import { createTestService } from '@/test-utils/test-service'

const user = await createTestUser({ role: 'customer' })
const staff = await createTestStaff()
const service = await createTestService({ duration: 60, price: 50 })
```

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Push to main/develop branches
- Pull requests
- Manual triggers

### Coverage Reports

- Coverage reports uploaded to Codecov
- Minimum coverage thresholds enforced
- HTML reports available in CI artifacts

### Test Results

- JUnit XML reports for integration with CI tools
- Test results visible in GitHub PRs
- Failed test screenshots/videos captured

## Best Practices

### 1. Test Naming
```typescript
describe('AppointmentBooking', () => {
  describe('when user is authenticated', () => {
    it('should allow booking available slots', () => {
      // Test implementation
    })
  })
})
```

### 2. Test Isolation
- Each test should be independent
- Use beforeEach/afterEach for setup/cleanup
- Mock external dependencies

### 3. Test Data
- Use factories for consistent test data
- Clean up after tests
- Avoid hardcoded IDs

### 4. Assertions
- Test behavior, not implementation
- Use descriptive assertion messages
- Test both positive and negative cases

### 5. Performance
- Keep tests fast
- Use parallel execution when possible
- Mock slow operations (API calls, file I/O)

## Debugging Tests

### Debug Mode

```bash
# Debug specific test
npm run test:unit -- --testNamePattern="Button" --verbose

# Debug with Node inspector
npm run test:unit -- --inspect-brk
```

### Playwright Debugging

```bash
# Run tests with UI mode
npm run test:e2e -- --ui

# Run tests in headed mode
npm run test:e2e -- --headed

# Debug specific test
npm run test:e2e -- --debug booking-flow.spec.ts
```

## Coverage Goals

- **Statements**: 70%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%

Coverage reports are generated automatically and can be viewed at:
- `coverage/lcov-report/index.html` (local)
- Codecov dashboard (CI)

## Contributing

### Before Submitting PRs

1. Run all tests: `npm test`
2. Check coverage: `npm run test:coverage`
3. Ensure no linting errors: `npm run lint`

### Adding New Tests

1. Create test file alongside implementation
2. Follow naming convention: `*.test.ts` or `*.spec.ts`
3. Add tests for edge cases and error conditions
4. Update this documentation if needed

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env.test

2. **Playwright browser issues**
   - Run `npx playwright install`
   - Check system dependencies

3. **Test timeouts**
   - Increase timeout in jest.config.js
   - Check for slow async operations

4. **Coverage not updating**
   - Clear Jest cache: `npx jest --clearCache`
   - Check coverage configuration

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
