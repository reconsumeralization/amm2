import { CollectionConfig } from 'payload';

export const ChatConversations: CollectionConfig = {
  slug: 'chatbot-conversations',
  admin: {
    useAsTitle: 'id',
    group: 'CRM',
    defaultColumns: ['user', 'chatbot', 'status', 'startedAt', 'lastMessageAt'],
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
    create: ({ req }: any) => {
      // Only authenticated users can create conversations
      return !!req.user;
    },
    update: ({ req }: any) => {
      // Users can only update their own conversations, admins can update any
      if (req.user?.role === 'admin' || req.user?.role === 'system_admin') return true;
      return {
        user: {
          equals: req.user?.id,
        },
      };
    },
    delete: ({ req }: any) => {
      // Only admins can delete conversations
      return req.user?.role === 'admin' || req.user?.role === 'system_admin';
    },
  },
  fields: [
    {
      name: 'conversationId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique identifier for this conversation',
      },
    },
    {
      name: 'chatbot',
      type: 'relationship',
      relationTo: 'chatbots',
      required: true,
      admin: {
        description: 'Chatbot instance used for this conversation',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Tenant this conversation belongs to',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User participating in this conversation',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Closed', value: 'closed' },
        { label: 'Archived', value: 'archived' },
        { label: 'Transferred', value: 'transferred' },
      ],
      defaultValue: 'active',
      admin: {
        description: 'Current status of the conversation',
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: {
        description: 'Optional title or summary of the conversation',
      },
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Booking', value: 'booking' },
        { label: 'Support', value: 'support' },
        { label: 'Information', value: 'information' },
        { label: 'Complaint', value: 'complaint' },
        { label: 'General', value: 'general' },
        { label: 'Appointment', value: 'appointment' },
        { label: 'Service Inquiry', value: 'service_inquiry' },
        { label: 'Staff Inquiry', value: 'staff_inquiry' },
      ],
      admin: {
        description: 'Tags to categorize this conversation',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
      ],
      defaultValue: 'medium',
      admin: {
        description: 'Priority level of this conversation',
      },
    },
    {
      name: 'channel',
      type: 'select',
      options: [
        { label: 'Web Chat', value: 'web_chat' },
        { label: 'Mobile App', value: 'mobile_app' },
        { label: 'API', value: 'api' },
        { label: 'Email', value: 'email' },
        { label: 'SMS', value: 'sms' },
      ],
      defaultValue: 'web_chat',
      admin: {
        description: 'Channel through which the conversation occurred',
      },
    },
    {
      name: 'startedAt',
      type: 'date',
      defaultValue: () => new Date(),
      required: true,
      admin: {
        description: 'When this conversation started',
      },
    },
    {
      name: 'lastMessageAt',
      type: 'date',
      admin: {
        description: 'Timestamp of the last message in this conversation',
      },
    },
    {
      name: 'endedAt',
      type: 'date',
      admin: {
        description: 'When this conversation ended',
      },
    },
    {
      name: 'duration',
      type: 'number',
      admin: {
        description: 'Duration of the conversation in seconds',
      },
    },
    {
      name: 'messageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Total number of messages in this conversation',
      },
    },
    {
      name: 'userMessageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of messages sent by the user',
      },
    },
    {
      name: 'botMessageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of messages sent by the bot',
      },
    },
    {
      name: 'averageResponseTime',
      type: 'number',
      admin: {
        description: 'Average response time for bot messages in milliseconds',
      },
    },
    {
      name: 'satisfactionRating',
      type: 'number',
      min: 1,
      max: 5,
      admin: {
        description: 'User satisfaction rating (1-5 stars)',
      },
    },
    {
      name: 'feedback',
      type: 'textarea',
      admin: {
        description: 'Optional feedback from the user',
      },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Staff member assigned to handle this conversation',
      },
    },
    {
      name: 'transferredFrom',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'Previous assignee if conversation was transferred',
      },
    },
    {
      name: 'transferredAt',
      type: 'date',
      admin: {
        description: 'When the conversation was last transferred',
      },
    },
    {
      name: 'escalationReason',
      type: 'textarea',
      admin: {
        description: 'Reason for escalation if conversation was escalated',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for the conversation',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        description: 'IP address of the user',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        description: 'User agent string',
      },
    },
    {
      name: 'browserInfo',
      type: 'json',
      admin: {
        description: 'Browser and device information',
      },
    },
    {
      name: 'location',
      type: 'group',
      fields: [
        {
          name: 'country',
          type: 'text',
          admin: {
            description: 'User\'s country',
          },
        },
        {
          name: 'city',
          type: 'text',
          admin: {
            description: 'User\'s city',
          },
        },
        {
          name: 'timezone',
          type: 'text',
          admin: {
            description: 'User\'s timezone',
          },
        },
      ],
      admin: {
        description: 'Geographic location information',
      },
    },
    {
      name: 'actionsPerformed',
      type: 'array',
      fields: [
        {
          name: 'actionType',
          type: 'select',
          options: [
            { label: 'Book Appointment', value: 'book_appointment' },
            { label: 'Reschedule Appointment', value: 'reschedule_appointment' },
            { label: 'Cancel Appointment', value: 'cancel_appointment' },
            { label: 'Clock In', value: 'clock_in' },
            { label: 'Clock Out', value: 'clock_out' },
            { label: 'Assign Staff', value: 'assign_staff' },
            { label: 'Generate Hair Preview', value: 'generate_hair_preview' },
            { label: 'Show Services', value: 'show_services' },
            { label: 'Show Staff', value: 'show_staff' },
            { label: 'Show Appointments', value: 'show_appointments' },
          ],
          required: true,
          admin: {
            description: 'Type of action performed',
          },
        },
        {
          name: 'performedAt',
          type: 'date',
          defaultValue: () => new Date(),
          required: true,
          admin: {
            description: 'When the action was performed',
          },
        },
        {
          name: 'data',
          type: 'json',
          admin: {
            description: 'Data associated with the action',
          },
        },
      ],
      admin: {
        description: 'Actions performed during this conversation',
      },
    },
    {
      name: 'resolution',
      type: 'select',
      options: [
        { label: 'Resolved', value: 'resolved' },
        { label: 'Unresolved', value: 'unresolved' },
        { label: 'Transferred', value: 'transferred' },
        { label: 'Abandoned', value: 'abandoned' },
        { label: 'In Progress', value: 'in_progress' },
      ],
      admin: {
        description: 'Resolution status of the conversation',
      },
    },
    {
      name: 'resolutionNotes',
      type: 'textarea',
      admin: {
        description: 'Notes about how the conversation was resolved',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who created this conversation',
        readOnly: true,
      },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who last updated this conversation',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
  indexes: [
    {
      fields: ['conversationId'],
    },
    {
      fields: ['chatbot', 'tenant', 'user'],
    },
    {
      fields: ['status', 'startedAt'],
    },
    {
      fields: ['assignedTo', 'status'],
    },
    {
      fields: ['tenant', 'startedAt'],
    },
  ],
};
