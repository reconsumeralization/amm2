import type { CollectionConfig } from 'payload';

export const Content: CollectionConfig = {
  slug: 'content',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    description: 'Page content and layouts created with the visual page builder.',
    defaultColumns: ['title', 'slug', 'status', 'template', 'updatedAt'],
    listSearchableFields: ['title', 'slug', 'description'],
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
      return userRole === 'admin' || userRole === 'barber' || userRole === 'manager';
    },
    update: ({ req }) => {
      if (!req.user) return false;
      const userRole = req.user?.role;
      return userRole === 'admin' || userRole === 'barber' || userRole === 'manager';
    },
    delete: ({ req }) => {
      if (!req.user) return false;
      const userRole = req.user?.role;
      return userRole === 'admin' || userRole === 'manager';
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
      admin: { 
        description: 'Page title for display purposes.',
        placeholder: 'Enter page title...',
      },
      validate: (value: string | null | undefined) => {
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
      admin: { 
        description: 'Unique identifier for the page (e.g., "home", "services").',
        placeholder: 'page-url-slug',
      },
      validate: (value: string | null | undefined) => {
        if (!value || value.length < 1) return 'Slug is required';
        if (!/^[a-z0-9-]+$/.test(value)) return 'Slug can only contain lowercase letters, numbers, and hyphens';
        if (value.length > 100) return 'Slug too long (max 100 characters)';
        return true;
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { 
        description: 'Brief description of the page content.',
        placeholder: 'Describe what this page is about...',
      },
      validate: (value: string | null | undefined) => {
        if (value && value.length > 500) return 'Description too long (max 500 characters)';
        return true;
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      index: true,
      admin: { 
        description: 'Tenant this content belongs to.',
        position: 'sidebar',
      },
    },
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'editorTemplates' as any as any,
      admin: { 
        description: 'Template used to create this content.',
        position: 'sidebar',
      },
    },
    {
      name: 'theme',
      type: 'relationship',
      relationTo: 'editorThemes' as any as any,
      admin: { 
        description: 'Theme applied to this content.',
        position: 'sidebar',
      },
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
      admin: { 
        description: 'Content publication status.',
        position: 'sidebar',
      },
    },
    {
      name: 'publishDate',
      type: 'date',
      admin: {
        description: 'Date when content should be published (for scheduled status).',
        condition: (data) => data.status === 'scheduled',
        position: 'sidebar',
      },
    },
    {
      name: 'version',
      type: 'number',
      defaultValue: 1,
      admin: {
        description: 'Content version number.',
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'parentVersion',
      type: 'relationship',
      relationTo: 'content' as any as any,
      admin: {
        description: 'Parent version of this content.',
        readOnly: true,
        position: 'sidebar',
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
      index: true,
      admin: { 
        description: 'Type of page content.',
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'text',
      index: true,
      admin: { 
        description: 'Content category for organization.',
        placeholder: 'e.g., Marketing, Services, About',
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
          admin: {
            placeholder: 'Enter tag...',
          },
        },
      ],
      admin: { 
        description: 'Tags for content organization and search.',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { 
        description: 'Feature this content prominently.',
        position: 'sidebar',
      },
    },
    {
      name: 'featuredOrder',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Display order for featured content (lower numbers appear first).',
        condition: (data) => data.featured,
        position: 'sidebar',
      },
    },
    {
      name: 'seo',
      type: 'group',
      admin: { 
        description: 'SEO and social media settings.',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: { 
            description: 'Custom meta title (defaults to page title).',
            placeholder: 'Custom SEO title...',
          },
          validate: (value: string | null | undefined) => {
            if (value && value.length > 60) return 'Meta title too long (max 60 characters)';
            return true;
          },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          admin: { 
            description: 'Meta description for SEO.',
            placeholder: 'Describe this page for search engines...',
          },
          validate: (value: string | null | undefined) => {
            if (value && value.length > 160) return 'Meta description too long (max 160 characters)';
            return true;
          },
        },
        {
          name: 'metaKeywords',
          type: 'text',
          admin: { 
            description: 'Comma-separated keywords for SEO.',
            placeholder: 'keyword1, keyword2, keyword3',
          },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          admin: { 
            description: 'Canonical URL for this page.',
            placeholder: 'https://example.com/canonical-url',
          },
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media' as any as any,
          admin: { description: 'Open Graph image for social sharing.' },
        },
        {
          name: 'ogTitle',
          type: 'text',
          admin: { 
            description: 'Custom Open Graph title.',
            placeholder: 'Social media title...',
          },
        },
        {
          name: 'ogDescription',
          type: 'textarea',
          admin: { 
            description: 'Custom Open Graph description.',
            placeholder: 'Social media description...',
          },
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
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Prevent search engines from indexing this page.' },
        },
        {
          name: 'noFollow',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Prevent search engines from following links on this page.' },
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      admin: { 
        description: 'Content performance analytics.',
      },
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
        {
          name: 'lastAnalyticsUpdate',
          type: 'date',
          admin: {
            description: 'Last time analytics were updated.',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'settings',
      type: 'group',
      admin: { 
        description: 'Content-specific settings.',
      },
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
            placeholder: 'Enter password...',
          },
        },
        {
          name: 'customCss',
          type: 'textarea',
          admin: { 
            description: 'Custom CSS for this content.',
            placeholder: '/* Custom CSS styles */',
          },
        },
        {
          name: 'customJs',
          type: 'textarea',
          admin: { 
            description: 'Custom JavaScript for this content.',
            placeholder: '// Custom JavaScript code',
          },
        },
        {
          name: 'enableLazyLoading',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Enable lazy loading for images and media.' },
        },
        {
          name: 'cacheTimeout',
          type: 'number',
          defaultValue: 3600,
          admin: { 
            description: 'Cache timeout in seconds (0 = no cache).',
            placeholder: '3600',
          },
        },
      ],
    },
    {
      name: 'media',
      type: 'array',
      admin: { 
        description: 'Media files associated with this content.',
      },
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media' as any as any,
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          admin: { 
            description: 'Alt text for the media.',
            placeholder: 'Describe the image...',
          },
        },
        {
          name: 'caption',
          type: 'text',
          admin: { 
            description: 'Caption for the media.',
            placeholder: 'Image caption...',
          },
        },
        {
          name: 'position',
          type: 'number',
          admin: { 
            description: 'Display position/order.',
            placeholder: '1',
          },
        },
        {
          name: 'featured',
          type: 'checkbox',
          defaultValue: false,
          admin: { description: 'Use as featured image.' },
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
          relationTo: 'users' as any as any,
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
      relationTo: 'users' as any as any,
      admin: { 
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: { 
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'publishedBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: { 
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { 
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Auto-generate slug from title if not provided
        if (data && !data.slug && data.title) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
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
          // Set user relationships
          if (operation === 'create') {
            data.createdBy = req.user.id;
          }
          data.updatedBy = req.user.id;

          // Handle publishing
          if (data.status === 'published' && !data.publishedAt) {
            data.publishedAt = new Date();
            data.publishedBy = req.user.id;
          }

          // Increment version on content changes
          if (operation === 'update' && (data.content || data.lexicalContent)) {
            data.version = (data.version || 1) + 1;
          }

          // Validate scheduled publish date
          if (data.status === 'scheduled' && data.publishDate) {
            const publishDate = new Date(data.publishDate);
            if (publishDate <= new Date()) {
              throw new Error('Scheduled publish date must be in the future');
            }
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, req, operation, previousDoc }) => {
        if (operation === 'create' || operation === 'update') {
          console.log(`Content ${operation}d: ${doc.title} (v${doc.version})`);
          
          // Create revision entry for significant changes
          if (operation === 'update' && previousDoc && 
              (JSON.stringify(doc.content) !== JSON.stringify(previousDoc.content) ||
               JSON.stringify(doc.lexicalContent) !== JSON.stringify(previousDoc.lexicalContent))) {
            
            try {
              // Create a new revision record
              const revisionData = {
                version: previousDoc.version || 1,
                content: previousDoc.content,
                lexicalContent: previousDoc.lexicalContent,
                changedBy: req.user?.id,
                changeDescription: `Updated content from version ${previousDoc.version || 1} to ${doc.version}`,
                createdAt: new Date(),
              };

              // Add revision to the revisions array
              const currentRevisions = doc.revisions || [];
              currentRevisions.push(revisionData);

              // Update the document with the new revision
              await req.payload.update({
                collection: 'content' as any as any,
                id: doc.id,
                data: {
                  revisions: currentRevisions,
                },
                req,
              });

              console.log(`Created revision for content: ${doc.title} (v${previousDoc.version || 1})`);
            } catch (error) {
              console.error('Failed to create content revision:', error);
            }
          }
        }
      },
    ],
  },
  indexes: [
    { fields: ['tenant', 'slug'], unique: true },
    { fields: ['status'] },
    { fields: ['pageType'] },
    { fields: ['featured', 'featuredOrder'] },
    { fields: ['category'] },
    { fields: ['createdBy'] },
    { fields: ['updatedAt'] },
    { fields: ['publishedAt'] },
    { fields: ['publishDate'] },
  ],
  timestamps: true,
  versions: {
    drafts: true,
    maxPerDoc: 50,
  },
};
