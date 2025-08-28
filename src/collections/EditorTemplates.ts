import { CollectionConfig } from 'payload';

export const EditorTemplates: CollectionConfig = {
  slug: 'editorTemplates',
  admin: {
    useAsTitle: 'name',
    group: 'Editor',
    description: 'Reusable content templates for the visual editor.',
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
      admin: { description: 'Template name for identification.' },
      validate: (value) => {
        if (!value || value.length < 1) return 'Template name is required';
        if (value.length > 100) return 'Template name too long (max 100 characters)';
        return true;
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Brief description of what this template is for.' },
      validate: (value) => {
        if (value && value.length > 500) return 'Description too long (max 500 characters)';
        return true;
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
      index: true,
      admin: { description: 'Template category for organization.' },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Template preview image.' },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
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
    },
    {
      name: 'lexicalTemplate',
      type: 'json',
      admin: {
        description: 'Lexical editor template state.',
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
              admin: { description: 'Minimum length (for text).' },
            },
            {
              name: 'maxLength',
              type: 'number',
              admin: { description: 'Maximum length (for text).' },
            },
            {
              name: 'pattern',
              type: 'text',
              admin: { description: 'Regex pattern for validation.' },
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
        },
      ],
      admin: { description: 'Tags for template organization and search.' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Whether this template is available for use.' },
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Whether this template is available to all tenants.' },
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
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
      admin: {
        description: 'Template version number.',
        readOnly: true,
      },
    },
    {
      name: 'parentTemplate',
      type: 'relationship',
      relationTo: 'editorTemplates',
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
              relationTo: 'editorThemes',
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
      ],
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
          console.log(`Editor template ${operation}d: ${doc.name} (v${doc.version})`);
        }
      },
    ],
  },
  indexes: [
    { fields: ['tenant', 'category'] },
    { fields: ['isActive'] },
    { fields: ['isPublic'] },
    { fields: ['usageCount'] },
    { fields: ['rating'] },
  ],
  timestamps: true,
};
