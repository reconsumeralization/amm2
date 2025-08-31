import { CollectionConfig } from 'payload';
// import { yoloMonitoring } from '../utils/monitoring'; // Placeholder

export const EditorThemes: CollectionConfig = {
  slug: 'editorThemes',
  admin: {
    useAsTitle: 'name',
    group: 'Editor',
    description: 'Customizable themes for the visual editor and content display.',
    defaultColumns: ['name', 'category', 'isActive', 'usageCount', 'tenant'],
    listSearchableFields: ['name', 'description', 'tags.tag'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }) => {
      if (!req.user) return false;
      const userRole = req.user?.role;
      return userRole === 'admin' || userRole === 'barber' || userRole === 'manager';
    },
    create: ({ req }) => {
      if (!req.user) return false;
      const userRole = req.user?.role;
      return userRole === 'admin' || userRole === 'manager';
    },
    update: ({ req }) => {
      if (!req.user) return false;
      const userRole = req.user?.role;
      return userRole === 'admin' || userRole === 'manager';
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      return req.user?.role === 'admin';
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      unique: true,
      admin: { 
        description: 'Unique theme name for identification.',
        placeholder: 'e.g., Modern Dark Theme',
      },
      validate: (value: string | null | undefined) => {
        if (!value || value.length < 1) return 'Theme name is required';
        if (value.length > 100) return 'Theme name too long (max 100 characters)';
        if (!/^[a-zA-Z0-9\s\-_]+$/.test(value)) return 'Theme name can only contain letters, numbers, spaces, hyphens, and underscores';
        return true;
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly identifier for the theme.',
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            if (siblingData.name) {
              return siblingData.name
                .toLowerCase()
                .replace(/[^a-z0-9\s\-_]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();
            }
            return siblingData.slug;
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { 
        description: 'Brief description of the theme style and purpose.',
        placeholder: 'Describe the theme\'s visual style, use cases, and key features...',
      },
      validate: (value: string | null | undefined) => {
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
        { label: 'High Contrast', value: 'high-contrast' },
        { label: 'Seasonal', value: 'seasonal' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'light',
      required: true,
      index: true,
      admin: { description: 'Theme category for organization and filtering.' },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: { 
        description: 'Theme preview image (recommended: 400x300px).',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: { 
        description: 'Tenant this theme belongs to.',
        position: 'sidebar',
      },
      filterOptions: ({ user }) => {
        if (user?.role === 'admin') return true;
        return {
          id: {
            equals: user?.tenant,
          },
        };
      },
    },
    {
      name: 'colors',
      type: 'group',
      admin: { 
        description: 'Color palette for the theme.',
        condition: (data) => data.category !== 'custom' || true,
      },
      fields: [
        {
          name: 'primary',
          type: 'text',
          defaultValue: '#3B82F6',
          admin: { 
            description: 'Primary brand color (hex code).',
            components: {
              Field: '@/components/ColorPickerField',
            },
          },
          validate: (value: string | null | undefined) => {
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code (e.g., #3B82F6)';
            return true;
          },
        },
        {
          name: 'secondary',
          type: 'text',
          defaultValue: '#6B7280',
          admin: { 
            description: 'Secondary color (hex code).',
            components: {
              Field: '@/components/ColorPickerField',
            },
          },
          validate: (value: string | null | undefined) => {
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code (e.g., #6B7280)';
            return true;
          },
        },
        {
          name: 'accent',
          type: 'text',
          defaultValue: '#10B981',
          admin: { 
            description: 'Accent color for highlights (hex code).',
            components: {
              Field: '@/components/ColorPickerField',
            },
          },
          validate: (value: string | null | undefined) => {
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code (e.g., #10B981)';
            return true;
          },
        },
        {
          name: 'background',
          type: 'text',
          defaultValue: '#FFFFFF',
          admin: { 
            description: 'Background color (hex code).',
            components: {
              Field: '@/components/ColorPickerField',
            },
          },
          validate: (value: string | null | undefined) => {
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code (e.g., #FFFFFF)';
            return true;
          },
        },
        {
          name: 'surface',
          type: 'text',
          defaultValue: '#F9FAFB',
          admin: { 
            description: 'Surface/card background color (hex code).',
            components: {
              Field: '@/components/ColorPickerField',
            },
          },
          validate: (value: string | null | undefined) => {
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code (e.g., #F9FAFB)';
            return true;
          },
        },
        {
          name: 'text',
          type: 'group',
          admin: { description: 'Text colors for different contexts.' },
          fields: [
            {
              name: 'primary',
              type: 'text',
              defaultValue: '#111827',
              admin: { 
                description: 'Primary text color (hex code).',
                components: {
                  Field: '@/components/ColorPickerField',
                },
              },
              validate: (value: string | null | undefined) => {
                if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
                return true;
              },
            },
            {
              name: 'secondary',
              type: 'text',
              defaultValue: '#6B7280',
              admin: { 
                description: 'Secondary text color (hex code).',
                components: {
                  Field: '@/components/ColorPickerField',
                },
              },
              validate: (value: string | null | undefined) => {
                if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
                return true;
              },
            },
            {
              name: 'muted',
              type: 'text',
              defaultValue: '#9CA3AF',
              admin: { 
                description: 'Muted text color (hex code).',
                components: {
                  Field: '@/components/ColorPickerField',
                },
              },
              validate: (value: string | null | undefined) => {
                if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
                return true;
              },
            },
            {
              name: 'inverse',
              type: 'text',
              defaultValue: '#FFFFFF',
              admin: { 
                description: 'Inverse text color for dark backgrounds (hex code).',
                components: {
                  Field: '@/components/ColorPickerField',
                },
              },
              validate: (value: string | null | undefined) => {
                if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
                return true;
              },
            },
          ],
        },
        {
          name: 'border',
          type: 'text',
          defaultValue: '#E5E7EB',
          admin: { 
            description: 'Border color (hex code).',
            components: {
              Field: '@/components/ColorPickerField',
            },
          },
          validate: (value: string | null | undefined) => {
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
            return true;
          },
        },
        {
          name: 'states',
          type: 'group',
          admin: { description: 'State-specific colors.' },
          fields: [
            {
              name: 'success',
              type: 'text',
              defaultValue: '#10B981',
              admin: { 
                description: 'Success state color (hex code).',
                components: {
                  Field: '@/components/ColorPickerField',
                },
              },
              validate: (value: string | null | undefined) => {
                if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
                return true;
              },
            },
            {
              name: 'warning',
              type: 'text',
              defaultValue: '#F59E0B',
              admin: { 
                description: 'Warning state color (hex code).',
                components: {
                  Field: '@/components/ColorPickerField',
                },
              },
              validate: (value: string | null | undefined) => {
                if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
                return true;
              },
            },
            {
              name: 'error',
              type: 'text',
              defaultValue: '#EF4444',
              admin: { 
                description: 'Error state color (hex code).',
                components: {
                  Field: '@/components/ColorPickerField',
                },
              },
              validate: (value: string | null | undefined) => {
                if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
                return true;
              },
            },
            {
              name: 'info',
              type: 'text',
              defaultValue: '#3B82F6',
              admin: { 
                description: 'Info state color (hex code).',
                components: {
                  Field: '@/components/ColorPickerField',
                },
              },
              validate: (value: string | null | undefined) => {
                if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
                return true;
              },
            },
          ],
        },
        {
          name: 'gradients',
          type: 'array',
          admin: { description: 'Predefined gradient combinations.' },
          fields: [
            {
              name: 'name',
              type: 'text',
              required: true,
              admin: { description: 'Gradient name (e.g., "Primary Gradient").' },
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              admin: { description: 'CSS gradient value (e.g., "linear-gradient(45deg, #3B82F6, #10B981)").' },
            },
          ],
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
          type: 'group',
          admin: { description: 'Font family settings.' },
          fields: [
            {
              name: 'primary',
              type: 'text',
              defaultValue: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              admin: { description: 'Primary font family (CSS font-family value).' },
            },
            {
              name: 'secondary',
              type: 'text',
              defaultValue: 'Georgia, serif',
              admin: { description: 'Secondary font family for headings or accents.' },
            },
            {
              name: 'monospace',
              type: 'text',
              defaultValue: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              admin: { description: 'Monospace font family for code.' },
            },
          ],
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
              admin: { description: 'Extra small text size (12px).' },
            },
            {
              name: 'sm',
              type: 'text',
              defaultValue: '0.875rem',
              admin: { description: 'Small text size (14px).' },
            },
            {
              name: 'base',
              type: 'text',
              defaultValue: '1rem',
              admin: { description: 'Base text size (16px).' },
            },
            {
              name: 'lg',
              type: 'text',
              defaultValue: '1.125rem',
              admin: { description: 'Large text size (18px).' },
            },
            {
              name: 'xl',
              type: 'text',
              defaultValue: '1.25rem',
              admin: { description: 'Extra large text size (20px).' },
            },
            {
              name: '2xl',
              type: 'text',
              defaultValue: '1.5rem',
              admin: { description: '2X large text size (24px).' },
            },
            {
              name: '3xl',
              type: 'text',
              defaultValue: '1.875rem',
              admin: { description: '3X large text size (30px).' },
            },
            {
              name: '4xl',
              type: 'text',
              defaultValue: '2.25rem',
              admin: { description: '4X large text size (36px).' },
            },
            {
              name: '5xl',
              type: 'text',
              defaultValue: '3rem',
              admin: { description: '5X large text size (48px).' },
            },
          ],
        },
        {
          name: 'fontWeight',
          type: 'group',
          admin: { description: 'Font weights for different text elements.' },
          fields: [
            {
              name: 'light',
              type: 'text',
              defaultValue: '300',
              admin: { description: 'Light font weight.' },
            },
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
            {
              name: 'extrabold',
              type: 'text',
              defaultValue: '800',
              admin: { description: 'Extra bold font weight.' },
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
            {
              name: 'loose',
              type: 'text',
              defaultValue: '2',
              admin: { description: 'Loose line height.' },
            },
          ],
        },
        {
          name: 'letterSpacing',
          type: 'group',
          admin: { description: 'Letter spacing values.' },
          fields: [
            {
              name: 'tight',
              type: 'text',
              defaultValue: '-0.025em',
              admin: { description: 'Tight letter spacing.' },
            },
            {
              name: 'normal',
              type: 'text',
              defaultValue: '0',
              admin: { description: 'Normal letter spacing.' },
            },
            {
              name: 'wide',
              type: 'text',
              defaultValue: '0.025em',
              admin: { description: 'Wide letter spacing.' },
            },
            {
              name: 'wider',
              type: 'text',
              defaultValue: '0.05em',
              admin: { description: 'Wider letter spacing.' },
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
              admin: { description: 'Extra small padding (8px).' },
            },
            {
              name: 'sm',
              type: 'text',
              defaultValue: '0.75rem',
              admin: { description: 'Small padding (12px).' },
            },
            {
              name: 'md',
              type: 'text',
              defaultValue: '1rem',
              admin: { description: 'Medium padding (16px).' },
            },
            {
              name: 'lg',
              type: 'text',
              defaultValue: '1.5rem',
              admin: { description: 'Large padding (24px).' },
            },
            {
              name: 'xl',
              type: 'text',
              defaultValue: '2rem',
              admin: { description: 'Extra large padding (32px).' },
            },
            {
              name: '2xl',
              type: 'text',
              defaultValue: '3rem',
              admin: { description: '2X large padding (48px).' },
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
              admin: { description: 'Extra small margin (4px).' },
            },
            {
              name: 'sm',
              type: 'text',
              defaultValue: '0.5rem',
              admin: { description: 'Small margin (8px).' },
            },
            {
              name: 'md',
              type: 'text',
              defaultValue: '1rem',
              admin: { description: 'Medium margin (16px).' },
            },
            {
              name: 'lg',
              type: 'text',
              defaultValue: '1.5rem',
              admin: { description: 'Large margin (24px).' },
            },
            {
              name: 'xl',
              type: 'text',
              defaultValue: '2rem',
              admin: { description: 'Extra large margin (32px).' },
            },
            {
              name: '2xl',
              type: 'text',
              defaultValue: '3rem',
              admin: { description: '2X large margin (48px).' },
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
              admin: { description: 'Small border radius (2px).' },
            },
            {
              name: 'md',
              type: 'text',
              defaultValue: '0.375rem',
              admin: { description: 'Medium border radius (6px).' },
            },
            {
              name: 'lg',
              type: 'text',
              defaultValue: '0.5rem',
              admin: { description: 'Large border radius (8px).' },
            },
            {
              name: 'xl',
              type: 'text',
              defaultValue: '0.75rem',
              admin: { description: 'Extra large border radius (12px).' },
            },
            {
              name: '2xl',
              type: 'text',
              defaultValue: '1rem',
              admin: { description: '2X large border radius (16px).' },
            },
            {
              name: 'full',
              type: 'text',
              defaultValue: '9999px',
              admin: { description: 'Full border radius (pill shape).' },
            },
          ],
        },
        {
          name: 'shadows',
          type: 'group',
          admin: { description: 'Box shadow values.' },
          fields: [
            {
              name: 'sm',
              type: 'text',
              defaultValue: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              admin: { description: 'Small shadow.' },
            },
            {
              name: 'md',
              type: 'text',
              defaultValue: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              admin: { description: 'Medium shadow.' },
            },
            {
              name: 'lg',
              type: 'text',
              defaultValue: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              admin: { description: 'Large shadow.' },
            },
            {
              name: 'xl',
              type: 'text',
              defaultValue: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              admin: { description: 'Extra large shadow.' },
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
              defaultValue: 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200',
              admin: { description: 'Primary button CSS classes.' },
            },
            {
              name: 'secondary',
              type: 'text',
              defaultValue: 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md font-medium transition-colors duration-200',
              admin: { description: 'Secondary button CSS classes.' },
            },
            {
              name: 'outline',
              type: 'text',
              defaultValue: 'border border-blue-500 text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-md font-medium transition-colors duration-200',
              admin: { description: 'Outline button CSS classes.' },
            },
            {
              name: 'ghost',
              type: 'text',
              defaultValue: 'text-blue-500 hover:bg-blue-50 px-4 py-2 rounded-md font-medium transition-colors duration-200',
              admin: { description: 'Ghost button CSS classes.' },
            },
            {
              name: 'danger',
              type: 'text',
              defaultValue: 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200',
              admin: { description: 'Danger button CSS classes.' },
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
              defaultValue: 'border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
              admin: { description: 'Default input CSS classes.' },
            },
            {
              name: 'error',
              type: 'text',
              defaultValue: 'border border-red-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200',
              admin: { description: 'Error input CSS classes.' },
            },
            {
              name: 'success',
              type: 'text',
              defaultValue: 'border border-green-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200',
              admin: { description: 'Success input CSS classes.' },
            },
            {
              name: 'disabled',
              type: 'text',
              defaultValue: 'border border-gray-200 bg-gray-50 text-gray-400 rounded-md px-3 py-2 cursor-not-allowed',
              admin: { description: 'Disabled input CSS classes.' },
            },
          ],
        },
        {
          name: 'cards',
          type: 'group',
          admin: { description: 'Card component styles.' },
          fields: [
            {
              name: 'default',
              type: 'text',
              defaultValue: 'bg-white border border-gray-200 rounded-lg shadow-sm p-6',
              admin: { description: 'Default card CSS classes.' },
            },
            {
              name: 'elevated',
              type: 'text',
              defaultValue: 'bg-white border border-gray-200 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200',
              admin: { description: 'Elevated card CSS classes.' },
            },
            {
              name: 'outlined',
              type: 'text',
              defaultValue: 'bg-white border-2 border-gray-200 rounded-lg p-6',
              admin: { description: 'Outlined card CSS classes.' },
            },
          ],
        },
        {
          name: 'headings',
          type: 'group',
          admin: { description: 'Heading component styles.' },
          fields: [
            {
              name: 'h1',
              type: 'text',
              defaultValue: 'text-3xl font-bold text-gray-900 mb-4 leading-tight',
              admin: { description: 'H1 heading CSS classes.' },
            },
            {
              name: 'h2',
              type: 'text',
              defaultValue: 'text-2xl font-semibold text-gray-800 mb-3 leading-tight',
              admin: { description: 'H2 heading CSS classes.' },
            },
            {
              name: 'h3',
              type: 'text',
              defaultValue: 'text-xl font-medium text-gray-700 mb-2 leading-tight',
              admin: { description: 'H3 heading CSS classes.' },
            },
            {
              name: 'h4',
              type: 'text',
              defaultValue: 'text-lg font-medium text-gray-700 mb-2 leading-tight',
              admin: { description: 'H4 heading CSS classes.' },
            },
            {
              name: 'h5',
              type: 'text',
              defaultValue: 'text-base font-medium text-gray-700 mb-1 leading-tight',
              admin: { description: 'H5 heading CSS classes.' },
            },
            {
              name: 'h6',
              type: 'text',
              defaultValue: 'text-sm font-medium text-gray-700 mb-1 leading-tight',
              admin: { description: 'H6 heading CSS classes.' },
            },
          ],
        },
        {
          name: 'navigation',
          type: 'group',
          admin: { description: 'Navigation component styles.' },
          fields: [
            {
              name: 'navbar',
              type: 'text',
              defaultValue: 'bg-white border-b border-gray-200 shadow-sm',
              admin: { description: 'Navigation bar CSS classes.' },
            },
            {
              name: 'navLink',
              type: 'text',
              defaultValue: 'text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200',
              admin: { description: 'Navigation link CSS classes.' },
            },
            {
              name: 'activeNavLink',
              type: 'text',
              defaultValue: 'text-blue-600 bg-blue-50 px-3 py-2 rounded-md text-sm font-medium',
              admin: { description: 'Active navigation link CSS classes.' },
            },
          ],
        },
        {
          name: 'alerts',
          type: 'group',
          admin: { description: 'Alert component styles.' },
          fields: [
            {
              name: 'success',
              type: 'text',
              defaultValue: 'bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md',
              admin: { description: 'Success alert CSS classes.' },
            },
            {
              name: 'warning',
              type: 'text',
              defaultValue: 'bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md',
              admin: { description: 'Warning alert CSS classes.' },
            },
            {
              name: 'error',
              type: 'text',
              defaultValue: 'bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md',
              admin: { description: 'Error alert CSS classes.' },
            },
            {
              name: 'info',
              type: 'text',
              defaultValue: 'bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md',
              admin: { description: 'Info alert CSS classes.' },
            },
          ],
        },
      ],
    },
    {
      name: 'animations',
      type: 'group',
      admin: { description: 'Animation and transition settings.' },
      fields: [
        {
          name: 'transitions',
          type: 'group',
          admin: { description: 'Transition duration settings.' },
          fields: [
            {
              name: 'fast',
              type: 'text',
              defaultValue: '150ms',
              admin: { description: 'Fast transition duration.' },
            },
            {
              name: 'normal',
              type: 'text',
              defaultValue: '200ms',
              admin: { description: 'Normal transition duration.' },
            },
            {
              name: 'slow',
              type: 'text',
              defaultValue: '300ms',
              admin: { description: 'Slow transition duration.' },
            },
          ],
        },
        {
          name: 'easings',
          type: 'group',
          admin: { description: 'Easing function settings.' },
          fields: [
            {
              name: 'ease',
              type: 'text',
              defaultValue: 'ease',
              admin: { description: 'Standard ease function.' },
            },
            {
              name: 'easeIn',
              type: 'text',
              defaultValue: 'ease-in',
              admin: { description: 'Ease in function.' },
            },
            {
              name: 'easeOut',
              type: 'text',
              defaultValue: 'ease-out',
              admin: { description: 'Ease out function.' },
            },
            {
              name: 'easeInOut',
              type: 'text',
              defaultValue: 'ease-in-out',
              admin: { description: 'Ease in-out function.' },
            },
          ],
        },
      ],
    },
    {
      name: 'customCss',
      type: 'code',
      admin: { 
        description: 'Additional custom CSS for this theme.',
        language: 'css',
      },
      validate: (value: string | null | undefined) => {
        if (value && value.length > 10000) return 'Custom CSS too long (max 10,000 characters)';
        return true;
      },
    },
    {
      name: 'customVariables',
      type: 'array',
      admin: { description: 'Custom CSS variables for this theme.' },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: 'Variable name (without --prefix).' },
          validate: (value: string | null | undefined) => {
            if (value && !/^[a-zA-Z][a-zA-Z0-9\-]*$/.test(value)) {
              return 'Variable name must start with a letter and contain only letters, numbers, and hyphens';
            }
            return true;
          },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: { description: 'Variable value.' },
        },
        {
          name: 'description',
          type: 'text',
          admin: { description: 'Optional description of the variable.' },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: { 
        description: 'Whether this theme is available for use.',
        position: 'sidebar',
      },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { 
        description: 'Whether this theme is available to all tenants.',
        position: 'sidebar',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: { 
        description: 'Whether this theme is featured in the theme gallery.',
        position: 'sidebar',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: {
        description: 'Number of times this theme has been used.',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'lastUsed',
      type: 'date',
      admin: {
        description: 'Date when this theme was last used.',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'version',
      type: 'number',
      defaultValue: 1,
      admin: {
        description: 'Theme version number.',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'parentTheme',
      type: 'relationship',
      relationTo: 'editorThemes',
      admin: {
        description: 'Parent theme if this is a variant.',
        position: 'sidebar',
        condition: (data) => data.version > 1,
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
          validate: (value: string | null | undefined) => {
            if (value && value.length > 50) return 'Tag too long (max 50 characters)';
            if (value && !/^[a-zA-Z0-9\s\-_]+$/.test(value)) return 'Tag can only contain letters, numbers, spaces, hyphens, and underscores';
            return true;
          },
        },
      ],
      admin: { 
        description: 'Tags for theme organization and search.',
        components: {
          Field: '@/components/TagsField',
        },
      },
      maxRows: 10,
    },
    {
      name: 'compatibility',
      type: 'group',
      admin: { 
        description: 'Theme compatibility information.',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'minVersion',
          type: 'text',
          admin: { description: 'Minimum system version required.' },
        },
        {
          name: 'maxVersion',
          type: 'text',
          admin: { description: 'Maximum system version supported.' },
        },
        {
          name: 'supportedDevices',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Desktop', value: 'desktop' },
            { label: 'Tablet', value: 'tablet' },
            { label: 'Mobile', value: 'mobile' },
          ],
          defaultValue: ['desktop', 'tablet', 'mobile'],
          admin: { description: 'Supported device types.' },
        },
        {
          name: 'supportedBrowsers',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Chrome', value: 'chrome' },
            { label: 'Firefox', value: 'firefox' },
            { label: 'Safari', value: 'safari' },
            { label: 'Edge', value: 'edge' },
          ],
          defaultValue: ['chrome', 'firefox', 'safari', 'edge'],
          admin: { description: 'Supported browsers.' },
        },
      ],
    },
    {
      name: 'performance',
      type: 'group',
      admin: { 
        description: 'Performance metrics and settings.',
        position: 'sidebar',
      },
      fields: [
        {
          name: 'loadTime',
          type: 'number',
          admin: { 
            description: 'Average load time in milliseconds.',
            readOnly: true,
          },
        },
        {
          name: 'bundleSize',
          type: 'number',
          admin: { 
            description: 'Theme bundle size in bytes.',
            readOnly: true,
          },
        },
        {
          name: 'optimized',
          type: 'checkbox',
          defaultValue: false,
          admin: { 
            description: 'Whether this theme has been optimized.',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { 
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { 
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        // Auto-generate slug if not provided
        if (operation === 'create' && data?.name && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9\s\-_]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        }
        return data;
      },
    ],
    beforeChange: [
      ({ req, data, operation }) => {
        if (req.user) {
          if (operation === 'create') {
            data.createdBy = req.user.id;
            data.version = 1;
          }
          data.updatedBy = req.user.id;
        }
        
        // Auto-set tenant if not provided and user has tenant
        if (!data.tenant && req.user?.tenant) {
          data.tenant = req.user.tenant;
        }
        
        return data;
      },
    ],
    afterChange: [
      ({ doc, operation, previousDoc, req }) => {
        try {
          // Track theme operations
          if (operation === 'create') {
            // yoloMonitoring.trackOperation('editor_theme_created', {
            //   themeId: doc.id,
            //   themeName: doc.name,
            //   category: doc.category,
            //   tenant: doc.tenant,
            //   createdBy: doc.createdBy,
            // });
          }
          
          if (operation === 'update' && previousDoc) {
            const changes: Record<string, boolean> = {};
            
            // Track significant changes
            if (previousDoc.name !== doc.name) changes.nameChanged = true;
            if (previousDoc.category !== doc.category) changes.categoryChanged = true;
            if (previousDoc.isActive !== doc.isActive) changes.statusChanged = true;
            if (previousDoc.isPublic !== doc.isPublic) changes.visibilityChanged = true;
            
            if (Object.keys(changes).length > 0) {
              // yoloMonitoring.trackOperation('editor_theme_updated', {
              //   themeId: doc.id,
              //   themeName: doc.name,
              //   changes,
              //   updatedBy: doc.updatedBy,
              // });
            }
          }
          
          console.log(`Editor theme ${operation}d: ${doc.name} (v${doc.version}) - Category: ${doc.category}`);
        } catch (error) {
          console.error('Error in EditorThemes afterChange hook:', error);
        }
      },
    ],
    beforeDelete: [
      ({ req, id }) => {
        try {
          // yoloMonitoring.trackOperation('editor_theme_deleted', {
          //   themeId: id,
          //   deletedBy: req.user?.id,
          // });
        } catch (error) {
          console.error('Error in EditorThemes beforeDelete hook:', error);
        }
      },
    ],
    afterRead: [
      ({ doc, req }) => {
        // Track theme usage when read for application
        if (req.query?.trackUsage === 'true') {
          try {
            // Update usage count and last used date
            req.payload.update({
              collection: 'editorThemes',
              id: doc.id,
              data: {
                usageCount: (doc.usageCount || 0) + 1,
                lastUsed: new Date(),
              },
            }).catch((error: any) => {
              console.error('Error updating theme usage:', error);
            });
            
            // yoloMonitoring.trackOperation('editor_theme_used', {
            //   themeId: doc.id,
            //   themeName: doc.name,
            //   category: doc.category,
            //   usedBy: req.user?.id,
            // });
          } catch (error) {
            console.error('Error tracking theme usage:', error);
          }
        }
      },
    ],
  },
  endpoints: [
    {
      path: '/duplicate/:id',
      method: 'post',
      handler: async (req: any) => {
        try {
          const id = req.routeParams?.id;
          if (!id) {
            return Response.json({ error: 'Theme ID is required' }, { status: 400 });
          }

          let requestBody: any = {};
          if (req.json) {
            requestBody = await req.json();
          }
          const { name, description } = requestBody;
          
          // Get the original theme
          const originalTheme = await req.payload.findByID({
            collection: 'editorThemes',
            id: id as string,
          });
          
          if (!originalTheme) {
            return Response.json({ error: 'Theme not found' }, { status: 404 });
          }
          
          // Create duplicate with new name
          const duplicateData = {
            ...originalTheme,
            id: undefined,
            name: name || `${originalTheme.name} (Copy)`,
            description: description || `Copy of ${originalTheme.name}`,
            slug: undefined, // Will be auto-generated
            usageCount: 0,
            lastUsed: undefined,
            version: 1,
            parentTheme: originalTheme.id,
            createdAt: undefined,
            updatedAt: undefined,
          };
          
          const duplicate = await req.payload.create({
            collection: 'editorThemes',
            data: duplicateData,
          });
          
          // yoloMonitoring.trackOperation('editor_theme_duplicated', {
          //   originalThemeId: originalTheme.id,
          //   duplicateThemeId: duplicate.id,
          //   duplicatedBy: req.user?.id,
          // });
          
          return Response.json(duplicate, { status: 200 });
        } catch (error: any) {
          console.error('Error duplicating theme:', error);
          return Response.json({ error: 'Failed to duplicate theme' }, { status: 500 });
        }
      },
    },
    {
      path: '/export/:id',
      method: 'get',
      handler: async (req: any) => {
        try {
          const id = req.routeParams?.id;
          if (!id) {
            return Response.json({ error: 'Theme ID is required' }, { status: 400 });
          }
          
          const theme = await req.payload.findByID({
            collection: 'editorThemes',
            id: id as string,
          });
          
          if (!theme) {
            return Response.json({ error: 'Theme not found' }, { status: 404 });
          }
          
          // Remove internal fields for export
          const exportData = {
            ...theme,
            id: undefined,
            createdAt: undefined,
            updatedAt: undefined,
            createdBy: undefined,
            updatedBy: undefined,
            usageCount: undefined,
            lastUsed: undefined,
            tenant: undefined,
          };
          
          // yoloMonitoring.trackOperation('editor_theme_exported', {
          //   themeId: theme.id,
          //   themeName: theme.name,
          //   exportedBy: req.user?.id,
          // });
          
          return Response.json(exportData, { status: 200 });
        } catch (error: any) {
          console.error('Error exporting theme:', error);
          return Response.json({ error: 'Failed to export theme' }, { status: 500 });
        }
      },
    },
  ],
  indexes: [
    { fields: ['tenant', 'category'] },
    { fields: ['tenant', 'isActive'] },
    { fields: ['isActive', 'isPublic'] },
    { fields: ['usageCount'] },
    { fields: ['category', 'isFeatured'] },
    { fields: ['slug'] },
    { fields: ['tags.tag'] },
    { fields: ['createdAt'] },
    { fields: ['lastUsed'] },
  ],
  timestamps: true,
  versions: {
    maxPerDoc: 10,
    drafts: true,
  },
};
