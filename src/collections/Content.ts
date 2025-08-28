import { CollectionConfig } from 'payload';

export const Content: CollectionConfig = {
  slug: 'content',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description: 'Page content and layouts created with the visual page builder.',
    defaultColumns: ['title', 'slug', 'status', 'template', 'updatedAt'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber' || req.user?.role === 'manager',
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber' || req.user?.role === 'manager',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'Page title for display purposes.' },
      validate: (value) => {
        if (!value || value.length < 1) return 'Title is required';
        if (value.length > 200) return 'Title too long (max 200 characters)';
        return true;
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Unique identifier for the page (e.g., "home", "services").' },
      validate: (value) => {
        if (!value || value.length < 1) return 'Slug is required';
        if (!/^[a-z0-9-]+$/.test(value)) return 'Slug can only contain lowercase letters, numbers, and hyphens';
        if (value.length > 100) return 'Slug too long (max 100 characters)';
        return true;
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Brief description of the page content.' },
      validate: (value) => {
        if (value && value.length > 500) return 'Description too long (max 500 characters)';
        return true;
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: { description: 'Tenant this content belongs to.' },
    },
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'editorTemplates',
      admin: { description: 'Template used to create this content.' },
    },
    {
      name: 'theme',
      type: 'relationship',
      relationTo: 'editorThemes',
      admin: { description: 'Theme applied to this content.' },
    },
    {
      name: 'content',
      type: 'json',
      required: true,
      admin: {
        description: 'JSON representation of page builder components.',
        readOnly: false,
      },
    },
    {
      name: 'lexicalContent',
      type: 'json',
      admin: {
        description: 'Lexical editor content state.',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
        { label: 'Scheduled', value: 'scheduled' },
      ],
      defaultValue: 'draft',
      index: true,
      admin: { description: 'Content publication status.' },
    },
    {
      name: 'publishDate',
      type: 'date',
      admin: {
        description: 'Date when content should be published (for scheduled status).',
        condition: (data) => data.status === 'scheduled',
      },
    },
    {
      name: 'version',
      type: 'number',
      defaultValue: 1,
      admin: {
        description: 'Content version number.',
        readOnly: true,
      },
    },
    {
      name: 'parentVersion',
      type: 'relationship',
      relationTo: 'content',
      admin: {
        description: 'Parent version of this content.',
        readOnly: true,
      },
    },
    {
      name: 'pageType',
      type: 'select',
      options: [
        { label: 'Landing Page', value: 'landing' },
        { label: 'About Page', value: 'about' },
        { label: 'Services Page', value: 'services' },
        { label: 'Contact Page', value: 'contact' },
        { label: 'Blog Post', value: 'blog' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Custom', value: 'custom' },
      ],
      defaultValue: 'custom',
      admin: { description: 'Type of page content.' },
    },
    {
      name: 'category',
      type: 'text',
      admin: { description: 'Content category for organization.' },
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
      admin: { description: 'Tags for content organization and search.' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Feature this content prominently.' },
    },
    {
      name: 'featuredOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order for featured content.',
        condition: (data) => data.featured,
      },
    },
    {
      name: 'seo',
      type: 'group',
      admin: { description: 'SEO and social media settings.' },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: { description: 'Custom meta title (defaults to page title).' },
          validate: (value) => {
            if (value && value.length > 60) return 'Meta title too long (max 60 characters)';
            return true;
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: { description: 'Meta description for SEO.' },
          validate: (value) => {
            if (value && value.length > 160) return 'Meta description too long (max 160 characters)';
            return true;
          },
        },
        {
          name: 'metaKeywords',
          type: 'text',
          admin: { description: 'Comma-separated keywords for SEO.' },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          admin: { description: 'Canonical URL for this page.' },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Open Graph image for social sharing.' },
        },
        {
          name: 'ogTitle',
          type: 'text',
          admin: { description: 'Custom Open Graph title.' },
        },
        {
          name: 'ogDescription',
          type: 'textarea',
          admin: { description: 'Custom Open Graph description.' },
        },
        {
          name: 'twitterCard',
          type: 'select',
          options: [
            { label: 'Summary', value: 'summary' },
            { label: 'Summary Large Image', value: 'summary_large_image' },
            { label: 'App', value: 'app' },
            { label: 'Player', value: 'player' },
          ],
          defaultValue: 'summary_large_image',
          admin: { description: 'Twitter card type.' },
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      admin: { description: 'Content performance analytics.' },
      fields: [
        {
          name: 'viewCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of page views.',
            readOnly: true,
          },
        },
        {
          name: 'uniqueVisitors',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of unique visitors.',
            readOnly: true,
          },
        },
        {
          name: 'averageTimeOnPage',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Average time spent on page in seconds.',
            readOnly: true,
          },
        },
        {
          name: 'bounceRate',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Bounce rate percentage.',
            readOnly: true,
          },
        },
        {
          name: 'conversionRate',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Conversion rate percentage.',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      admin: { description: 'Content-specific settings.' },
      fields: [
        {
          name: 'showTableOfContents',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Show table of contents for long content.' },
        },
        {
          name: 'enableComments',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Allow comments on this content.' },
        },
        {
          name: 'enableSharing',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Show social sharing buttons.' },
        },
        {
          name: 'passwordProtected',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Require password to view this content.' },
        },
        {
          name: 'password',
          type: 'text',
          admin: {
            description: 'Password for protected content.',
            condition: (data) => data.settings?.passwordProtected,
          },
        },
        {
          name: 'customCss',
          type: 'textarea',
          admin: { description: 'Custom CSS for this content.' },
        },
        {
          name: 'customJs',
          type: 'textarea',
          admin: { description: 'Custom JavaScript for this content.' },
        },
      ],
    },
    {
      name: 'media',
      type: 'array',
      admin: { description: 'Media files associated with this content.' },
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          admin: { description: 'Alt text for the media.' },
        },
        {
          name: 'caption',
          type: 'text',
          admin: { description: 'Caption for the media.' },
        },
        {
          name: 'position',
          type: 'number',
          admin: { description: 'Display position/order.' },
        },
      ],
    },
    {
      name: 'revisions',
      type: 'array',
      admin: {
        description: 'Content revision history.',
        readOnly: true,
      },
      fields: [
        {
          name: 'version',
          type: 'number',
          required: true,
        },
        {
          name: 'content',
          type: 'json',
          required: true,
        },
        {
          name: 'lexicalContent',
          type: 'json',
        },
        {
          name: 'changedBy',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
        {
          name: 'changeDescription',
          type: 'text',
          admin: { description: 'Description of what was changed.' },
        },
        {
          name: 'createdAt',
          type: 'date',
          required: true,
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
    {
      name: 'publishedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { readOnly: true },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data, operation }) => {
        if (req.user) {
          if (!data.createdBy) {
            data.createdBy = req.user.id;
          }
          data.updatedBy = req.user.id;

          // Handle publishing
          if (operation === 'update' && data.status === 'published' && !data.publishedAt) {
            data.publishedAt = new Date();
            data.publishedBy = req.user.id;
          }

          // Auto-generate slug from title if not provided
          if (!data.slug && data.title) {
            data.slug = data.title
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim();
          }
        }
        return data;
      },
    ],
    afterChange: [
      ({ doc, req, operation }) => {
        if (operation === 'create' || operation === 'update') {
          console.log(`Content ${operation}d: ${doc.title} (v${doc.version})`);
        }
      },
    ],
  },
  indexes: [
    { fields: ['tenant', 'slug'] },
    { fields: ['status'] },
    { fields: ['pageType'] },
    { fields: ['featured'] },
    { fields: ['createdBy'] },
    { fields: ['updatedAt'] },
    { fields: ['publishedAt'] },
  ],
  timestamps: true,
};
