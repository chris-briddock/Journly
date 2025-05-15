# Testing Guide

This guide provides instructions for writing and running tests for the application.

## Test Structure

Tests are organized into the following directories:

- `__tests__/unit`: Unit tests for individual components, functions, and API routes
- `__tests__/integration`: Integration tests that test multiple components or API routes together
- `__tests__/e2e`: End-to-end tests that test the application as a whole
- `__tests__/utils`: Utility functions for testing
- `__tests__/templates`: Template files for creating new tests
- `__tests__/__mocks__`: Mock files for testing

## Running Tests

### Running All Tests

```bash
npm test
```

### Running Unit Tests

```bash
npm test -- src/__tests__/unit
```

### Running Integration Tests

```bash
npm test -- src/__tests__/integration
```

### Running E2E Tests

```bash
npm test -- src/__tests__/e2e
```

### Running Tests for a Specific File

```bash
npm test -- src/__tests__/unit/components/LoginForm.test.tsx
```

### Running Tests with Coverage

```bash
npm test -- --coverage
```

## Writing Tests

### Unit Tests

Unit tests should test individual components, functions, or API routes in isolation. They should not depend on external services or databases.

#### Testing Components

Use the `render` function from `@/__tests__/utils/test-utils` to render components:

```tsx
import { render, screen } from '@/__tests__/utils/test-utils';
import YourComponent from '@/app/components/YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Some Text')).toBeInTheDocument();
  });
});
```

#### Testing API Routes

Use the `createApiRouteTestContext` function from `@/__tests__/utils/api-route-test-utils` to test API routes:

```tsx
import { createApiRouteTestContext } from '@/__tests__/utils/api-route-test-utils';
import { GET } from '@/app/api/your-route/route';

describe('YourApiRoute API', () => {
  it('returns the expected data', async () => {
    const { request } = createApiRouteTestContext();
    const response = await GET(request);
    expect(response.status).toBe(200);
  });
});
```

#### Testing Utility Functions

Test utility functions directly:

```tsx
import { utilityFunction } from '@/lib/your-utility';

describe('utilityFunction', () => {
  it('returns the expected result', () => {
    expect(utilityFunction('input')).toBe('expected output');
  });
});
```

### Integration Tests

Integration tests should test multiple components or API routes together. They should not depend on external services or databases.

### E2E Tests

E2E tests should test the application as a whole. They may depend on external services or databases.

## Test Utilities

### test-utils.tsx

Provides utilities for testing React components:

- `render`: Renders a component with all providers
- `renderWithoutProviders`: Renders a component without any providers
- `screen`: Provides methods to query the rendered component
- `waitFor`: Waits for a condition to be true
- `within`: Provides methods to query within a specific element

### auth-test-utils.ts

Provides utilities for testing authentication:

- `createMockUser`: Creates a mock user
- `createMockSession`: Creates a mock session
- `createMockAdminUser`: Creates a mock admin user
- `createMockEditorUser`: Creates a mock editor user
- `createMockAdminSession`: Creates a mock admin session
- `createMockEditorSession`: Creates a mock editor session
- `createMockUnauthenticatedSession`: Creates a mock unauthenticated session

### api-route-test-utils.ts

Provides utilities for testing API routes:

- `createMockRequest`: Creates a mock NextRequest
- `createMockParams`: Creates mock params for API route handlers
- `createJsonResponse`: Creates a NextResponse with JSON data
- `mockAuth`: Mocks the auth function from next-auth
- `createApiRouteTestContext`: Creates a test context for API route handlers

### prisma-test-utils.ts

Provides utilities for testing with Prisma:

- `createMockPrismaClient`: Creates a mock Prisma client
- `mockData`: Provides mock data for testing

## Test Templates

Use the templates in the `__tests__/templates` directory to create new tests:

- `component-test.template.tsx`: Template for component tests
- `api-route-test.template.ts`: Template for API route tests
- `utility-test.template.ts`: Template for utility function tests

## Best Practices

1. **Test in isolation**: Each test should be independent of other tests.
2. **Mock external dependencies**: Use Jest's mocking capabilities to mock external dependencies.
3. **Test edge cases**: Test both the happy path and edge cases.
4. **Keep tests simple**: Each test should test one thing.
5. **Use descriptive test names**: Test names should describe what the test is testing.
6. **Clean up after tests**: Reset mocks and clean up any side effects after each test.
7. **Use the testing utilities**: Use the provided testing utilities to make testing easier.
8. **Follow the AAA pattern**: Arrange, Act, Assert.
9. **Test behavior, not implementation**: Test what the component does, not how it does it.
10. **Keep tests fast**: Tests should run quickly to provide fast feedback.
