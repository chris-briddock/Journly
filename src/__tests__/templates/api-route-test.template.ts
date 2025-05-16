// /**
//  * Template for API route tests
//  * 
//  * Instructions:
//  * 1. Copy this file to src/__tests__/unit/api/your-route.test.ts
//  * 2. Replace YourApiRoute with the name of the API route you're testing
//  * 3. Update the imports to import your API route handler
//  * 4. Update the test cases to test your API route
//  */

// import { createApiRouteTestContext } from '@/__tests__/utils/api-route-test-utils';
// import { createMockSession, createMockUnauthenticatedSession } from '@/__tests__/utils/auth-test-utils';
// import { createMockPrismaClient, mockData } from '@/__tests__/utils/prisma-test-utils';
// import { NextRequest, NextResponse } from 'next/server';

// // Import the API route handler you want to test
// // import { GET, POST, PUT, DELETE } from '@/app/api/your-route/route';

// // Mock the Prisma client
// jest.mock('@/lib/prisma', () => {
//   return {
//     __esModule: true,
//     default: createMockPrismaClient(),
//   };
// });

// // Mock the auth function
// jest.mock('next-auth', () => {
//   return {
//     __esModule: true,
//     auth: jest.fn(),
//   };
// });

// describe('YourApiRoute API', () => {
//   // Reset mocks before each test
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('GET handler', () => {
//     it('returns the expected data', async () => {
//       // Setup
//       const { request, auth } = createApiRouteTestContext();
      
//       // Mock Prisma response
//       // Example: prisma.yourModel.findMany.mockResolvedValueOnce(mockData.yourData);
      
//       // Execute
//       // const response = await GET(request);
      
//       // Verify
//       // expect(response.status).toBe(200);
//       // const data = await response.json();
//       // expect(data).toEqual(expect.objectContaining({ /* expected data */ }));
//     });

//     it('handles errors gracefully', async () => {
//       // Setup
//       const { request, auth } = createApiRouteTestContext();
      
//       // Mock Prisma error
//       // Example: prisma.yourModel.findMany.mockRejectedValueOnce(new Error('Database error'));
      
//       // Execute
//       // const response = await GET(request);
      
//       // Verify
//       // expect(response.status).toBe(500);
//       // const data = await response.json();
//       // expect(data).toEqual(expect.objectContaining({ error: expect.any(String) }));
//     });
//   });

//   describe('POST handler', () => {
//     it('creates a new resource', async () => {
//       // Setup
//       const newResource = { /* new resource data */ };
//       const { request, auth } = createApiRouteTestContext({
//         method: 'POST',
//         body: newResource,
//       });
      
//       // Mock Prisma response
//       // Example: prisma.yourModel.create.mockResolvedValueOnce({ id: 'new-id', ...newResource });
      
//       // Execute
//       // const response = await POST(request);
      
//       // Verify
//       // expect(response.status).toBe(201);
//       // const data = await response.json();
//       // expect(data).toEqual(expect.objectContaining({ id: 'new-id', ...newResource }));
//     });

//     it('requires authentication', async () => {
//       // Setup
//       const { request, auth } = createApiRouteTestContext({
//         method: 'POST',
//         body: { /* new resource data */ },
//         session: createMockUnauthenticatedSession(),
//       });
      
//       // Execute
//       // const response = await POST(request);
      
//       // Verify
//       // expect(response.status).toBe(401);
//       // const data = await response.json();
//       // expect(data).toEqual(expect.objectContaining({ error: 'Unauthorized' }));
//     });

//     it('validates input data', async () => {
//       // Setup
//       const { request, auth } = createApiRouteTestContext({
//         method: 'POST',
//         body: { /* invalid data */ },
//       });
      
//       // Execute
//       // const response = await POST(request);
      
//       // Verify
//       // expect(response.status).toBe(400);
//       // const data = await response.json();
//       // expect(data).toEqual(expect.objectContaining({ error: expect.any(String) }));
//     });
//   });

//   // Add similar tests for PUT and DELETE handlers
// });
