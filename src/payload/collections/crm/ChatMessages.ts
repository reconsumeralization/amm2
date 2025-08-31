import { CollectionConfig } from 'payload';

export const ChatMessages: CollectionConfig = {
  slug: 'chat-messages',
  admin: {
    useAsTitle: 'content',
    group: 'CRM',
    defaultColumns: ['sender', 'content', 'timestamp', 'chatbot'],
  },
  access: {
    read: ({ req }: any) => {
      // Allow reading messages if user is admin or belongs to the same tenant
      if (req.user?.role === 'admin' || req.user?.role === 'system_admin') return true;
      return {
        tenant: {
          equals: req.user?.tenant,
        },
      };
    },
    create: ({ req }: any) => {
      // Only authenticated users can create messages
      return !!req.user;
    },
    update: ({ req }: any) => {
      // Users can only update their own messages, admins can update any
      if (req.user?.role === 'admin' || req.user?.role === 'system_admin') return true;
      return {
        sender: {
          equals: req.user?.id,
        },
      };
    },
    delete: ({ req }: any) => {
      // Only admins can delete messages
      return req.user?.role === 'admin' || req.user?.role === 'system_admin';
    },
  },
  fields: [
    {
      name: 'chatbot',
      type: 'relationship',
      relationTo: 'chatbots',
      required: true,
      admin: {
        description: 'Chatbot instance this message belongs to',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'Tenant this message belongs to',
      },
    },
    {
      name: 'sender',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who sent this message',
      },
    },
    {
      name: 'senderType',
      type: 'select',
      options: [
        { label: 'User', value: 'user' },
        { label: 'Bot', value: 'bot' },
        { label: 'System', value: 'system' },
      ],
      required: true,
      defaultValue: 'user',
      admin: {
        description: 'Type of sender (user, bot, or system)',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Message content',
      },
    },
    {
      name: 'messageType',
      type: 'select',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Image', value: 'image' },
        { label: 'File', value: 'file' },
        { label: 'Action', value: 'action' },
        { label: 'System', value: 'system' },
      ],
      defaultValue: 'text',
      admin: {
        description: 'Type of message content',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for the message (e.g., action data, file info)',
      },
    },
    {
      name: 'attachments',
      type: 'array',
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
          admin: {
            description: 'Uploaded file attachment',
          },
        },
        {
          name: 'filename',
          type: 'text',
          admin: {
            description: 'Original filename',
          },
        },
        {
          name: 'fileType',
          type: 'text',
          admin: {
            description: 'MIME type of the file',
          },
        },
        {
          name: 'fileSize',
          type: 'number',
          admin: {
            description: 'File size in bytes',
          },
        },
      ],
      admin: {
        description: 'File attachments for this message',
      },
    },
    {
      name: 'conversationId',
      type: 'text',
      admin: {
        description: 'Unique identifier for the conversation thread',
      },
    },
    {
      name: 'sequenceNumber',
      type: 'number',
      admin: {
        description: 'Sequence number within the conversation',
      },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this message has been read by the recipient',
      },
    },
    {
      name: 'isDelivered',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this message was successfully delivered',
      },
    },
    {
      name: 'deliveryStatus',
      type: 'select',
      options: [
        { label: 'Sent', value: 'sent' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Read', value: 'read' },
        { label: 'Failed', value: 'failed' },
      ],
      defaultValue: 'sent',
      admin: {
        description: 'Delivery status of the message',
      },
    },
    {
      name: 'timestamp',
      type: 'date',
      defaultValue: () => new Date(),
      required: true,
      admin: {
        description: 'When this message was sent',
      },
    },
    {
      name: 'responseTime',
      type: 'number',
      admin: {
        description: 'Response time in milliseconds (for bot messages)',
      },
    },
    {
      name: 'confidence',
      type: 'number',
      min: 0,
      max: 1,
      admin: {
        description: 'Confidence score for AI-generated responses (0-1)',
      },
    },
    {
      name: 'intent',
      type: 'text',
      admin: {
        description: 'Detected intent from the message (for analytics)',
      },
    },
    {
      name: 'sentiment',
      type: 'select',
      options: [
        { label: 'Positive', value: 'positive' },
        { label: 'Neutral', value: 'neutral' },
        { label: 'Negative', value: 'negative' },
      ],
      admin: {
        description: 'Sentiment analysis result',
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
        { label: 'Praise', value: 'praise' },
        { label: 'Question', value: 'question' },
        { label: 'Appointment', value: 'appointment' },
        { label: 'Service Inquiry', value: 'service_inquiry' },
        { label: 'Staff Inquiry', value: 'staff_inquiry' },
        { label: 'Pricing', value: 'pricing' },
        { label: 'Availability', value: 'availability' },
      ],
      admin: {
        description: 'Tags for categorizing the message content',
      },
    },
    {
      name: 'actions',
      type: 'array',
      fields: [
        {
          name: 'type',
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
            description: 'Type of action that can be performed',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: {
            description: 'Display label for the action button',
          },
        },
        {
          name: 'data',
          type: 'json',
          admin: {
            description: 'Data payload for the action',
          },
        },
        {
          name: 'executedAt',
          type: 'date',
          admin: {
            description: 'When this action was executed',
          },
        },
        {
          name: 'executedBy',
          type: 'relationship',
          relationTo: 'users',
          admin: {
            description: 'User who executed this action',
          },
        },
      ],
      admin: {
        description: 'Available actions or buttons for this message',
      },
    },
    {
      name: 'parentMessage',
      type: 'relationship',
      relationTo: 'chat-messages',
      admin: {
        description: 'Parent message this is a reply to',
      },
    },
    {
      name: 'threadId',
      type: 'text',
      admin: {
        description: 'Thread identifier for grouped conversations',
      },
    },
    {
      name: 'isThreadStarter',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether this message starts a new thread',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      admin: {
        description: 'IP address of the sender (for security logging)',
      },
    },
    {
      name: 'userAgent',
      type: 'text',
      admin: {
        description: 'User agent string (for analytics)',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who created this message',
        readOnly: true,
      },
    },
  ],
  timestamps: true,
  indexes: [
    {
      fields: ['chatbot', 'tenant', 'conversationId'],
    },
    {
      fields: ['sender', 'timestamp'],
    },
    {
      fields: ['tenant', 'timestamp'],
    },
    {
      fields: ['conversationId', 'sequenceNumber'],
    },
  ],
};
