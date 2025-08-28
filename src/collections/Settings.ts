import { CollectionConfig } from 'payload';

export const Settings: CollectionConfig = {
  slug: 'settings',
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
    description: 'Global and tenant-specific settings for ModernMen features.',
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin',
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      defaultValue: 'Global Settings',
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      admin: { description: 'Leave blank for global settings.' },
    },
    {
      name: 'chatbot',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        {
          name: 'displayPaths',
          type: 'array',
          fields: [{ name: 'path', type: 'text', required: true }],
          defaultValue: [{ path: '/portal' }, { path: '/book' }, { path: '/services' }],
        },
        {
          name: 'roles',
          type: 'select',
          hasMany: true,
          options: ['customer', 'staff', 'admin'],
          defaultValue: ['customer', 'staff'],
        },
        {
          name: 'aiTriggers',
          type: 'group',
          fields: [
            { name: 'pendingAppointments', type: 'checkbox', defaultValue: true },
            { name: 'staffAvailability', type: 'checkbox', defaultValue: true },
            { name: 'userActivityThreshold', type: 'number', defaultValue: 5, admin: { description: 'Minutes of inactivity before hiding chatbot.' } },
          ],
        },
        {
          name: 'styles',
          type: 'group',
          fields: [
            { name: 'position', type: 'select', options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'], defaultValue: 'bottom-right' },
            { name: 'backgroundColor', type: 'text', defaultValue: '#ffffff' },
            { name: 'borderRadius', type: 'text', defaultValue: '8px' },
            { name: 'animation', type: 'select', options: ['none', 'fade', 'slide'], defaultValue: 'fade' },
          ],
        },
      ],
    },
    {
      name: 'clock',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        {
          name: 'notifications',
          type: 'group',
          fields: [
            { name: 'emailAdmins', type: 'checkbox', defaultValue: true },
            { name: 'emailTemplate', type: 'textarea', defaultValue: '<p>{{staffName}} {{action}} at {{timestamp}}.</p>' },
            { name: 'googleCalendarSync', type: 'checkbox', defaultValue: true },
          ],
        },
        {
          name: 'shiftRules',
          type: 'group',
          fields: [
            { name: 'minShiftHours', type: 'number', defaultValue: 4 },
            { name: 'maxShiftHours', type: 'number', defaultValue: 8 },
            { name: 'maxWeeklyHours', type: 'number', defaultValue: 40 },
          ],
        },
      ],
    },
    {
      name: 'editor',
      type: 'group',
      fields: [
        { 
          name: 'enabledPlugins', 
          type: 'select', 
          hasMany: true, 
          options: ['image', 'serviceTemplate', 'productEmbed', 'aiContent', 'hairSimulator', 'pageBuilder', 'imageEditor'], 
          defaultValue: ['image', 'serviceTemplate', 'productEmbed', 'aiContent', 'hairSimulator', 'pageBuilder', 'imageEditor'] 
        },
        {
          name: 'theme',
          type: 'group',
          fields: [
            { name: 'heading', type: 'text', defaultValue: 'text-2xl font-bold' },
            { name: 'link', type: 'text', defaultValue: 'text-blue-500 underline' },
            { name: 'fontFamily', type: 'text', defaultValue: 'Inter, sans-serif' },
          ],
        },
        {
          name: 'imageOptimization',
          type: 'group',
          fields: [
            { name: 'maxImageSize', type: 'number', defaultValue: 5242880, admin: { description: 'Max image upload size in bytes (default: 5MB).' } },
            {
              name: 'responsiveSizes',
              type: 'array',
              fields: [
                { name: 'width', type: 'number', required: true, admin: { description: 'Width in pixels.' } },
                { name: 'label', type: 'text', required: true, admin: { description: 'e.g., mobile, tablet, desktop' } },
              ],
              defaultValue: [
                { width: 320, label: 'mobile' },
                { width: 768, label: 'tablet' },
                { width: 1200, label: 'desktop' },
              ],
            },
            { name: 'formats', type: 'select', hasMany: true, options: ['jpeg', 'png', 'webp'], defaultValue: ['jpeg', 'webp'] },
            { name: 'quality', type: 'number', defaultValue: 80, admin: { description: 'Image quality (1-100) for lossy formats.' } },
          ],
        },
        {
          name: 'imageEditor',
          type: 'group',
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: true },
            {
              name: 'effects',
              type: 'select',
              hasMany: true,
              options: ['brightness', 'contrast', 'grayscale', 'sepia'],
              defaultValue: ['brightness', 'contrast'],
              admin: { description: 'Available image editing effects.' },
            },
          ],
        },
        {
          name: 'pageBuilder',
          type: 'group',
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: true },
            {
              name: 'components',
              type: 'select',
              hasMany: true,
              options: ['text', 'image', 'button', 'bookingChatbot', 'barberProfile', 'testimonial'],
              defaultValue: ['text', 'image', 'button', 'bookingChatbot', 'barberProfile', 'testimonial'],
              admin: { description: 'Available components for page builder.' },
            },
          ],
        },
      ],
    },
    {
      name: 'barberProfiles',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'allowComments', type: 'checkbox', defaultValue: true },
        { name: 'allowLikes', type: 'checkbox', defaultValue: true },
        { name: 'allowSharing', type: 'checkbox', defaultValue: true },
        { name: 'allowFollow', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'barbershop',
      type: 'group',
      fields: [
        {
          name: 'services',
          type: 'array',
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'description', type: 'textarea' },
            { name: 'price', type: 'number' },
            { name: 'duration', type: 'number', admin: { description: 'Duration in minutes.' } },
          ],
          defaultValue: [
            { name: 'Haircut', description: 'Precision haircut with wash.', price: 30, duration: 30 },
            { name: 'Beard Trim', description: 'Groomed beard with oil.', price: 20, duration: 15 },
          ],
        },
        {
          name: 'loyalty',
          type: 'group',
          fields: [
            { name: 'pointsPerBooking', type: 'number', defaultValue: 10 },
            { name: 'pointsPerReferral', type: 'number', defaultValue: 20 },
            { name: 'badgeThreshold', type: 'number', defaultValue: 100 },
            { name: 'rewardThreshold', type: 'number', defaultValue: 200 },
            { name: 'rewardDiscount', type: 'number', defaultValue: 10, admin: { description: 'Discount percentage for reward.' } },
          ],
        },
        {
          name: 'simulator',
          type: 'group',
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: true },
            { name: 'styles', type: 'array', fields: [{ name: 'style', type: 'text' }], defaultValue: [{ style: 'Fade' }, { style: 'Mohawk' }] },
            { name: 'maxImageResolution', type: 'number', defaultValue: 1024, admin: { description: 'Max resolution for simulator images (px).' } },
          ],
        },
        {
          name: 'events',
          type: 'group',
          fields: [
            { name: 'enabled', type: 'checkbox', defaultValue: true },
            { name: 'maxAttendees', type: 'number', defaultValue: 50 },
            { name: 'bookingWindowDays', type: 'number', defaultValue: 30 },
          ],
        },
      ],
    },
    {
      name: 'dashboard',
      type: 'group',
      fields: [
        { name: 'enabledWidgets', type: 'select', hasMany: true, options: ['appointments', 'revenue', 'clock', 'schedules'], defaultValue: ['appointments', 'revenue', 'clock', 'schedules'] },
        { name: 'chartType', type: 'select', options: ['line', 'bar', 'area'], defaultValue: 'line' },
        { name: 'refreshInterval', type: 'number', defaultValue: 300, admin: { description: 'Dashboard refresh interval in seconds.' } },
      ],
    },
    {
      name: 'portal',
      type: 'group',
      fields: [
        { name: 'showServices', type: 'checkbox', defaultValue: true },
        { name: 'showAppointments', type: 'checkbox', defaultValue: true },
        { name: 'showTrends', type: 'checkbox', defaultValue: true },
        { name: 'themeColor', type: 'text', defaultValue: '#2563eb' },
      ],
    },
    {
      name: 'email',
      type: 'group',
      fields: [
        { name: 'fromAddress', type: 'text', defaultValue: 'no-reply@modernmen.com' },
        { name: 'signature', type: 'textarea', defaultValue: 'Best regards,\nModernMen Team' },
        { name: 'enableNotifications', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'stripe',
      type: 'group',
      fields: [
        { name: 'currency', type: 'text', defaultValue: 'usd', required: true },
        { name: 'taxRate', type: 'number', defaultValue: 0.1, admin: { description: 'Tax rate as a decimal (e.g., 0.1 for 10%).' } },
        { name: 'webhookSecret', type: 'text', admin: { description: 'Stripe webhook secret for payment verification.' } },
        { name: 'successUrl', type: 'text', defaultValue: '/booking/success' },
        { name: 'cancelUrl', type: 'text', defaultValue: '/booking/cancel' },
      ],
    },
    {
      name: 'googleCalendar',
      type: 'group',
      fields: [
        { name: 'enabled', type: 'checkbox', defaultValue: true },
        { name: 'calendarId', type: 'text', defaultValue: 'primary', required: true },
        { name: 'eventPrefix', type: 'text', defaultValue: 'ModernMen - ' },
        { name: 'timezone', type: 'text', defaultValue: 'America/New_York' },
        { name: 'syncInterval', type: 'number', defaultValue: 300, admin: { description: 'Sync interval in seconds.' } },
      ],
    },
    {
      name: 'ai',
      type: 'group',
      fields: [
        { name: 'model', type: 'text', defaultValue: 'text-davinci-003' },
        { name: 'maxTokens', type: 'number', defaultValue: 200 },
        { name: 'temperature', type: 'number', defaultValue: 0.7, admin: { description: 'AI response creativity (0 to 1).' } },
      ],
    },
  ],
};