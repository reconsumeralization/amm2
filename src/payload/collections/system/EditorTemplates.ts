import type { CollectionConfig, AccessResult, Where } from 'payload'
import { yoloMonitoring } from '../../lib/monitoring'

export const EditorTemplates: CollectionConfig = {
  slug: 'editorTemplates',
  labels: {
    singular: 'Editor Template',
    plural: 'Editor Templates',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Editor',
    description: 'Reusable content templates for the visual editor.',
    defaultColumns: ['name', 'category', 'isActive', 'usageCount', 'rating', 'tenant'],
    listSearchableFields: ['name', 'description', 'tags.tag', 'metadata.author'],
    pagination: {
      defaultLimit: 25,
      limits: [10, 25, 50, 100],
    },
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) return false
      const userRole = (req.user as any)?.role
      if (userRole === 'admin' || userRole === 'manager') return true
      if (userRole === 'barber') {
        // Barbers can see public templates or templates for their tenant
        return {
          or: [
            { isPublic: { equals: true } },
            { tenant: { equals: (req.user as any)?.tenant?.id } },
          ],
        } as Where
      }
      return false
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'manager'
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      const userRole = (req.user as any)?.role
      if (userRole === 'admin') return true
      // Managers can update templates for their tenant
      if (userRole === 'manager') {
        return { tenant: { equals: (req.user as any)?.tenant?.id } } as Where
      }
      return false
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      return (req.user as any)?.role === 'admin'
    },
  },
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (req.user) {
          if (operation === 'create') {
            data.createdBy = req.user.id
            data.tenant = data.tenant || (req.user as any)?.tenant
          }
          data.updatedBy = req.user.id
        }
        
        // Auto-increment version on updates
        if (operation === 'update' && data.templateData) {
          data.version = (data.version || 1) + 1
        }
        
        return data
      },
    ],
    afterChange: [
      ({ doc, operation, previousDoc }) => {
        // Track template operations
        yoloMonitoring.trackCollectionOperation('editorTemplates', operation, doc.id)
        
        if (operation === 'create') {
          yoloMonitoring.trackOperation('template_created', {
            templateId: doc.id,
            templateName: doc.name,
            category: doc.category,
            tenant: doc.tenant,
            isPublic: doc.isPublic
          })
        }
        
        if (operation === 'update' && previousDoc) {
          // Track template usage
          if (previousDoc.usageCount !== doc.usageCount) {
            yoloMonitoring.trackOperation('template_used', {
              templateId: doc.id,
              templateName: doc.name,
              usageCount: doc.usageCount,
              tenant: doc.tenant
            })
          }
          
          // Track rating changes
          if (previousDoc.rating !== doc.rating) {
            yoloMonitoring.trackOperation('template_rated', {
              templateId: doc.id,
              templateName: doc.name,
              previousRating: previousDoc.rating,
              newRating: doc.rating,
              reviewCount: doc.reviewCount
            })
          }
        }
      },
    ],
    afterDelete: [
      ({ doc }) => {
        yoloMonitoring.trackCollectionOperation('editorTemplates', 'delete', doc.id)
        yoloMonitoring.trackOperation('template_deleted', {
          templateId: doc.id,
          templateName: doc.name,
          category: doc.category,
          usageCount: doc.usageCount,
          tenant: doc.tenant
        })
      }
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'Template name for identification.' },
      validate: (value: string | null | undefined) => {
        if (!value || value.length < 1) return 'Template name is required'
        if (value.length > 100) return 'Template name too long (max 100 characters)'
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
        description: 'URL-friendly identifier for the template.',
      },
      hooks: {
        beforeChange: [
          ({ siblingData }) => {
            if (siblingData.name && !siblingData.slug) {
              return siblingData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return siblingData.slug
          },
        ],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Brief description of what this template is for.' },
      validate: (value: string | null | undefined) => {
        if (value && value.length > 500) return 'Description too long (max 500 characters)'
        return true
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Landing Page', value: 'landing' },
        { label: 'About Page', value: 'about' },
        { label: 'Services Page', value: 'services' },
        { label: 'Contact Page', value: 'contact' },
        { label: 'Blog Post', value: 'blog' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Portfolio', value: 'portfolio' },
        { label: 'Testimonial', value: 'testimonial' },
        { label: 'Call-to-Action', value: 'cta' },
        { label: 'Hero Section', value: 'hero' },
        { label: 'Features', value: 'features' },
        { label: 'Pricing', value: 'pricing' },
        { label: 'Team', value: 'team' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'custom',
      required: true,
      index: true,
      admin: { description: 'Template category for organization.' },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media' as any as any,
      admin: { description: 'Template preview image.' },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      index: true,
      admin: { description: 'Tenant this template belongs to.' },
    },
    {
      name: 'templateData',
      type: 'json',
      required: true,
      admin: {
        description: 'JSON structure of the template components and layout.',
        readOnly: false,
      },
      validate: (value: any) => {
        if (!value) return 'Template data is required'
        try {
          if (typeof value === 'string') {
            JSON.parse(value)
          }
          return true
        } catch (error) {
          return 'Invalid JSON format'
        }
      },
    },
    {
      name: 'lexicalTemplate',
      type: 'json',
      admin: {
        description: 'Lexical editor template state.',
      },
      validate: (value: any) => {
        if (value) {
          try {
            if (typeof value === 'string') {
              JSON.parse(value)
            }
            return true
          } catch (error) {
            return 'Invalid JSON format for Lexical template'
          }
        }
        return true
      },
    },
    {
      name: 'css',
      type: 'textarea',
      admin: { description: 'Custom CSS styles for this template.' },
    },
    {
      name: 'js',
      type: 'textarea',
      admin: { description: 'Custom JavaScript for this template.' },
    },
    {
      name: 'variables',
      type: 'array',
      admin: { description: 'Dynamic variables that can be customized when using this template.' },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: 'Variable name (e.g., "title", "description").' },
          validate: (value: string | null | undefined) => {
            if (!value) return 'Variable name is required'
            if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
              return 'Variable name must be a valid identifier'
            }
            return true
          },
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Rich Text', value: 'richText' },
            { label: 'Image', value: 'image' },
            { label: 'Link', value: 'link' },
            { label: 'Color', value: 'color' },
            { label: 'Number', value: 'number' },
            { label: 'Boolean', value: 'boolean' },
          ],
          defaultValue: 'text',
          required: true,
          admin: { description: 'Variable data type.' },
        },
        {
          name: 'defaultValue',
          type: 'text',
          admin: { description: 'Default value for this variable.' },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { description: 'Human-readable label for the variable.' },
        },
        {
          name: 'description',
          type: 'text',
          admin: { description: 'Help text for this variable.' },
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Whether this variable must be filled.' },
        },
        {
          name: 'validation',
          type: 'group',
          admin: { description: 'Validation rules for this variable.' },
          fields: [
            {
              name: 'minLength',
              type: 'number',
              min: 0,
              admin: { description: 'Minimum length (for text).' },
            },
            {
              name: 'maxLength',
              type: 'number',
              min: 1,
              admin: { description: 'Maximum length (for text).' },
            },
            {
              name: 'pattern',
              type: 'text',
              admin: { description: 'Regex pattern for validation.' },
              validate: (value: string | null | undefined) => {
                if (value) {
                  try {
                    new RegExp(value)
                    return true
                  } catch (error) {
                    return 'Invalid regex pattern'
                  }
                }
                return true
              },
            },
            {
              name: 'allowedTypes',
              type: 'array',
              admin: { description: 'Allowed file types (for images).' },
              fields: [
                {
                  name: 'type',
                  type: 'text',
                  required: true,
                  validate: (value: string | null | undefined) => {
                    if (!value) return 'File type is required'
                    if (!/^[a-z]+\/[a-z0-9\-\+]+$/i.test(value)) {
                      return 'Invalid MIME type format'
                    }
                    return true
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'blocks',
      type: 'array',
      admin: { description: 'Pre-defined content blocks within this template.' },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: { description: 'Block name for identification.' },
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Image', value: 'image' },
            { label: 'Button', value: 'button' },
            { label: 'Video', value: 'video' },
            { label: 'Quote', value: 'quote' },
            { label: 'List', value: 'list' },
            { label: 'Table', value: 'table' },
            { label: 'Custom', value: 'custom' },
          ],
          defaultValue: 'text',
          required: true,
          admin: { description: 'Block type.' },
        },
        {
          name: 'content',
          type: 'json',
          admin: { description: 'Block content structure.' },
        },
        {
          name: 'position',
          type: 'number',
          min: 0,
          admin: { description: 'Display position/order.' },
        },
        {
          name: 'isRequired',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Whether this block is required.' },
        },
        {
          name: 'isEditable',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Whether this block can be edited.' },
        },
      ],
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
      admin: { description: 'Tags for template organization and search.' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: { description: 'Whether this template is available for use.' },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { description: 'Whether this template is available to all tenants.' },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      index: true,
      admin: {
        description: 'Number of times this template has been used.',
        readOnly: true,
      },
    },
    {
      name: 'lastUsed',
      type: 'date',
      admin: {
        description: 'Date when this template was last used.',
        readOnly: true,
      },
    },
    {
      name: 'rating',
      type: 'number',
      min: 0,
      max: 5,
      defaultValue: 0,
      index: true,
      admin: {
        description: 'Average user rating (0-5 stars).',
        readOnly: true,
      },
    },
    {
      name: 'reviewCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        description: 'Number of user reviews.',
        readOnly: true,
      },
    },
    {
      name: 'version',
      type: 'number',
      defaultValue: 1,
      min: 1,
      admin: {
        description: 'Template version number.',
        readOnly: true,
      },
    },
    {
      name: 'parentTemplate',
      type: 'relationship',
      relationTo: 'editorTemplates' as any as any,
      admin: {
        description: 'Parent template if this is a variant.',
        readOnly: true,
      },
    },
    {
      name: 'compatibility',
      type: 'group',
      admin: { description: 'Editor and plugin compatibility requirements.' },
      fields: [
        {
          name: 'minEditorVersion',
          type: 'text',
          admin: { description: 'Minimum editor version required.' },
          validate: (value: string | null | undefined) => {
            if (value && !/^\d+\.\d+\.\d+$/.test(value)) {
              return 'Version must be in format x.y.z'
            }
            return true
          },
        },
        {
          name: 'requiredPlugins',
          type: 'array',
          admin: { description: 'Required plugins for this template.' },
          fields: [
            {
              name: 'plugin',
              type: 'text',
              required: true,
            },
            {
              name: 'version',
              type: 'text',
              admin: { description: 'Minimum plugin version.' },
              validate: (value: string | null | undefined) => {
                if (value && !/^\d+\.\d+\.\d+$/.test(value)) {
                  return 'Version must be in format x.y.z'
                }
                return true
              },
            },
          ],
        },
        {
          name: 'supportedThemes',
          type: 'array',
          admin: { description: 'Themes that work well with this template.' },
          fields: [
            {
              name: 'theme',
              type: 'relationship',
              relationTo: 'editorThemes' as any as any,
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'metadata',
      type: 'group',
      admin: { description: 'Additional metadata for the template.' },
      fields: [
        {
          name: 'author',
          type: 'text',
          admin: { description: 'Template author/creator.' },
        },
        {
          name: 'license',
          type: 'text',
          admin: { description: 'Template license information.' },
        },
        {
          name: 'documentation',
          type: 'textarea',
          admin: { description: 'Usage documentation and instructions.' },
        },
        {
          name: 'changelog',
          type: 'textarea',
          admin: { description: 'Template version changelog.' },
        },
        {
          name: 'keywords',
          type: 'array',
          admin: { description: 'SEO keywords for template discovery.' },
          fields: [
            {
              name: 'keyword',
              type: 'text',
              required: true,
              validate: (value: string | null | undefined) => {
                if (!value) return 'Keyword is required'
                if (value.length > 30) return 'Keyword too long (max 30 characters)'
                return true
              },
            },
          ],
        },
      ],
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: { readOnly: true },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: { readOnly: true },
    },
  ],
  indexes: [
    { fields: ['tenant', 'category'] },
    { fields: ['isActive', 'isPublic'] },
    { fields: ['usageCount'] },
    { fields: ['rating'] },
    { fields: ['slug'] },
    { fields: ['tags.tag'] },
  ],
  timestamps: true,
}
