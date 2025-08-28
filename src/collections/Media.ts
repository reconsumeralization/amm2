import { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
    group: 'Content',
    description: 'Media files and assets for content and editor use.',
    defaultColumns: ['filename', 'mimeType', 'fileSize', 'createdAt'],
  },
  access: {
    read: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber' || req.user?.role === 'manager',
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber' || req.user?.role === 'manager',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'barber' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
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
    ],
    adminThumbnail: ({ doc }) => {
      if (doc?.mimeType && typeof doc.mimeType === 'string' && doc.mimeType.startsWith('image/')) {
        return `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/media/${doc.filename}`;
      }
      return '/media/default-thumbnail.png';
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        height: 300,
        fit: 'cover',
        formatOptions: {
          format: 'jpeg',
          options: { quality: 90 },
        },
      },
      {
        name: 'card',
        width: 600,
        height: 400,
        fit: 'cover',
        formatOptions: {
          format: 'jpeg',
          options: { quality: 85 },
        },
      },
      {
        name: 'hero',
        width: 1200,
        height: 600,
        fit: 'cover',
        formatOptions: {
          format: 'jpeg',
          options: { quality: 80 },
        },
      },
      {
        name: 'full',
        width: 1920,
        height: 1080,
        fit: 'inside',
        formatOptions: {
          format: 'jpeg',
          options: { quality: 85 },
        },
      },
    ],
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
      validate: (value: string) => {
        if (value && value.length > 500) return 'Alt text too long (max 500 characters)';
        return true;
      },
    },
    {
      name: 'caption',
      type: 'text',
      admin: { description: 'Caption or description for the media.' },
      validate: (value: string) => {
        if (value && value.length > 1000) return 'Caption too long (max 1000 characters)';
        return true;
      },
    },
    {
      name: 'title',
      type: 'text',
      admin: { description: 'Title or display name for the media.' },
      validate: (value: string) => {
        if (value && value.length > 200) return 'Title too long (max 200 characters)';
        return true;
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Detailed description of the media.' },
      validate: (value) => {
        if (value && value.length > 2000) return 'Description too long (max 2000 characters)';
        return true;
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: { description: 'Tenant this media belongs to.' },
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
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'image',
      index: true,
      admin: { description: 'Media category for organization.' },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
          admin: { description: 'Tag for organization and search.' },
        },
      ],
      admin: { description: 'Tags for media organization and search.' },
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
    },
    {
      name: 'metadata',
      type: 'group',
      admin: { description: 'Additional metadata for the media file.' },
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
      ],
    },
    {
      name: 'usage',
      type: 'group',
      admin: { description: 'Usage tracking for this media file.' },
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
      ],
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      defaultValue: false,
      admin: { description: 'Whether this media is publicly accessible.' },
    },
    {
      name: 'permissions',
      type: 'group',
      admin: { description: 'Advanced access permissions for this media.' },
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
      ],
    },
    {
      name: 'optimization',
      type: 'group',
      admin: { description: 'Image optimization settings and results.' },
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
        if (operation === 'create') {
          console.log(`Media file uploaded: ${doc.filename} (${doc.mimeType})`);
        } else if (operation === 'update') {
          console.log(`Media file updated: ${doc.filename}`);
        }
      },
    ],
  },
  indexes: [
    { fields: ['tenant', 'filename'] },
    { fields: ['mimeType'] },
    { fields: ['category'] },
    { fields: ['createdAt'] },
    { fields: ['updatedAt'] },
  ],
  timestamps: true,
};