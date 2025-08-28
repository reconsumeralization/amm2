import { CollectionConfig } from 'payload';

export const EditorPlugins: CollectionConfig = {
  slug: 'editorPlugins',
  admin: {
    useAsTitle: 'name',
    group: 'Editor',
    description: 'Editor plugins and extensions for enhanced functionality.',
    defaultColumns: ['name', 'type', 'version', 'isActive'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    create: ({ req }) => req.user?.role === 'admin',
    update: ({ req }) => req.user?.role === 'admin',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'Plugin name for identification.' },
      validate: (value) => {
        if (!value || value.length < 1) return 'Plugin name is required';
        if (value.length > 100) return 'Plugin name too long (max 100 characters)';
        return true;
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Brief description of what this plugin does.' },
      validate: (value) => {
        if (value && value.length > 500) return 'Description too long (max 500 characters)';
        return true;
      },
    },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Rich Text', value: 'rich-text' },
        { label: 'Media', value: 'media' },
        { label: 'Embed', value: 'embed' },
        { label: 'AI Content', value: 'ai-content' },
        { label: 'Interactive', value: 'interactive' },
        { label: 'Utility', value: 'utility' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'utility',
      index: true,
      admin: { description: 'Plugin category/type.' },
    },
    {
      name: 'version',
      type: 'text',
      required: true,
      defaultValue: '1.0.0',
      admin: { description: 'Plugin version (semantic versioning).' },
      validate: (value) => {
        if (!value || !/^\d+\.\d+\.\d+$/.test(value)) return 'Version must be in semantic format (x.y.z)';
        return true;
      },
    },
    {
      name: 'author',
      type: 'text',
      admin: { description: 'Plugin author or developer.' },
    },
    {
      name: 'license',
      type: 'text',
      admin: { description: 'Plugin license information.' },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: { description: 'Tenant this plugin belongs to.' },
    },
    {
      name: 'configuration',
      type: 'json',
      admin: { description: 'Plugin configuration settings.' },
    },
    {
      name: 'settings',
      type: 'group',
      admin: { description: 'Plugin-specific settings and options.' },
      fields: [
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Whether this plugin is enabled.' },
        },
        {
          name: 'priority',
          type: 'number',
          defaultValue: 0,
          min: -100,
          max: 100,
          admin: { description: 'Plugin loading priority (-100 to 100).' },
        },
        {
          name: 'dependencies',
          type: 'array',
          admin: { description: 'Other plugins this plugin depends on.' },
          fields: [
            {
              name: 'plugin',
              type: 'relationship',
              relationTo: 'editorPlugins',
              required: true,
            },
            {
              name: 'version',
              type: 'text',
              admin: { description: 'Required version of the dependency.' },
            },
          ],
        },
        {
          name: 'conflicts',
          type: 'array',
          admin: { description: 'Plugins that conflict with this one.' },
          fields: [
            {
              name: 'plugin',
              type: 'relationship',
              relationTo: 'editorPlugins',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'capabilities',
      type: 'group',
      admin: { description: 'Plugin capabilities and features.' },
      fields: [
        {
          name: 'toolbar',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Adds buttons to the editor toolbar.' },
        },
        {
          name: 'contextMenu',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Adds items to the context menu.' },
        },
        {
          name: 'keyboard',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Adds keyboard shortcuts.' },
        },
        {
          name: 'dragDrop',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Supports drag and drop operations.' },
        },
        {
          name: 'autoComplete',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Provides autocomplete functionality.' },
        },
        {
          name: 'validation',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Adds content validation.' },
        },
        {
          name: 'export',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Supports content export.' },
        },
        {
          name: 'import',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Supports content import.' },
        },
      ],
    },
    {
      name: 'ui',
      type: 'group',
      admin: { description: 'User interface components and styling.' },
      fields: [
        {
          name: 'icon',
          type: 'text',
          admin: { description: 'Plugin icon identifier (for toolbar buttons).' },
        },
        {
          name: 'color',
          type: 'text',
          admin: { description: 'Plugin accent color (hex code).' },
          validate: (value) => {
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code';
            return true;
          },
        },
        {
          name: 'toolbarGroup',
          type: 'text',
          admin: { description: 'Toolbar group this plugin belongs to.' },
        },
        {
          name: 'menuLabel',
          type: 'text',
          admin: { description: 'Label for menu items.' },
        },
        {
          name: 'tooltip',
          type: 'text',
          admin: { description: 'Tooltip text for buttons.' },
        },
      ],
    },
    {
      name: 'compatibility',
      type: 'group',
      admin: { description: 'Browser and editor compatibility.' },
      fields: [
        {
          name: 'browsers',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Chrome', value: 'chrome' },
            { label: 'Firefox', value: 'firefox' },
            { label: 'Safari', value: 'safari' },
            { label: 'Edge', value: 'edge' },
            { label: 'IE11', value: 'ie11' },
          ],
          admin: { description: 'Supported browsers.' },
        },
        {
          name: 'minEditorVersion',
          type: 'text',
          admin: { description: 'Minimum editor version required.' },
        },
        {
          name: 'maxEditorVersion',
          type: 'text',
          admin: { description: 'Maximum editor version supported.' },
        },
        {
          name: 'mobileCompatible',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Compatible with mobile devices.' },
        },
        {
          name: 'touchFriendly',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Optimized for touch interfaces.' },
        },
      ],
    },
    {
      name: 'files',
      type: 'group',
      admin: { description: 'Plugin files and assets.' },
      fields: [
        {
          name: 'mainScript',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Main plugin JavaScript file.' },
        },
        {
          name: 'styles',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Plugin CSS styles.' },
        },
        {
          name: 'assets',
          type: 'array',
          admin: { description: 'Additional plugin assets.' },
          fields: [
            {
              name: 'file',
              type: 'upload',
              relationTo: 'media',
              required: true,
            },
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Script', value: 'script' },
                { label: 'Style', value: 'style' },
                { label: 'Image', value: 'image' },
                { label: 'Font', value: 'font' },
                { label: 'Other', value: 'other' },
              ],
              defaultValue: 'other',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Available to all tenants.' },
    },
    {
      name: 'permissions',
      type: 'group',
      admin: { description: 'Advanced plugin access permissions.' },
      fields: [
        {
          name: 'requiredRoles',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Manager', value: 'manager' },
            { label: 'Barber', value: 'barber' },
            { label: 'Customer', value: 'customer' },
          ],
          admin: { description: 'User roles required to use this plugin.' },
        },
        {
          name: 'allowedTenants',
          type: 'relationship',
          relationTo: 'tenants',
          hasMany: true,
          admin: { description: 'Specific tenants allowed to use this plugin.' },
        },
      ],
    },
    {
      name: 'usage',
      type: 'group',
      admin: { description: 'Plugin usage statistics.' },
      fields: [
        {
          name: 'usageCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of times this plugin has been used.',
            readOnly: true,
          },
        },
        {
          name: 'lastUsed',
          type: 'date',
          admin: {
            description: 'Date when this plugin was last used.',
            readOnly: true,
          },
        },
        {
          name: 'activeUsers',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of active users currently using this plugin.',
            readOnly: true,
          },
        },
        {
          name: 'errorCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of errors reported for this plugin.',
            readOnly: true,
          },
        },
        {
          name: 'performance',
          type: 'group',
          admin: { description: 'Performance metrics.' },
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
              name: 'memoryUsage',
              type: 'number',
              admin: {
                description: 'Average memory usage in MB.',
                readOnly: true,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'documentation',
      type: 'group',
      admin: { description: 'Plugin documentation and support.' },
      fields: [
        {
          name: 'readme',
          type: 'textarea',
          admin: { description: 'Plugin README and usage instructions.' },
        },
        {
          name: 'changelog',
          type: 'textarea',
          admin: { description: 'Plugin version changelog.' },
        },
        {
          name: 'supportUrl',
          type: 'text',
          admin: { description: 'URL for plugin support.' },
        },
        {
          name: 'documentationUrl',
          type: 'text',
          admin: { description: 'URL for detailed documentation.' },
        },
        {
          name: 'examples',
          type: 'array',
          admin: { description: 'Usage examples and code snippets.' },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
            },
            {
              name: 'description',
              type: 'text',
            },
            {
              name: 'code',
              type: 'textarea',
              required: true,
            },
            {
              name: 'language',
              type: 'text',
              defaultValue: 'javascript',
            },
          ],
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Whether this plugin is active and available.' },
    },
    {
      name: 'isBeta',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Whether this is a beta/preview version.' },
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
      admin: { description: 'Tags for plugin organization and search.' },
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
          console.log(`Editor plugin ${operation}d: ${doc.name} (v${doc.version})`);
        }
      },
    ],
  },
  indexes: [
    { fields: ['tenant', 'type'] },
    { fields: ['isActive'] },
    { fields: ['isPublic'] },
    { fields: ['usage.usageCount'] },
  ],
  timestamps: true,
};
