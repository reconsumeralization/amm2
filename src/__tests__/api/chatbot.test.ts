import { NextRequest } from 'next/server';
import { POST } from '../../app/api/ai/chatbot/route';

// Mock dependencies
jest.mock('payload', () => ({
  getPayload: jest.fn(() => Promise.resolve({})),
}));

jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                response: 'I can help you with that!',
                action: null,
                actionData: null,
                step: 'menu',
                bookingData: {},
              }),
            },
          }],
        }),
      },
    },
  })),
}));

describe('/api/ai/chatbot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns error for missing required fields', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/chatbot', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing required fields');
  });

  it('processes valid message and returns AI response', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/chatbot', {
      method: 'POST',
      body: JSON.stringify({
        message: 'I want to book an appointment',
        step: 'menu',
        bookingData: {},
        appointments: [],
        staff: [],
        services: [],
        userId: 'test-user',
        tenantId: 'test-tenant',
        settings: {},
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toBe('I can help you with that!');
    expect(data.action).toBeNull();
    expect(data.step).toBe('menu');
  });

  it('handles AI API errors gracefully', async () => {
    const { default: OpenAI } = require('openai');
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockRejectedValue(new Error('OpenAI API error')),
        },
      },
    }));

    const req = new NextRequest('http://localhost:3000/api/ai/chatbot', {
      method: 'POST',
      body: JSON.stringify({
        message: 'I want to book an appointment',
        step: 'menu',
        bookingData: {},
        appointments: [],
        staff: [],
        services: [],
        userId: 'test-user',
        tenantId: 'test-tenant',
        settings: {},
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toContain('I can help you book appointments');
  });

  it('handles malformed JSON response from AI', async () => {
    const { default: OpenAI } = require('openai');
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'Invalid JSON response',
              },
            }],
          }),
        },
      },
    }));

    const req = new NextRequest('http://localhost:3000/api/ai/chatbot', {
      method: 'POST',
      body: JSON.stringify({
        message: 'I want to book an appointment',
        step: 'menu',
        bookingData: {},
        appointments: [],
        staff: [],
        services: [],
        userId: 'test-user',
        tenantId: 'test-tenant',
        settings: {},
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toBe('Invalid JSON response');
  });

  it('handles booking flow correctly', async () => {
    const { default: OpenAI } = require('openai');
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  response: 'What service would you like?',
                  action: null,
                  actionData: null,
                  step: 'selectService',
                  bookingData: { service: 'Haircut' },
                }),
              },
            }],
          }),
        },
      },
    }));

    const req = new NextRequest('http://localhost:3000/api/ai/chatbot', {
      method: 'POST',
      body: JSON.stringify({
        message: 'I want a haircut',
        step: 'menu',
        bookingData: {},
        appointments: [],
        staff: [],
        services: [{ name: 'Haircut' }, { name: 'Shave' }],
        userId: 'test-user',
        tenantId: 'test-tenant',
        settings: {},
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toBe('What service would you like?');
    expect(data.step).toBe('selectService');
    expect(data.bookingData.service).toBe('Haircut');
  });

  it('handles action requests correctly', async () => {
    const { default: OpenAI } = require('openai');
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: JSON.stringify({
                  response: 'I\'ll clock you in now.',
                  action: 'clock_in',
                  actionData: { staffId: 'test-user' },
                  step: 'menu',
                  bookingData: {},
                }),
              },
            }],
          }),
        },
      },
    }));

    const req = new NextRequest('http://localhost:3000/api/ai/chatbot', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Clock me in',
        step: 'menu',
        bookingData: {},
        appointments: [],
        staff: [],
        services: [],
        userId: 'test-user',
        tenantId: 'test-tenant',
        settings: {},
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toBe('I\'ll clock you in now.');
    expect(data.action).toBe('clock_in');
    expect(data.actionData.staffId).toBe('test-user');
  });

  it('handles fallback responses for unknown actions', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/chatbot', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Show me my appointments',
        step: 'menu',
        bookingData: {},
        appointments: [
          { id: '1', service: 'Haircut', date: '2025-01-15T10:00:00Z' },
        ],
        staff: [],
        services: [],
        userId: 'test-user',
        tenantId: 'test-tenant',
        settings: {},
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toContain('Your appointments:');
    expect(data.response).toContain('Haircut');
  });

  it('handles empty appointments list', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/chatbot', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Show me my appointments',
        step: 'menu',
        bookingData: {},
        appointments: [],
        staff: [],
        services: [],
        userId: 'test-user',
        tenantId: 'test-tenant',
        settings: {},
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toContain("You don't have any appointments scheduled");
  });

  it('handles services request', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/chatbot', {
      method: 'POST',
      body: JSON.stringify({
        message: 'What services do you offer?',
        step: 'menu',
        bookingData: {},
        appointments: [],
        staff: [],
        services: [
          { name: 'Haircut', price: 25, duration: 30 },
          { name: 'Shave', price: 15, duration: 20 },
        ],
        userId: 'test-user',
        tenantId: 'test-tenant',
        settings: {},
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toContain('Available services:');
    expect(data.response).toContain('Haircut');
    expect(data.response).toContain('Shave');
  });

  it('handles staff request', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/chatbot', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Who is available?',
        step: 'menu',
        bookingData: {},
        appointments: [],
        staff: [
          { id: '1', name: 'John Doe', specialties: 'Haircuts' },
          { id: '2', name: 'Jane Smith', specialties: 'Shaves' },
        ],
        services: [],
        userId: 'test-user',
        tenantId: 'test-tenant',
        settings: {},
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toContain('Available staff:');
    expect(data.response).toContain('John Doe');
    expect(data.response).toContain('Jane Smith');
  });

  it('handles empty staff list', async () => {
    const req = new NextRequest('http://localhost:3000/api/ai/chatbot', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Who is available?',
        step: 'menu',
        bookingData: {},
        appointments: [],
        staff: [],
        services: [],
        userId: 'test-user',
        tenantId: 'test-tenant',
        settings: {},
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.response).toContain('No staff members are currently available');
  });
});
