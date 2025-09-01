import type { CollectionConfig } from 'payload';

export const OnboardingAnalytics: CollectionConfig = {
  slug: 'onboarding-analytics',
  admin: {
    useAsTitle: 'title',
    group: 'Onboarding',
    description: 'Analytics and metrics for onboarding performance',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Title for this analytics entry',
      },
    },
    {
      name: 'dateRange',
      type: 'group',
      admin: {
        description: 'Date range for this analytics data',
      },
      fields: [
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            date: { pickerAppearance: 'dayOnly' },
          },
        },
        {
          name: 'endDate',
          type: 'date',
          required: true,
          admin: {
            date: { pickerAppearance: 'dayOnly' },
          },
        },
      ],
    },
    {
      name: 'userType',
      type: 'select',
      options: [
        { label: 'All Users', value: 'all' },
        { label: 'Customer', value: 'customer' },
        { label: 'Staff', value: 'staff' },
        { label: 'Manager', value: 'manager' },
        { label: 'Barber', value: 'barber' },
        { label: 'Admin', value: 'admin' },
      ],
      defaultValue: 'all',
      admin: {
        description: 'Filter analytics by user type',
      },
    },
    {
      name: 'metrics',
      type: 'group',
      admin: {
        description: 'Core onboarding metrics',
      },
      fields: [
        {
          name: 'totalUsers',
          type: 'number',
          min: 0,
          admin: {
            description: 'Total users who started onboarding',
          },
        },
        {
          name: 'completedUsers',
          type: 'number',
          min: 0,
          admin: {
            description: 'Users who completed onboarding',
          },
        },
        {
          name: 'completionRate',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Completion rate percentage',
          },
        },
        {
          name: 'averageCompletionTime',
          type: 'number',
          min: 0,
          admin: {
            description: 'Average time to complete onboarding in minutes',
          },
        },
        {
          name: 'dropOffRate',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Percentage of users who dropped off',
          },
        },
      ],
    },
    {
      name: 'stepAnalytics',
      type: 'array',
      admin: {
        description: 'Analytics for each onboarding step',
      },
      fields: [
        {
          name: 'step',
          type: 'relationship',
          relationTo: 'onboarding-steps',
          required: true,
        },
        {
          name: 'usersStarted',
          type: 'number',
          min: 0,
          admin: {
            description: 'Number of users who started this step',
          },
        },
        {
          name: 'usersCompleted',
          type: 'number',
          min: 0,
          admin: {
            description: 'Number of users who completed this step',
          },
        },
        {
          name: 'usersSkipped',
          type: 'number',
          min: 0,
          admin: {
            description: 'Number of users who skipped this step',
          },
        },
        {
          name: 'completionRate',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Completion rate for this step',
          },
        },
        {
          name: 'averageTimeSpent',
          type: 'number',
          min: 0,
          admin: {
            description: 'Average time spent on this step in seconds',
          },
        },
        {
          name: 'dropOffRate',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Drop-off rate for this step',
          },
        },
      ],
    },
    {
      name: 'conversionMetrics',
      type: 'group',
      admin: {
        description: 'Conversion and business impact metrics',
      },
      fields: [
        {
          name: 'bookingsAfterOnboarding',
          type: 'number',
          min: 0,
          admin: {
            description: 'Number of bookings made after completing onboarding',
          },
        },
        {
          name: 'revenueFromOnboardedUsers',
          type: 'number',
          min: 0,
          admin: {
            description: 'Revenue generated from onboarded users',
          },
        },
        {
          name: 'loyaltySignups',
          type: 'number',
          min: 0,
          admin: {
            description: 'Number of loyalty program signups from onboarding',
          },
        },
        {
          name: 'profileCompletionRate',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Percentage of users who completed their profiles',
          },
        },
        {
          name: 'engagementScore',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Overall engagement score (0-100)',
          },
        },
      ],
    },
    {
      name: 'userBehavior',
      type: 'group',
      admin: {
        description: 'User behavior patterns',
      },
      fields: [
        {
          name: 'preferredTimes',
          type: 'json',
          admin: {
            description: 'When users typically complete onboarding',
          },
        },
        {
          name: 'deviceTypes',
          type: 'json',
          admin: {
            description: 'Device types used for onboarding',
          },
        },
        {
          name: 'completionPatterns',
          type: 'json',
          admin: {
            description: 'Patterns in how users complete onboarding',
          },
        },
        {
          name: 'commonSkipReasons',
          type: 'array',
          fields: [
            {
              name: 'reason',
              type: 'text',
              required: true,
            },
            {
              name: 'count',
              type: 'number',
              min: 0,
            },
          ],
        },
      ],
    },
    {
      name: 'performanceMetrics',
      type: 'group',
      admin: {
        description: 'System performance and technical metrics',
      },
      fields: [
        {
          name: 'averageLoadTime',
          type: 'number',
          min: 0,
          admin: {
            description: 'Average page load time in milliseconds',
          },
        },
        {
          name: 'errorRate',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Percentage of sessions with errors',
          },
        },
        {
          name: 'abandonmentRate',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Rate of users abandoning onboarding mid-flow',
          },
        },
        {
          name: 'retryAttempts',
          type: 'number',
          min: 0,
          admin: {
            description: 'Average number of retry attempts per user',
          },
        },
      ],
    },
    {
      name: 'cohortAnalysis',
      type: 'array',
      admin: {
        description: 'Cohort analysis data',
      },
      fields: [
        {
          name: 'cohort',
          type: 'text',
          required: true,
          admin: {
            description: 'Cohort identifier (e.g., "Week 1 2024")',
          },
        },
        {
          name: 'startDate',
          type: 'date',
          required: true,
          admin: {
            date: { pickerAppearance: 'dayOnly' },
          },
        },
        {
          name: 'cohortSize',
          type: 'number',
          min: 0,
          admin: {
            description: 'Number of users in this cohort',
          },
        },
        {
          name: 'retentionDay1',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Day 1 retention rate',
          },
        },
        {
          name: 'retentionDay7',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Day 7 retention rate',
          },
        },
        {
          name: 'retentionDay30',
          type: 'number',
          min: 0,
          max: 100,
          admin: {
            description: 'Day 30 retention rate',
          },
        },
      ],
    },
    {
      name: 'recommendations',
      type: 'textarea',
      admin: {
        description: 'AI-generated recommendations based on analytics',
      },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Additional metadata for custom analytics',
      },
    },
    {
      name: 'generatedAt',
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
      fields: ['userType', 'generatedAt'],
    },
    {
      fields: ['dateRange.startDate', 'dateRange.endDate'],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-calculate completion rate
        if (data.metrics?.totalUsers && data.metrics?.completedUsers) {
          data.metrics.completionRate = Math.round(
            (data.metrics.completedUsers / data.metrics.totalUsers) * 100
          );
        }
        return data;
      },
    ],
  },
};
