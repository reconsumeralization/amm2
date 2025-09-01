import type { CollectionConfig } from 'payload';

export const OnboardingSteps: CollectionConfig = {
  slug: 'onboarding-steps',
  admin: {
    useAsTitle: 'title',
    group: 'Onboarding',
    description: 'Configure onboarding steps for different user types',
  },
  access: {
    read: () => true,
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
        description: 'Display title for the onboarding step',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Detailed description of what this step involves',
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
        description: 'Which user type this step applies to',
      },
    },
    {
      name: 'stepOrder',
      type: 'number',
      required: true,
      min: 1,
      admin: {
        description: 'Order of this step in the onboarding flow',
      },
    },
    {
      name: 'stepType',
      type: 'select',
      required: true,
      options: [
        { label: 'Welcome', value: 'welcome' },
        { label: 'Profile Setup', value: 'profile' },
        { label: 'Preferences', value: 'preferences' },
        { label: 'Booking Tutorial', value: 'booking' },
        { label: 'Services Overview', value: 'services' },
        { label: 'Team Introduction', value: 'team' },
        { label: 'Loyalty Program', value: 'loyalty' },
        { label: 'Settings', value: 'settings' },
        { label: 'First Booking', value: 'first-booking' },
        { label: 'Staff Schedule', value: 'staff-schedule' },
        { label: 'Admin Dashboard', value: 'admin-dashboard' },
        { label: 'Business Setup', value: 'business-setup' },
        { label: 'Custom', value: 'custom' },
      ],
      admin: {
        description: 'Type of onboarding step',
      },
    },
    {
      name: 'isRequired',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this step must be completed',
      },
    },
    {
      name: 'isSkippable',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether users can skip this step',
      },
    },
    {
      name: 'estimatedDuration',
      type: 'number',
      min: 1,
      max: 300,
      admin: {
        description: 'Estimated time in seconds to complete this step',
      },
    },
    {
      name: 'content',
      type: 'group',
      admin: {
        description: 'Content configuration for this step',
      },
      fields: [
        {
          name: 'heading',
          type: 'text',
          admin: {
            description: 'Main heading for the step',
          },
        },
        {
          name: 'subheading',
          type: 'text',
          admin: {
            description: 'Subtitle or supporting text',
          },
        },
        {
          name: 'body',
          type: 'richText',
          admin: {
            description: 'Detailed content for the step',
          },
        },
        {
          name: 'media',
          type: 'upload',
          relationTo: 'media',
          admin: {
            description: 'Image or video for this step',
          },
        },
        {
          name: 'actionButton',
          type: 'group',
          fields: [
            {
              name: 'text',
              type: 'text',
              defaultValue: 'Continue',
            },
            {
              name: 'variant',
              type: 'select',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Secondary', value: 'secondary' },
                { label: 'Outline', value: 'outline' },
              ],
              defaultValue: 'primary',
            },
          ],
        },
      ],
    },
    {
      name: 'actions',
      type: 'group',
      admin: {
        description: 'Actions to perform when step is completed',
      },
      fields: [
        {
          name: 'redirectTo',
          type: 'text',
          admin: {
            description: 'URL to redirect to after completion',
          },
        },
        {
          name: 'triggerEvents',
          type: 'array',
          fields: [
            {
              name: 'event',
              type: 'select',
              options: [
                { label: 'Send Welcome Email', value: 'send-welcome-email' },
                { label: 'Create Profile', value: 'create-profile' },
                { label: 'Setup Preferences', value: 'setup-preferences' },
                { label: 'Grant Permissions', value: 'grant-permissions' },
                { label: 'Send Notification', value: 'send-notification' },
                { label: 'Custom Action', value: 'custom-action' },
              ],
            },
            {
              name: 'data',
              type: 'json',
              admin: {
                description: 'Additional data for the event',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'conditions',
      type: 'group',
      admin: {
        description: 'Conditions for showing this step',
      },
      fields: [
        {
          name: 'requiresPreviousStep',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Whether previous step must be completed first',
          },
        },
        {
          name: 'customConditions',
          type: 'json',
          admin: {
            description: 'Custom conditions in JSON format',
          },
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      admin: {
        description: 'Analytics tracking for this step',
      },
      fields: [
        {
          name: 'trackCompletion',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Track when users complete this step',
          },
        },
        {
          name: 'trackSkip',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Track when users skip this step',
          },
        },
        {
          name: 'conversionValue',
          type: 'number',
          min: 0,
          admin: {
            description: 'Monetary value for conversion tracking',
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this step is currently active',
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
      fields: ['userType', 'stepOrder', 'isActive'],
    },
    {
      fields: ['stepType'],
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
