import type { CollectionConfig, AccessResult, Where } from 'payload'
import { yoloMonitoring } from '../../lib/monitoring'

export const EditorPlugins: CollectionConfig = {
  slug: 'editorPlugins',
  labels: {
    singular: 'Editor Plugin',
    plural: 'Editor Plugins',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Editor',
    description: 'Editor plugins and extensions for enhanced functionality.',
    defaultColumns: ['name', 'type', 'version', 'isActive', 'tenant', 'usageCount'],
    listSearchableFields: ['name', 'description', 'author', 'tags.tag'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) return false
      const userRole = req.user.role
      if (userRole === 'admin' || userRole === 'manager') return true
      // Users can see public plugins or plugins for their tenant
      return {
        or: [
          { isPublic: { equals: true } },
          { tenant: { equals: req.user.tenant?.id } },
        ],
      } as Where
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return req.user.role === 'admin'
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      const userRole = req.user.role
      if (userRole === 'admin') return true
      // Managers can update plugins for their tenant
      if (userRole === 'manager') {
        return { tenant: { equals: req.user.tenant?.id } } as Where
      }
      return false
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      return req.user.role === 'admin'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'Plugin name for identification.' },
      validate: (value: string | null | undefined) => {
        if (!value || value.length < 1) return 'Plugin name is required'
        if (value.length > 100) return 'Plugin name too long (max 100 characters)'
        return true
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { 
        description: 'URL-friendly identifier for the plugin.',
        position: 'sidebar',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return 'Slug is required'
        if (!/^[a-z0-9-]+$/.test(value)) return 'Slug must contain only lowercase letters, numbers, and hyphens'
        return true
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Brief description of what this plugin does.' },
      validate: (value: string | null | undefined) => {
        if (value && value.length > 500) return 'Description too long (max 500 characters)'
        return true
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
      required: true,
      index: true,
      admin: { description: 'Plugin category/type.' },
    },
    {
      name: 'version',
      type: 'text',
      required: true,
      defaultValue: '1.0.0',
      admin: { description: 'Plugin version (semantic versioning).' },
      validate: (value: string | null | undefined) => {
        if (!value || !/^\d+\.\d+\.\d+$/.test(value)) return 'Version must be in semantic format (x.y.z)'
        return true
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
      defaultValue: 'MIT',
      admin: { description: 'Plugin license information.' },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      index: true,
      admin: { 
        description: 'Tenant this plugin belongs to.',
        position: 'sidebar',
      },
    },
    {
      name: 'configuration',
      type: 'json',
      admin: { 
        description: 'Plugin configuration settings in JSON format.',
        components: {
          Field: '@/components/JSONField',
        },
      },
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
          name: 'autoLoad',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Automatically load this plugin on editor initialization.' },
        },
        {
          name: 'lazyLoad',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Load plugin only when needed (improves performance).' },
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
              validate: (value: string | null | undefined) => {
                if (value && !/^\d+\.\d+\.\d+$/.test(value)) return 'Version must be in semantic format (x.y.z)'
                return true
              },
            },
            {
              name: 'optional',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: 'Whether this dependency is optional.' },
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
            {
              name: 'reason',
              type: 'text',
              admin: { description: 'Reason for the conflict.' },
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
        {
          name: 'realtime',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Supports real-time collaboration features.' },
        },
        {
          name: 'offline',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Works in offline mode.' },
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
          validate: (value: string | null | undefined) => {
            if (value && !/^#[0-9A-F]{6}$/i.test(value)) return 'Invalid hex color code'
            return true
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
        {
          name: 'shortcut',
          type: 'text',
          admin: { description: 'Keyboard shortcut (e.g., "Ctrl+B").' },
        },
        {
          name: 'position',
          type: 'select',
          options: [
            { label: 'Start', value: 'start' },
            { label: 'Middle', value: 'middle' },
            { label: 'End', value: 'end' },
          ],
          defaultValue: 'middle',
          admin: { description: 'Position in toolbar or menu.' },
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
        {
          name: 'screenReaderFriendly',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Accessible to screen readers.' },
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
          name: 'manifest',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Plugin manifest file (JSON).' },
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
                { label: 'Template', value: 'template' },
                { label: 'Other', value: 'other' },
              ],
              defaultValue: 'other',
              required: true,
            },
            {
              name: 'loadOrder',
              type: 'number',
              defaultValue: 0,
              admin: { description: 'Loading order for this asset.' },
            },
          ],
        },
      ],
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { 
        description: 'Available to all tenants.',
        position: 'sidebar',
      },
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
        {
          name: 'restrictedFeatures',
          type: 'array',
          admin: { description: 'Features that require special permissions.' },
          fields: [
            {
              name: 'feature',
              type: 'text',
              required: true,
            },
            {
              name: 'requiredRole',
              type: 'select',
              options: [
                { label: 'Admin', value: 'admin' },
                { label: 'Manager', value: 'manager' },
                { label: 'Barber', value: 'barber' },
                { label: 'Customer', value: 'customer' },
              ],
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'usage',
      type: 'group',
      admin: { 
        description: 'Plugin usage statistics.',
        condition: (data) => data.isActive,
      },
      fields: [
        {
          name: 'usageCount',
          type: 'number',
          defaultValue: 0,
          index: true,
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
          name: 'rating',
          type: 'number',
          min: 0,
          max: 5,
          admin: {
            description: 'Average user rating (0-5 stars).',
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
            {
              name: 'cpuUsage',
              type: 'number',
              admin: {
                description: 'Average CPU usage percentage.',
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
          type: 'richText',
          admin: { description: 'Plugin README and usage instructions.' },
        },
        {
          name: 'changelog',
          type: 'richText',
          admin: { description: 'Plugin version changelog.' },
        },
        {
          name: 'supportUrl',
          type: 'text',
          admin: { description: 'URL for plugin support.' },
          validate: (value: string | null | undefined) => {
            if (value && !/^https?:\/\/.+/.test(value)) return 'Must be a valid URL'
            return true
          },
        },
        {
          name: 'documentationUrl',
          type: 'text',
          admin: { description: 'URL for detailed documentation.' },
          validate: (value: string | null | undefined) => {
            if (value && !/^https?:\/\/.+/.test(value)) return 'Must be a valid URL'
            return true
          },
        },
        {
          name: 'repositoryUrl',
          type: 'text',
          admin: { description: 'Source code repository URL.' },
          validate: (value: string | null | undefined) => {
            if (value && !/^https?:\/\/.+/.test(value)) return 'Must be a valid URL'
            return true
          },
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
              type: 'select',
              options: [
                { label: 'JavaScript', value: 'javascript' },
                { label: 'TypeScript', value: 'typescript' },
                { label: 'HTML', value: 'html' },
                { label: 'CSS', value: 'css' },
                { label: 'JSON', value: 'json' },
              ],
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
      index: true,
      admin: { 
        description: 'Whether this plugin is active and available.',
        position: 'sidebar',
      },
    },
    {
      name: 'isBeta',
      type: 'checkbox',
      defaultValue: false,
      admin: { 
        description: 'Whether this is a beta/preview version.',
        position: 'sidebar',
      },
    },
    {
      name: 'isDeprecated',
      type: 'checkbox',
      defaultValue: false,
      admin: { 
        description: 'Whether this plugin is deprecated.',
        position: 'sidebar',
      },
    },
    {
      name: 'deprecationMessage',
      type: 'textarea',
      admin: { 
        description: 'Message to display for deprecated plugins.',
        condition: (data) => data.isDeprecated,
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
            if (!value) return 'Tag is required'
            if (value.length > 50) return 'Tag too long (max 50 characters)'
            return true
          },
        },
      ],
      admin: { description: 'Tags for plugin organization and search.' },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'pluginCategories',
      admin: { description: 'Plugin category for better organization.' },
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
      ({ data }) => {
        // Auto-generate slug from name if not provided
        if (data && data.name && !data.slug) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
    beforeChange: [
      ({ req, data, operation }) => {
        if (req.user) {
          if (operation === 'create') {
            data.createdBy = req.user.id
            data.tenant = data.tenant || req.user.tenant
          }
          data.updatedBy = req.user.id
        }

        // Validate dependencies don't create circular references
        if (data.settings?.dependencies) {
          // This would need more complex validation in a real implementation
          // to check for circular dependencies
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        if (operation === 'create' || operation === 'update') {
          console.log(`Editor plugin ${operation}d: ${doc.name} (v${doc.version})`)
          
          // Track plugin operations
          if (yoloMonitoring) {
            yoloMonitoring.trackCollectionOperation('editorPlugins', operation, doc.id)
            yoloMonitoring.trackOperation(`plugin_${operation}`, {
              pluginId: doc.id,
              pluginName: doc.name,
              version: doc.version,
              type: doc.type,
              tenant: doc.tenant,
              userId: req.user?.id,
            })
          }
        }
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Check if plugin is being used before deletion
        if (req.payload) {
          const plugin = await req.payload.findByID({
            collection: 'editorPlugins',
            id: id,
          })
          if (plugin && plugin.usage?.activeUsers > 0) {
            throw new Error('Cannot delete plugin that is currently in use')
          }
        }
      },
    ],
    afterDelete: [
      ({ doc, req }) => {
        console.log(`Editor plugin deleted: ${doc.name}`)
        
        // Track plugin deletion
        if (yoloMonitoring) {
          yoloMonitoring.trackCollectionOperation('editorPlugins', 'delete', doc.id)
          yoloMonitoring.trackOperation('plugin_deleted', {
            pluginId: doc.id,
            pluginName: doc.name,
            userId: req.user?.id,
          })
        }
      },
    ],
  },
  indexes: [
    { fields: ['tenant', 'type'] },
    { fields: ['isActive', 'isPublic'] },
    { fields: ['slug'], unique: true },
    { fields: ['usage.usageCount'] },
    { fields: ['usage.rating'] },
    { fields: ['type', 'isActive'] },
    { fields: ['createdAt'] },
  ],
  timestamps: true,
}
