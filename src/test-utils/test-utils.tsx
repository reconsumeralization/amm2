import React from 'react';
import { render } from '@testing-library/react';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Session, User } from 'next-auth';

// Create a mock session with proper typing
const createMockSession = (overrides?: Partial<Session>): Session => ({
  user: {
    id: 'test-user-123',
    email: 'test@test.com',
    name: 'Test User',
    image: undefined,
    role: 'customer',
    ...overrides?.user,
  },
  ...overrides,
});

interface AllTheProvidersProps {
  children: React.ReactNode;
  session?: Session | null;
  queryClient?: QueryClient;
}

const AllTheProviders = ({ 
  children, 
  session = createMockSession(),
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
        gcTime: Infinity, // Prevent garbage collection during tests
      },
      mutations: {
        retry: false,
      },
    },
  }),
}: AllTheProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        {children}
      </SessionProvider>
    </QueryClientProvider>
  );
};

interface CustomRenderOptions {
  session?: Session | null;
  queryClient?: QueryClient;
}

const customRender = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { session, queryClient, ...renderOptions } = options;
  
  return render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <AllTheProviders session={session} queryClient={queryClient}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Helper function to create test users with different roles
export const createTestUser = (role: 'admin' | 'manager' | 'barber' | 'customer' = 'customer'): User => ({
  id: `test-${role}-${Date.now()}`,
  email: `${role}@test.com`,
  name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
  image: undefined,
  role,
});

// Helper function to create sessions for different user types
export const createTestSession = (role?: 'admin' | 'manager' | 'barber' | 'customer'): Session => 
  createMockSession({ user: createTestUser(role) });

// Helper function to create a clean query client for each test
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
      gcTime: Infinity,
    },
    mutations: {
      retry: false,
    },
  },
});

// Helper function to wait for queries to settle
export const waitForQueries = async (queryClient: QueryClient) => {
  await queryClient.getQueryCache().clear();
  await queryClient.getMutationCache().clear();
};

// Mock data generators for common entities
export const createMockService = (overrides?: Partial<any>) => ({
  id: `service-${Date.now()}`,
  name: 'Test Service',
  category: 'haircut',
  description: 'Test service description',
  price: 50,
  duration: 60,
  isActive: true,
  ...overrides,
});

export const createMockStylist = (overrides?: Partial<any>) => ({
  id: `stylist-${Date.now()}`,
  name: 'Test Stylist',
  bio: 'Test stylist bio',
  specializations: ['haircut', 'color'],
  rating: 4.5,
  isActive: true,
  ...overrides,
});

export const createMockBooking = (overrides?: Partial<any>) => ({
  id: `booking-${Date.now()}`,
  date: new Date().toISOString(),
  startTime: '10:00',
  endTime: '11:00',
  status: 'confirmed',
  notes: '',
  ...overrides,
});

export * from '@testing-library/react';
export { customRender as render, createMockSession, AllTheProviders };
