import type { CollectionConfig, AccessResult, Where } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    group: 'Content',
    description: 'Media files and assets for content and editor use.',
    defaultColumns: ['filename', 'mimeType', 'fileSize', 'createdAt'],
    listSearchableFields: ['filename', 'alt', 'title', 'caption', 'description'],
  },
  access: {
    read: ({ req }): AccessResult => {
      if (!req.user) {
        return {
          isPublic: { equals: true }
        } as Where
      }
      return {
        or: [
          { 
            tenant: { equals: req.user.tenant?.id || null }
          },
          { 
            isPublic: { equals: true }
          }
        ]
      } as Where
    },
    create: ({ req }): AccessResult => {
      if (!req.user) return false
      return ['admin', 'manager', 'barber'].includes(req.user.role)
    },
    update: ({ req }): AccessResult => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      // Users can update media from their tenant
      return { 
        or: [
          { 
            tenant: { equals: req.user.tenant?.id || null }
          },
          { 
            isPublic: { equals: true }
          }
        ]
      } as Where
    },
    delete: ({ req }): AccessResult => {
      if (!req.user) return false
      if (req.user.role === 'admin') return true
      // Only managers can delete media from their tenant
      if (req.user.role === 'manager') {
        return { 
          or: [
            { 
              tenant: { equals: req.user.tenant?.id || null }
            },
            { 
              isPublic: { equals: true }
            }
          ]
        } as Where
      }
      return false
    },
  },

  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        // Auto-assign tenant for non-admin users
        if (data && !data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id
        }
        return data
      },
    ],
    beforeChange: [
      ({ data, operation, req }) => {
        // Set tenant for non-admin users
        if (!data.tenant && req.user && req.user.role !== 'admin') {
          data.tenant = req.user.tenant?.id
        }

        // Set createdBy and updatedBy
        if (req.user) {
          if (operation === 'create') {
            data.createdBy = req.user.id
          }
          data.updatedBy = req.user.id
        }

        // Auto-generate alt text from filename if not provided
        if (!data.alt && data.filename) {
          const filename = data.filename.replace(/\.[^/.]+$/, '') // Remove extension
          data.alt = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        }

        // Auto-generate title from filename if not provided
        if (!data.title && data.filename) {
          const filename = data.filename.replace(/\.[^/.]+$/, '') // Remove extension
          data.title = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
        }

        // Auto-detect orientation for images
        if (data.width && data.height && data.mimeType?.startsWith('image/')) {
          const aspectRatio = data.width / data.height
          if (aspectRatio > 1.2) {
            data.metadata = { ...data.metadata, orientation: 'landscape' }
          } else if (aspectRatio < 0.8) {
            data.metadata = { ...data.metadata, orientation: 'portrait' }
          } else {
            data.metadata = { ...data.metadata, orientation: 'square' }
          }
        }

        // Validate file size limits based on user role
        if (data.fileSize) {
          const maxSize = req.user?.role === 'admin' ? 50 * 1024 * 1024 : 10 * 1024 * 1024 // 50MB for admin, 10MB for others
          if (data.fileSize > maxSize) {
            throw new Error(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`)
          }
        }

        return data
      },
    ],
    afterChange: [
      ({ doc, operation, req }) => {
        if (operation === 'create') {
          console.log(`Media file uploaded: ${doc.filename} (${doc.mimeType}) by ${req.user?.email}`)

          // Update user's media count
          if (req.user && req.payload) {
            // This would typically update a user stats field
            console.log(`Media uploaded by user: ${req.user.email}`)
          }
        } else if (operation === 'update') {
          console.log(`Media file updated: ${doc.filename} by ${req.user?.email}`)
        }
      },
    ],

    beforeDelete: [
      async ({ req, id }) => {
        // Log deletion attempts
        console.log(`Media deletion requested: ${id} by ${req.user?.email}`)

        if (req.payload) {
          // Check if media is being used in other collections before deletion
          const mediaUsage = await Promise.all([
            req.payload.find({
              collection: 'blog-posts',
              where: { hero: { equals: id } }
            }),
            req.payload.find({
              collection: 'products',
              where: { images: { in: [id] } }
            }),
            req.payload.find({
              collection: 'editor-templates',
              where: { thumbnail: { equals: id } }
            })
          ])

          const totalUsage = mediaUsage.reduce((sum, result) => sum + result.totalDocs, 0)

          if (totalUsage > 0) {
            throw new Error(`Cannot delete media file - it is currently being used in ${totalUsage} content item(s)`)
          }
        }
      },
    ],
    afterDelete: [
      ({ req, id, doc }) => {
        console.log(`Media file deleted: ${doc?.filename} (ID: ${id}) by ${req.user?.email}`)
      },
    ],
  },

  upload: {
    staticDir: 'media',
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/zip',
      'application/x-rar-compressed',
    ],
    adminThumbnail: ({ doc }) => {
      if (doc?.mimeType && typeof doc.mimeType === 'string' && doc.mimeType.startsWith('image/')) {
        return `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/media/${doc.filename}`
      }
      return '/media/default-thumbnail.png'
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        fit: 'cover',
        formatOptions: {
          format: 'webp',
          options: { quality: 90 },
        },
      },
      {
        name: 'card',
        width: 600,
        height: 400,
        fit: 'cover',
        formatOptions: {
          format: 'webp',
          options: { quality: 85 },
        },
      },
      {
        name: 'hero',
        width: 1200,
        height: 600,
        fit: 'cover',
        formatOptions: {
          format: 'webp',
          options: { quality: 80 },
        },
      },
      {
        name: 'full',
        width: 1920,
        height: 1080,
        fit: 'inside',
        formatOptions: {
          format: 'webp',
          options: { quality: 85 },
        },
      },
      {
        name: 'mobile',
        width: 768,
        height: 512,
        fit: 'cover',
        formatOptions: {
          format: 'webp',
          options: { quality: 80 },
        },
      },
    ],
    crop: true,
    focalPoint: true,
    resizeOptions: {
      width: 2048,
      height: 2048,
      fit: 'inside',
      withoutEnlargement: true,
    },
  },
  fields: [
    {
      name: 'filename',
      type: 'text',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'mimeType',
      type: 'text',
      required: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'fileSize',
      type: 'number',
      required: true,
      admin: {
        description: 'File size in bytes.',
        readOnly: true,
      },
    },
    {
      name: 'width',
      type: 'number',
      admin: {
        description: 'Image width in pixels.',
        readOnly: true,
        condition: (data) => data?.mimeType?.startsWith('image/'),
      },
    },
    {
      name: 'height',
      type: 'number',
      admin: {
        description: 'Image height in pixels.',
        readOnly: true,
        condition: (data) => data?.mimeType?.startsWith('image/'),
      },
    },
    {
      name: 'alt',
      type: 'text',
      admin: { description: 'Alt text for accessibility.' },
      validate: (value: any) => {
        if (value && typeof value === 'string' && value.length > 500) {
          return 'Alt text too long (max 500 characters)'
        }
        return true
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Caption or description for the media.' },
      validate: (value: any) => {
        if (value && typeof value === 'string' && value.length > 1000) {
          return 'Caption too long (max 1000 characters)'
        }
        return true
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: { description: 'Title or display name for the media.' },
      validate: (value: any) => {
        if (value && typeof value === 'string' && value.length > 200) {
          return 'Title too long (max 200 characters)'
        }
        return true
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Detailed description of the media.' },
      validate: (value: any) => {
        if (value && typeof value === 'string' && value.length > 2000) {
          return 'Description too long (max 2000 characters)'
        }
        return true
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: { 
        description: 'Tenant this media belongs to.',
        condition: (data, siblingData, { user }) => user?.role === 'admin',
      },
      hooks: {
        beforeChange: [
          ({ req, value }) => {
            // Auto-assign tenant for non-admin users
            if (!value && req.user && req.user.role !== 'admin') {
              return req.user.tenant?.id
            }
            return value
          },
        ],
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
        { label: 'Audio', value: 'audio' },
        { label: 'Document', value: 'document' },
        { label: 'Archive', value: 'archive' },
        { label: 'Logo', value: 'logo' },
        { label: 'Icon', value: 'icon' },
        { label: 'Background', value: 'background' },
        { label: 'Profile', value: 'profile' },
        { label: 'Gallery', value: 'gallery' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'image',
      index: true,
      admin: { description: 'Media category for organization.' },
      hooks: {
        beforeChange: [
          ({ data, value }) => {
            // Auto-detect category based on mime type if not set
            if (!value && data?.mimeType) {
              if (data.mimeType.startsWith('image/')) return 'image'
              if (data.mimeType.startsWith('video/')) return 'video'
              if (data.mimeType.startsWith('audio/')) return 'audio'
              if (data.mimeType === 'application/pdf') return 'document'
              if (data.mimeType.includes('zip') || data.mimeType.includes('rar')) return 'archive'
            }
            return value
          },
        ],
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
          maxLength: 50,
          admin: { description: 'Tag for organization and search.' },
          validate: (value: any) => {
            if (value && typeof value === 'string' && value.length < 2) {
              return 'Tag must be at least 2 characters long'
            }
            return true
          },
        },
      ],
      admin: { description: 'Tags for media organization and search.' },
      maxRows: 20,
    },
    {
      name: 'folders',
      type: 'array',
      fields: [
        {
          name: 'folder',
          type: 'relationship',
          relationTo: 'mediaFolders',
          admin: { description: 'Folder this media belongs to.' },
        },
      ],
      admin: { description: 'Folders for organizing media.' },
      maxRows: 5,
    },
    {
      name: 'metadata',
      type: 'group',
      admin: { 
        description: 'Additional metadata for the media file.',
      },
      fields: [
        {
          name: 'duration',
          type: 'number',
          admin: {
            description: 'Duration in seconds (for video/audio).',
            condition: (data) => data?.mimeType?.startsWith('video/') || data?.mimeType?.startsWith('audio/'),
          },
        },
        {
          name: 'bitrate',
          type: 'number',
          admin: {
            description: 'Bitrate in kbps.',
            condition: (data) => data?.mimeType?.startsWith('video/') || data?.mimeType?.startsWith('audio/'),
          },
        },
        {
          name: 'codec',
          type: 'text',
          admin: {
            description: 'Video/audio codec information.',
            condition: (data) => data?.mimeType?.startsWith('video/') || data?.mimeType?.startsWith('audio/'),
          },
        },
        {
          name: 'orientation',
          type: 'select',
          options: [
            { label: 'Landscape', value: 'landscape' },
            { label: 'Portrait', value: 'portrait' },
            { label: 'Square', value: 'square' },
          ],
          admin: {
            description: 'Image orientation.',
            condition: (data) => data?.mimeType?.startsWith('image/'),
          },
        },
        {
          name: 'colorSpace',
          type: 'text',
          admin: {
            description: 'Color space information.',
            condition: (data) => data?.mimeType?.startsWith('image/'),
          },
        },
        {
          name: 'compression',
          type: 'text',
          admin: {
            description: 'Compression format/details.',
          },
        },
        {
          name: 'quality',
          type: 'number',
          min: 1,
          max: 100,
          admin: { description: 'Quality score (1-100).' },
        },
        {
          name: 'processingStatus',
          type: 'select',
          options: [
            { label: 'Pending', value: 'pending' },
            { label: 'Processing', value: 'processing' },
            { label: 'Completed', value: 'completed' },
            { label: 'Failed', value: 'failed' },
          ],
          defaultValue: 'pending',
          admin: { description: 'Processing status for image optimization.' },
        },
        {
          name: 'exifData',
          type: 'json',
          admin: {
            description: 'EXIF data from the original image.',
            condition: (data) => data?.mimeType?.startsWith('image/'),
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'usage',
      type: 'group',
      admin: { 
        description: 'Usage tracking for this media file.',
      },
      fields: [
        {
          name: 'usageCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of times this media has been used.',
            readOnly: true,
          },
        },
        {
          name: 'lastUsed',
          type: 'date',
          admin: {
            description: 'Date when this media was last used.',
            readOnly: true,
          },
        },
        {
          name: 'usedIn',
          type: 'array',
          admin: {
            description: 'Where this media is currently being used.',
            readOnly: true,
          },
          fields: [
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Content', value: 'content' },
                { label: 'Template', value: 'template' },
                { label: 'Theme', value: 'theme' },
                { label: 'User Profile', value: 'profile' },
                { label: 'Product', value: 'product' },
                { label: 'Service', value: 'service' },
                { label: 'Gallery', value: 'gallery' },
                { label: 'Blog Post', value: 'blog' },
                { label: 'Other', value: 'other' },
              ],
              required: true,
            },
            {
              name: 'reference',
              type: 'text',
              required: true,
              admin: { description: 'Reference ID or path where used.' },
            },
            {
              name: 'context',
              type: 'text',
              admin: { description: 'Additional context about usage.' },
            },
          ],
        },
        {
          name: 'downloadCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of times this media has been downloaded.',
            readOnly: true,
          },
        },
        {
          name: 'viewCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            description: 'Number of times this media has been viewed.',
            readOnly: true,
          },
        },
      ],
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Whether this media is publicly accessible.' },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Mark as featured media for galleries or showcases.' },
    },
    {
      name: 'permissions',
      type: 'group',
      admin: { 
        description: 'Advanced access permissions for this media.',
      },
      fields: [
        {
          name: 'allowedUsers',
          type: 'relationship',
          relationTo: 'users',
          hasMany: true,
          admin: {
            description: 'Specific users allowed to access this media.',
            condition: (data) => !data?.isPublic,
          },
        },
        {
          name: 'allowedRoles',
          type: 'select',
          hasMany: true,
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Manager', value: 'manager' },
            { label: 'Barber', value: 'barber' },
            { label: 'Customer', value: 'customer' },
          ],
          admin: {
            description: 'User roles allowed to access this media.',
            condition: (data) => !data?.isPublic,
          },
        },
        {
          name: 'expiresAt',
          type: 'date',
          admin: {
            description: 'Date when access to this media expires.',
            condition: (data) => !data?.isPublic,
          },
        },
      ],
    },
    {
      name: 'optimization',
      type: 'group',
      admin: { 
        description: 'Image optimization settings and results.',
      },
      fields: [
        {
          name: 'originalSize',
          type: 'number',
          admin: {
            description: 'Original file size in bytes.',
            readOnly: true,
          },
        },
        {
          name: 'optimizedSizes',
          type: 'array',
          admin: {
            description: 'Generated optimized image sizes.',
            readOnly: true,
          },
          fields: [
            {
              name: 'size',
              type: 'text',
              required: true,
              admin: { description: 'Size name (e.g., thumbnail, card).' },
            },
            {
              name: 'width',
              type: 'number',
              required: true,
              admin: { description: 'Width in pixels.' },
            },
            {
              name: 'height',
              type: 'number',
              required: true,
              admin: { description: 'Height in pixels.' },
            },
            {
              name: 'fileSize',
              type: 'number',
              required: true,
              admin: { description: 'File size in bytes.' },
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              admin: { description: 'URL to the optimized image.' },
            },
            {
              name: 'format',
              type: 'text',
              admin: { description: 'Output format (webp, jpeg, etc.).' },
            },
          ],
        },
        {
          name: 'compressionRatio',
          type: 'number',
          admin: {
            description: 'Compression ratio achieved.',
            readOnly: true,
          },
        },
        {
          name: 'autoOptimize',
          type: 'checkbox',
          defaultValue: true,
          admin: { description: 'Automatically optimize this media file.' },
        },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      admin: { 
        description: 'SEO-related fields for this media.',
      },
      fields: [
        {
          name: 'focusKeyword',
          type: 'text',
          maxLength: 100,
          admin: { description: 'Primary keyword for SEO optimization.' },
        },
        {
          name: 'altKeywords',
          type: 'array',
          fields: [
            {
              name: 'keyword',
              type: 'text',
              required: true,
              maxLength: 50,
            },
          ],
          admin: { description: 'Alternative keywords for SEO.' },
          maxRows: 10,
        },
        {
          name: 'copyright',
          type: 'text',
          admin: { description: 'Copyright information for this media.' },
        },
        {
          name: 'license',
          type: 'select',
          options: [
            { label: 'All Rights Reserved', value: 'all-rights-reserved' },
            { label: 'Creative Commons', value: 'creative-commons' },
            { label: 'Public Domain', value: 'public-domain' },
            { label: 'Royalty Free', value: 'royalty-free' },
            { label: 'Custom License', value: 'custom' },
          ],
          admin: { description: 'License type for this media.' },
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
  indexes: [
    { fields: ['tenant', 'filename'] },
    { fields: ['tenant', 'category'] },
    { fields: ['mimeType'] },
    { fields: ['category'] },
    { fields: ['isPublic'] },
    { fields: ['isFeatured'] },
    { fields: ['createdAt'] },
    { fields: ['updatedAt'] },
    { fields: ['usage.usageCount'] },
    { fields: ['metadata.processingStatus'] },
  ],
  timestamps: true,
}
