import { CollectionConfig } from 'payload';

export const Chatbot: CollectionConfig = {
  slug: 'chatbots',
  admin: {
    useAsTitle: 'name',
    group: 'CRM',
  },
  access: {
    read: ({ req }: any) => {
      // Allow reading if user is admin or belongs to the same tenant
      if (req.user?.role === 'admin' || req.user?.role === 'system_admin') return true;
      return {
        tenant: {
          equals: req.user?.tenant,
        },
      };
    },
    create: ({ req }: any) => req.user?.role === 'admin' || req.user?.role === 'system_admin',
    update: ({ req }: any) => {
      if (req.user?.role === 'admin' || req.user?.role === 'system_admin') return true;
      return {
        tenant: {
          equals: req.user?.tenant,
        },
      };
    },
    delete: ({ req }: any) => req.user?.role === 'admin' || req.user?.role === 'system_admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name for this chatbot instance',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      admin: {
        description: 'Tenant this chatbot belongs to',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this chatbot is currently active',
      },
    },
    {
      name: 'settings',
      type: 'group',
      fields: [
        {
          name: 'welcomeMessage',
          type: 'textarea',
          defaultValue: 'Hello! How can I help you today? (book, reschedule, cancel, suggest times, assign staff, clock in/out)',
          admin: {
            description: 'Welcome message shown when chatbot starts',
          },
        },
        {
          name: 'displayPaths',
          type: 'array',
          fields: [
            {
              name: 'path',
              type: 'text',
              required: true,
              admin: {
                description: 'URL path pattern where chatbot should appear (e.g., /services, /book)',
              },
            },
          ],
          admin: {
            description: 'Paths where the chatbot should be displayed',
          },
        },
        {
          name: 'allowedRoles',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Customer', value: 'customer' },
            { label: 'Staff', value: 'staff' },
            { label: 'Manager', value: 'manager' },
            { label: 'Admin', value: 'admin' },
          ],
          defaultValue: ['customer', 'staff'],
          admin: {
            description: 'User roles that can interact with this chatbot',
          },
        },
        {
          name: 'aiTriggers',
          type: 'group',
          fields: [
            {
              name: 'pendingAppointments',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show chatbot when user has pending appointments',
              },
            },
            {
              name: 'staffAvailability',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show chatbot when staff are available',
              },
            },
            {
              name: 'newServices',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Show chatbot to promote new services',
              },
            },
          ],
          admin: {
            description: 'AI-driven triggers for showing the chatbot',
          },
        },
        {
          name: 'behavior',
          type: 'group',
          fields: [
            {
              name: 'autoOpen',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Automatically open chatbot on eligible pages',
              },
            },
            {
              name: 'typingIndicator',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description: 'Show typing indicator while bot is responding',
              },
            },
            {
              name: 'maxRetries',
              type: 'number',
              defaultValue: 3,
              min: 1,
              max: 10,
              admin: {
                description: 'Maximum number of retries for failed API calls',
              },
            },
          ],
          admin: {
            description: 'Behavioral settings for the chatbot',
          },
        },
        {
          name: 'styles',
          type: 'group',
          fields: [
            {
              name: 'position',
              type: 'select',
              options: [
                { label: 'Bottom Right', value: 'bottom-right' },
                { label: 'Bottom Left', value: 'bottom-left' },
                { label: 'Top Right', value: 'top-right' },
                { label: 'Top Left', value: 'top-left' },
              ],
              defaultValue: 'bottom-right',
              admin: {
                description: 'Position of the chatbot on the page',
              },
            },
            {
              name: 'backgroundColor',
              type: 'text',
              defaultValue: '#ffffff',
              admin: {
                description: 'Background color of the chat window',
              },
            },
            {
              name: 'borderRadius',
              type: 'text',
              defaultValue: '8px',
              admin: {
                description: 'Border radius for the chat window',
              },
            },
            {
              name: 'maxWidth',
              type: 'text',
              defaultValue: '400px',
              admin: {
                description: 'Maximum width of the chat window',
              },
            },
          ],
          admin: {
            description: 'Visual styling for the chatbot',
          },
        },
      ],
      admin: {
        description: 'Configuration settings for this chatbot',
      },
    },
    {
      name: 'analytics',
      type: 'group',
      fields: [
        {
          name: 'totalConversations',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total number of conversations',
            readOnly: true,
          },
        },
        {
          name: 'totalMessages',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Total number of messages exchanged',
            readOnly: true,
          },
        },
        {
          name: 'averageResponseTime',
          type: 'number',
          admin: {
            description: 'Average response time in milliseconds',
            readOnly: true,
          },
        },
        {
          name: 'satisfactionRate',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'User satisfaction rate (0-100%)',
            readOnly: true,
          },
        },
        {
          name: 'lastActivity',
          type: 'date',
          admin: {
            description: 'Last time this chatbot was used',
            readOnly: true,
          },
        },
      ],
      admin: {
        description: 'Analytics and usage statistics',
        readOnly: true,
      },
    },
    {
      name: 'integration',
      type: 'group',
      fields: [
        {
          name: 'openaiApiKey',
          type: 'text',
          admin: {
            description: 'OpenAI API key for AI responses (leave empty to use global key)',
          },
        },
        {
          name: 'model',
          type: 'select',
          options: [
            { label: 'GPT-4', value: 'gpt-4' },
            { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
            { label: 'GPT-4 Turbo', value: 'gpt-4-turbo-preview' },
          ],
          defaultValue: 'gpt-3.5-turbo',
          admin: {
            description: 'AI model to use for responses',
          },
        },
        {
          name: 'temperature',
          type: 'number',
          min: 0,
          max: 2,
          defaultValue: 0.7,
          admin: {
            description: 'Creativity level (0 = deterministic, 2 = very creative)',
          },
        },
        {
          name: 'maxTokens',
          type: 'number',
          min: 50,
          max: 2000,
          defaultValue: 500,
          admin: {
            description: 'Maximum tokens for AI responses',
          },
        },
      ],
      admin: {
        description: 'AI integration settings',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        description: 'User who created this chatbot',
        readOnly: true,
      },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        description: 'User who last updated this chatbot',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
};
