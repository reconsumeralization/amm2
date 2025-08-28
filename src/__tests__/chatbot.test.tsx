import React from 'react';
import { render, screen } from '@testing-library/react';
import { fireEvent, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';
import BookingChatbot from '../components/chatbot/BookingChatbot';

// Mock dependencies
jest.mock('next/navigation', () => ({
  usePathname: () => '/portal',
}));

jest.mock('react-cookie', () => ({
  useCookies: () => [
    { chatbot_display: 'true' },
    jest.fn(),
  ],
}));

// Mock fetch
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Helper function to create proper Response mocks
const createMockResponse = (data: any, options: { ok?: boolean; status?: number } = {}) => {
  const response = {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    statusText: 'OK',
    headers: new Headers(),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    clone: jest.fn(),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    formData: () => Promise.resolve(new FormData()),
    body: null,
    bodyUsed: false,
  } as unknown as Response;
  return Promise.resolve(response);
};

describe('BookingChatbot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful API responses
    mockFetch.mockImplementation((input: string | Request | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/api/settings')) {
        return createMockResponse({
          chatbot: {
            enabled: true,
            displayPaths: [{ path: '/portal' }],
            roles: ['customer', 'staff'],
            behavior: {
              welcomeMessage: 'Hello! How can I help you today?',
            },
          },
          barbershop: {
            services: [
              { name: 'Haircut', price: 25, duration: 30 },
              { name: 'Shave', price: 15, duration: 20 },
            ],
            loyalty: {
              pointsPerBooking: 10,
            },
          },
        });
      }
      
      if (url.includes('/api/users/')) {
        return createMockResponse({ role: 'customer' });
      }
      
      if (url.includes('/api/appointments')) {
        return createMockResponse({ docs: [] });
      }
      
      if (url.includes('/api/users?where[role][equals]=staff')) {
        return createMockResponse({ docs: [] });
      }
      
      if (url.includes('/api/ai/chatbot')) {
        return createMockResponse({
          response: 'I can help you with that!',
          action: null,
          actionData: null,
          step: 'menu',
          bookingData: {},
        });
      }
      
      return createMockResponse({});
    });
  });

  it('renders chatbot when enabled and on allowed path', async () => {
    render(
      <BookingChatbot 
        userId="test-user" 
        tenantId="test-tenant" 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('ModernMen Assistant')).toBeInTheDocument();
    });
  });

  it('shows welcome message from settings', async () => {
    render(
      <BookingChatbot 
        userId="test-user" 
        tenantId="test-tenant" 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
    });
  });

  it('handles user input and sends to AI API', async () => {
    render(
      <BookingChatbot 
        userId="test-user" 
        tenantId="test-tenant" 
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'I want to book an appointment' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/ai/chatbot', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('I want to book an appointment'),
      }));
    });
  });

  it('displays user and bot messages correctly', async () => {
    render(
      <BookingChatbot 
        userId="test-user" 
        tenantId="test-tenant" 
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('I can help you with that!')).toBeInTheDocument();
    });
  });

  it('shows loading indicator while processing', async () => {
    // Mock a delayed response
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => 
        setTimeout(async () => {
          const response = await createMockResponse({
            response: 'Delayed response',
            action: null,
            actionData: null,
            step: 'menu',
            bookingData: {},
          });
          resolve(response);
        }, 100)
      )
    );

    render(
      <BookingChatbot 
        userId="test-user" 
        tenantId="test-tenant" 
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    // Should show loading indicator
    await waitFor(() => {
      expect(sendButton).toBeDisabled();
    });
  });

  it('handles API errors gracefully', async () => {
    mockFetch.mockImplementationOnce(() => 
      createMockResponse({}, { ok: false, status: 500 })
    );

    render(
      <BookingChatbot 
        userId="test-user" 
        tenantId="test-tenant" 
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(screen.getByText("Sorry, I'm having trouble right now. Please try again later.")).toBeInTheDocument();
    });
  });

  it('does not render when chatbot is disabled', async () => {
    mockFetch.mockImplementationOnce(() => 
      createMockResponse({
        chatbot: {
          enabled: false,
        },
      })
    );

    const { container } = render(
      <BookingChatbot 
        userId="test-user" 
        tenantId="test-tenant" 
      />
    );

    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('handles settings loading error', async () => {
    mockFetch.mockImplementationOnce(() => 
      createMockResponse({}, { ok: false, status: 404 })
    );

    render(
      <BookingChatbot 
        userId="test-user" 
        tenantId="test-tenant" 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to initialize chatbot')).toBeInTheDocument();
    });
  });

  it('prevents empty message submission', async () => {
    render(
      <BookingChatbot 
        userId="test-user" 
        tenantId="test-tenant" 
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    const sendButton = screen.getByText('Send');
    
    // Button should be disabled for empty input
    expect(sendButton).toBeDisabled();

    const input = screen.getByPlaceholderText('Type your message...');
    fireEvent.change(input, { target: { value: '   ' } });
    
    // Button should still be disabled for whitespace-only input
    expect(sendButton).toBeDisabled();
  });

  it('handles Enter key submission', async () => {
    render(
      <BookingChatbot 
        userId="test-user" 
        tenantId="test-tenant" 
      />
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText('Type your message...');
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/ai/chatbot', expect.any(Object));
    });
  });
});
