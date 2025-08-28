import { CollectionConfig } from 'payload';

export const EditorThemes: CollectionConfig = {
  slug: 'editorThemes',
  admin: {
    useAsTitle: 'name',
    group: 'Editor',
    description: 'Customizable themes for the visual editor and content display.',
    defaultColumns: ['name', 'category', 'isActive', 'usageCount'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber' || req.user?.role === 'manager',
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'Theme name for identification.' },
      validate: (value) => {
        if (!value || value.length < 1) return 'Theme name is required';
        if (value.length > 100) return 'Theme name too long (max 100 characters)';
        return true;
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Brief description of the theme style and purpose.' },
      validate: (value) => {
        if (value && value.length > 500) return 'Description too long (max 500 characters)';
        return true;
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'Colorful', value: 'colorful' },
        { label: 'Minimal', value: 'minimal' },
        { label: 'Professional', value: 'professional' },
        { label: 'Creative', value: 'creative' },
        { label: 'Corporate', value: 'corporate' },
        { label: 'Modern', value: 'modern' },
        { label: 'Classic', value: 'classic' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'light',
      index: true,
      admin: { description: 'Theme category for organization.' },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Theme preview image.' },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: { description: 'Tenant this theme belongs to.' },
    },
    {
      name: 'colors',
      type: 'group',
      admin: { description: 'Color palette for the theme.' },
      fields: [
        {
          name: 'primary',
          type: 'text',
          defaultValue: '#3B82F6',
          admin: { description: 'Primary brand color (hex code).' },
          validate: (value) => {
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
            return true;
          },
        },
        {
          name: 'secondary',
          type: 'text',
          defaultValue: '#6B7280',
          admin: { description: 'Secondary color (hex code).' },
          validate: (value) => {
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
            return true;
          },
        },
        {
          name: 'accent',
          type: 'text',
          defaultValue: '#10B981',
          admin: { description: 'Accent color for highlights (hex code).' },
          validate: (value) => {
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
            return true;
          },
        },
        {
          name: 'background',
          type: 'text',
          defaultValue: '#FFFFFF',
          admin: { description: 'Background color (hex code).' },
          validate: (value) => {
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
            return true;
          },
        },
        {
          name: 'surface',
          type: 'text',
          defaultValue: '#F9FAFB',
          admin: { description: 'Surface/card background color (hex code).' },
          validate: (value) => {
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
            return true;
          },
        },
        {
          name: 'text',
          type: 'group',
          admin: { description: 'Text colors.' },
          fields: [
            {
              name: 'primary',
              type: 'text',
              defaultValue: '#111827',
              admin: { description: 'Primary text color (hex code).' },
            },
            {
              name: 'secondary',
              type: 'text',
              defaultValue: '#6B7280',
              admin: { description: 'Secondary text color (hex code).' },
            },
            {
              name: 'muted',
              type: 'text',
              defaultValue: '#9CA3AF',
              admin: { description: 'Muted text color (hex code).' },
            },
          ],
        },
        {
          name: 'border',
          type: 'text',
          defaultValue: '#E5E7EB',
          admin: { description: 'Border color (hex code).' },
        },
        {
          name: 'success',
          type: 'text',
          defaultValue: '#10B981',
          admin: { description: 'Success state color (hex code).' },
        },
        {
          name: 'warning',
          type: 'text',
          defaultValue: '#F59E0B',
          admin: { description: 'Warning state color (hex code).' },
        },
        {
          name: 'error',
          type: 'text',
          defaultValue: '#EF4444',
          admin: { description: 'Error state color (hex code).' },
        },
        {
          name: 'info',
          type: 'text',
          defaultValue: '#3B82F6',
          admin: { description: 'Info state color (hex code).' },
        },
      ],
    },
    {
      name: 'typography',
      type: 'group',
      admin: { description: 'Typography settings for the theme.' },
      fields: [
        {
          name: 'fontFamily',
          type: 'text',
          defaultValue: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          admin: { description: 'Primary font family (CSS font-family value).' },
        },
        {
          name: 'fontSize',
          type: 'group',
          admin: { description: 'Font sizes for different text elements.' },
          fields: [
            {
              name: 'xs',
              type: 'text',
              defaultValue: '0.75rem',
              admin: { description: 'Extra small text size.' },
            },
            {
              name: 'sm',
              type: 'text',
              defaultValue: '0.875rem',
              admin: { description: 'Small text size.' },
            },
            {
              name: 'base',
              type: 'text',
              defaultValue: '1rem',
              admin: { description: 'Base text size.' },
            },
            {
              name: 'lg',
              type: 'text',
              defaultValue: '1.125rem',
              admin: { description: 'Large text size.' },
            },
            {
              name: 'xl',
              type: 'text',
              defaultValue: '1.25rem',
              admin: { description: 'Extra large text size.' },
            },
            {
              name: '2xl',
              type: 'text',
              defaultValue: '1.5rem',
              admin: { description: '2X large text size.' },
            },
            {
              name: '3xl',
              type: 'text',
              defaultValue: '1.875rem',
              admin: { description: '3X large text size.' },
            },
            {
              name: '4xl',
              type: 'text',
              defaultValue: '2.25rem',
              admin: { description: '4X large text size.' },
            },
          ],
        },
        {
          name: 'fontWeight',
          type: 'group',
          admin: { description: 'Font weights for different text elements.' },
          fields: [
            {
              name: 'normal',
              type: 'text',
              defaultValue: '400',
              admin: { description: 'Normal font weight.' },
            },
            {
              name: 'medium',
              type: 'text',
              defaultValue: '500',
              admin: { description: 'Medium font weight.' },
            },
            {
              name: 'semibold',
              type: 'text',
              defaultValue: '600',
              admin: { description: 'Semibold font weight.' },
            },
            {
              name: 'bold',
              type: 'text',
              defaultValue: '700',
              admin: { description: 'Bold font weight.' },
            },
          ],
        },
        {
          name: 'lineHeight',
          type: 'group',
          admin: { description: 'Line heights for different text elements.' },
          fields: [
            {
              name: 'tight',
              type: 'text',
              defaultValue: '1.25',
              admin: { description: 'Tight line height.' },
            },
            {
              name: 'normal',
              type: 'text',
              defaultValue: '1.5',
              admin: { description: 'Normal line height.' },
            },
            {
              name: 'relaxed',
              type: 'text',
              defaultValue: '1.75',
              admin: { description: 'Relaxed line height.' },
            },
          ],
        },
      ],
    },
    {
      name: 'spacing',
      type: 'group',
      admin: { description: 'Spacing and layout settings.' },
      fields: [
        {
          name: 'padding',
          type: 'group',
          admin: { description: 'Default padding values.' },
          fields: [
            {
              name: 'xs',
              type: 'text',
              defaultValue: '0.5rem',
              admin: { description: 'Extra small padding.' },
            },
            {
              name: 'sm',
              type: 'text',
              defaultValue: '0.75rem',
              admin: { description: 'Small padding.' },
            },
            {
              name: 'md',
              type: 'text',
              defaultValue: '1rem',
              admin: { description: 'Medium padding.' },
            },
            {
              name: 'lg',
              type: 'text',
              defaultValue: '1.5rem',
              admin: { description: 'Large padding.' },
            },
            {
              name: 'xl',
              type: 'text',
              defaultValue: '2rem',
              admin: { description: 'Extra large padding.' },
            },
          ],
        },
        {
          name: 'margin',
          type: 'group',
          admin: { description: 'Default margin values.' },
          fields: [
            {
              name: 'xs',
              type: 'text',
              defaultValue: '0.25rem',
              admin: { description: 'Extra small margin.' },
            },
            {
              name: 'sm',
              type: 'text',
              defaultValue: '0.5rem',
              admin: { description: 'Small margin.' },
            },
            {
              name: 'md',
              type: 'text',
              defaultValue: '1rem',
              admin: { description: 'Medium margin.' },
            },
            {
              name: 'lg',
              type: 'text',
              defaultValue: '1.5rem',
              admin: { description: 'Large margin.' },
            },
            {
              name: 'xl',
              type: 'text',
              defaultValue: '2rem',
              admin: { description: 'Extra large margin.' },
            },
          ],
        },
        {
          name: 'borderRadius',
          type: 'group',
          admin: { description: 'Border radius values.' },
          fields: [
            {
              name: 'none',
              type: 'text',
              defaultValue: '0',
              admin: { description: 'No border radius.' },
            },
            {
              name: 'sm',
              type: 'text',
              defaultValue: '0.125rem',
              admin: { description: 'Small border radius.' },
            },
            {
              name: 'md',
              type: 'text',
              defaultValue: '0.375rem',
              admin: { description: 'Medium border radius.' },
            },
            {
              name: 'lg',
              type: 'text',
              defaultValue: '0.5rem',
              admin: { description: 'Large border radius.' },
            },
            {
              name: 'xl',
              type: 'text',
              defaultValue: '0.75rem',
              admin: { description: 'Extra large border radius.' },
            },
            {
              name: 'full',
              type: 'text',
              defaultValue: '9999px',
              admin: { description: 'Full border radius (pill shape).' },
            },
          ],
        },
      ],
    },
    {
      name: 'components',
      type: 'group',
      admin: { description: 'Component-specific styling overrides.' },
      fields: [
        {
          name: 'buttons',
          type: 'group',
          admin: { description: 'Button component styles.' },
          fields: [
            {
              name: 'primary',
              type: 'text',
              defaultValue: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium',
              admin: { description: 'Primary button CSS classes.' },
            },
            {
              name: 'secondary',
              type: 'text',
              defaultValue: 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium',
              admin: { description: 'Secondary button CSS classes.' },
            },
            {
              name: 'outline',
              type: 'text',
              defaultValue: 'border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-md font-medium',
              admin: { description: 'Outline button CSS classes.' },
            },
          ],
        },
        {
          name: 'inputs',
          type: 'group',
          admin: { description: 'Input component styles.' },
          fields: [
            {
              name: 'default',
              type: 'text',
              defaultValue: 'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
              admin: { description: 'Default input CSS classes.' },
            },
            {
              name: 'error',
              type: 'text',
              defaultValue: 'border border-red-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500',
              admin: { description: 'Error input CSS classes.' },
            },
          ],
        },
        {
          name: 'cards',
          type: 'text',
          defaultValue: 'bg-white border border-gray-200 rounded-lg shadow-sm p-6',
          admin: { description: 'Card component CSS classes.' },
        },
        {
          name: 'headings',
          type: 'group',
          admin: { description: 'Heading component styles.' },
          fields: [
            {
              name: 'h1',
              type: 'text',
              defaultValue: 'text-3xl font-bold text-gray-900 mb-4',
              admin: { description: 'H1 heading CSS classes.' },
            },
            {
              name: 'h2',
              type: 'text',
              defaultValue: 'text-2xl font-semibold text-gray-800 mb-3',
              admin: { description: 'H2 heading CSS classes.' },
            },
            {
              name: 'h3',
              type: 'text',
              defaultValue: 'text-xl font-medium text-gray-700 mb-2',
              admin: { description: 'H3 heading CSS classes.' },
            },
          ],
        },
      ],
    },
    {
      name: 'customCss',
      type: 'textarea',
      admin: { description: 'Additional custom CSS for this theme.' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Whether this theme is available for use.' },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Whether this theme is available to all tenants.' },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Number of times this theme has been used.',
        readOnly: true,
      },
    },
    {
      name: 'lastUsed',
      type: 'date',
      admin: {
        description: 'Date when this theme was last used.',
        readOnly: true,
      },
    },
    {
      name: 'version',
      type: 'number',
      defaultValue: 1,
      admin: {
        description: 'Theme version number.',
        readOnly: true,
      },
    },
    {
      name: 'parentTheme',
      type: 'relationship',
      relationTo: 'editorThemes',
      admin: {
        description: 'Parent theme if this is a variant.',
        readOnly: true,
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
      admin: { description: 'Tags for theme organization and search.' },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        if (req.user) {
          if (!data.createdBy) {
            data.createdBy = req.user.id;
          }
          data.updatedBy = req.user.id;
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, operation }) => {
        if (operation === 'create' || operation === 'update') {
          console.log(`Editor theme ${operation}d: ${doc.name} (v${doc.version})`);
        }
      },
    ],
  },
  indexes: [
    { fields: ['tenant', 'category'] },
    { fields: ['isActive'] },
    { fields: ['isPublic'] },
    { fields: ['usageCount'] },
  ],
  timestamps: true,
};
