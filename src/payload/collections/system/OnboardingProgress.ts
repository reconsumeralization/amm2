import type { CollectionConfig } from 'payload';

export const OnboardingProgress: CollectionConfig = {
  slug: 'onboarding-progress',
  admin: {
    useAsTitle: 'user',
    group: 'Onboarding',
    description: 'Track user progress through onboarding',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || { user: { equals: req.user?.id } },
    create: ({ req }) => req.user?.role === 'admin' || { user: { equals: req.user?.id } },
    update: ({ req }) => req.user?.role === 'admin' || { user: { equals: req.user?.id } },
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User whose onboarding progress this tracks',
      },
    },
    {
      name: 'userType',
      type: 'select',
      required: true,
      options: [
        { label: 'Customer', value: 'customer' },
        { label: 'Staff', value: 'staff' },
        { label: 'Manager', value: 'manager' },
        { label: 'Barber', value: 'barber' },
        { label: 'Admin', value: 'admin' },
      ],
      admin: {
        description: 'Type of user for onboarding flow',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      options: [
        { label: 'Not Started', value: 'not-started' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Skipped', value: 'skipped' },
        { label: 'Paused', value: 'paused' },
      ],
      defaultValue: 'not-started',
      admin: {
        description: 'Current status of onboarding',
      },
    },
    {
      name: 'currentStep',
      type: 'relationship',
      relationTo: 'onboarding-steps',
      admin: {
        description: 'Current step the user is on',
      },
    },
    {
      name: 'completedSteps',
      type: 'array',
      admin: {
        description: 'Steps that have been completed',
      },
      fields: [
        {
          name: 'step',
          type: 'relationship',
          relationTo: 'onboarding-steps',
          required: true,
        },
        {
          name: 'completedAt',
          type: 'date',
          required: true,
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'timeSpent',
          type: 'number',
          min: 0,
          admin: {
            description: 'Time spent on this step in seconds',
          },
        },
        {
          name: 'skipped',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether this step was skipped',
          },
        },
      ],
    },
    {
      name: 'skippedSteps',
      type: 'array',
      admin: {
        description: 'Steps that were skipped',
      },
      fields: [
        {
          name: 'step',
          type: 'relationship',
          relationTo: 'onboarding-steps',
          required: true,
        },
        {
          name: 'skippedAt',
          type: 'date',
          required: true,
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
          },
        },
        {
          name: 'reason',
          type: 'select',
          options: [
            { label: 'Not Interested', value: 'not-interested' },
            { label: 'Already Know', value: 'already-know' },
            { label: 'Too Time Consuming', value: 'too-time-consuming' },
            { label: 'Technical Issues', value: 'technical-issues' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'customReason',
          type: 'text',
          admin: {
            condition: (data) => data?.reason === 'other',
            description: 'Custom reason for skipping',
          },
        },
      ],
    },
    {
      name: 'progressMetrics',
      type: 'group',
      admin: {
        description: 'Progress tracking metrics',
      },
      fields: [
        {
          name: 'totalSteps',
          type: 'number',
          min: 0,
          admin: {
            description: 'Total number of steps in the flow',
            readOnly: true,
          },
        },
        {
          name: 'completedCount',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Number of steps completed',
            readOnly: true,
          },
        },
        {
          name: 'skippedCount',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Number of steps skipped',
            readOnly: true,
          },
        },
        {
          name: 'progressPercentage',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Overall progress percentage',
            readOnly: true,
          },
        },
        {
          name: 'totalTimeSpent',
          type: 'number',
          min: 0,
          defaultValue: 0,
          admin: {
            description: 'Total time spent on onboarding in seconds',
            readOnly: true,
          },
        },
        {
          name: 'averageTimePerStep',
          type: 'number',
          min: 0,
          admin: {
            description: 'Average time spent per step in seconds',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'sessionData',
      type: 'group',
      admin: {
        description: 'Current session tracking data',
      },
      fields: [
        {
          name: 'startedAt',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            description: 'When the current onboarding session started',
          },
        },
        {
          name: 'lastActivityAt',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Last activity timestamp',
          },
        },
        {
          name: 'currentStepStartedAt',
          type: 'date',
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            description: 'When the current step was started',
          },
        },
        {
          name: 'sessionCount',
          type: 'number',
          min: 1,
          defaultValue: 1,
          admin: {
            description: 'Number of onboarding sessions',
          },
        },
      ],
    },
    {
      name: 'preferences',
      type: 'group',
      admin: {
        description: 'User preferences collected during onboarding',
      },
      fields: [
        {
          name: 'emailNotifications',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Whether user wants email notifications',
          },
        },
        {
          name: 'smsNotifications',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether user wants SMS notifications',
          },
        },
        {
          name: 'marketingEmails',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Whether user wants marketing emails',
          },
        },
        {
          name: 'preferredCommunication',
          type: 'select',
          options: [
            { label: 'Email', value: 'email' },
            { label: 'SMS', value: 'sms' },
            { label: 'Phone', value: 'phone' },
          ],
        },
        {
          name: 'timezone',
          type: 'text',
          admin: {
            description: 'User timezone preference',
          },
        },
      ],
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for custom tracking',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'When onboarding was fully completed',
        condition: (data) => data?.status === 'completed',
      },
    },
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
      defaultValue: () => new Date(),
    },
    {
      name: 'updatedAt',
      type: 'date',
      admin: {
        readOnly: true,
        date: { pickerAppearance: 'dayAndTime' },
      },
      defaultValue: () => new Date(),
    },
  ],
  indexes: [
    {
      fields: ['user', 'status'],
      unique: true,
    },
    {
      fields: ['userType', 'status'],
    },
    {
      fields: ['createdAt'],
    },
    {
      fields: ['completedAt'],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        data.updatedAt = new Date();
        return data;
      },
    ],
  },
};
