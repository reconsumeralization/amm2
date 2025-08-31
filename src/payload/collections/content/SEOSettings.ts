// src/payload/collections/SEOSettings.ts
import type { CollectionConfig } from 'payload';

export const SEOSettings: CollectionConfig = {
  slug: 'seo-settings',
  labels: {
    singular: 'SEO Settings',
    plural: 'SEO Settings',
  },
  access: {
    read: () => true,
    update: ({ req }: any) => req.user?.role === 'admin' || req.user?.roles?.includes('admin'),
    create: () => false,
    delete: () => false,
  },
  admin: {
    useAsTitle: 'siteName',
    description: 'Global SEO settings and defaults for the entire site',
    group: 'Admin',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      label: 'Site Name',
      required: true,
      admin: {
        description: 'Your business/website name',
      },
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      label: 'Site Description',
      admin: {
        description: 'Brief description of your business/website',
      },
    },
    {
      name: 'defaultTitle',
      type: 'text',
      label: 'Default Meta Title',
      admin: {
        description: 'Default title for pages without custom meta title',
      },
    },
    {
      name: 'defaultDescription',
      type: 'textarea',
      label: 'Default Meta Description',
      admin: {
        description: 'Default description for pages without custom meta description',
      },
    },
    {
      name: 'defaultOGImage',
      type: 'upload',
      relationTo: 'media' as any as any,
      label: 'Default OG Image',
      admin: {
        description: 'Default social sharing image',
      },
    },
    {
      name: 'favicon',
      type: 'upload',
      relationTo: 'media' as any as any,
      label: 'Favicon',
      admin: {
        description: 'Site favicon (32x32px recommended)',
      },
    },
    {
      name: 'socialLinks',
      type: 'group',
      label: 'Social Media Links',
      fields: [
        {
          name: 'facebook',
          type: 'text',
          label: 'Facebook URL',
        },
        {
          name: 'twitter',
          type: 'text',
          label: 'Twitter/X URL',
        },
        {
          name: 'instagram',
          type: 'text',
          label: 'Instagram URL',
        },
        {
          name: 'linkedin',
          type: 'text',
          label: 'LinkedIn URL',
        },
        {
          name: 'youtube',
          type: 'text',
          label: 'YouTube URL',
        },
      ],
    },
    {
      name: 'businessInfo',
      type: 'group',
      label: 'Business Information',
      fields: [
        {
          name: 'businessType',
          type: 'text',
          label: 'Business Type',
          admin: {
            description: 'e.g., Beauty BarberShop, Barbershop, Spa',
          },
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Business Phone',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Business Email',
        },
        {
          name: 'address',
          type: 'group',
          label: 'Business Address',
          fields: [
            {
              name: 'street',
              type: 'text',
              label: 'Street Address',
            },
            {
              name: 'city',
              type: 'text',
              label: 'City',
            },
            {
              name: 'state',
              type: 'text',
              label: 'State/Province',
            },
            {
              name: 'zipCode',
              type: 'text',
              label: 'ZIP/Postal Code',
            },
            {
              name: 'country',
              type: 'text',
              label: 'Country',
              defaultValue: 'United States',
            },
          ],
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      label: 'Analytics & Tracking',
      fields: [
        {
          name: 'googleAnalyticsId',
          type: 'text',
          label: 'Google Analytics ID',
          admin: {
            description: 'GA4 Measurement ID (G-XXXXXXXXXX)',
          },
        },
        {
          name: 'facebookPixelId',
          type: 'text',
          label: 'Facebook Pixel ID',
        },
        {
          name: 'googleSiteVerification',
          type: 'text',
          label: 'Google Site Verification',
          admin: {
            description: 'Google Search Console verification code',
          },
        },
      ],
    },
    {
      name: 'robotsTxt',
      type: 'textarea',
      label: 'Robots.txt Content',
      admin: {
        description: 'Custom robots.txt content (leave empty for default)',
        rows: 10,
      },
    },
    {
      name: 'sitemapSettings',
      type: 'group',
      label: 'Sitemap Settings',
      fields: [
        {
          name: 'includeInSitemap',
          type: 'checkbox',
          label: 'Include in XML Sitemap',
          defaultValue: true,
        },
        {
          name: 'sitemapPriority',
          type: 'select',
          label: 'Sitemap Priority',
          defaultValue: '0.5',
          options: [
            { label: '0.1 (Lowest)', value: '0.1' },
            { label: '0.2', value: '0.2' },
            { label: '0.3', value: '0.3' },
            { label: '0.4', value: '0.4' },
            { label: '0.5 (Default)', value: '0.5' },
            { label: '0.6', value: '0.6' },
            { label: '0.7', value: '0.7' },
            { label: '0.8', value: '0.8' },
            { label: '0.9', value: '0.9' },
            { label: '1.0 (Highest)', value: '1.0' },
          ],
        },
        {
          name: 'sitemapChangeFreq',
          type: 'select',
          label: 'Change Frequency',
          defaultValue: 'monthly',
          options: [
            { label: 'Always', value: 'always' },
            { label: 'Hourly', value: 'hourly' },
            { label: 'Daily', value: 'daily' },
            { label: 'Weekly', value: 'weekly' },
            { label: 'Monthly', value: 'monthly' },
            { label: 'Yearly', value: 'yearly' },
            { label: 'Never', value: 'never' },
          ],
        },
      ],
    },
  ],
};
