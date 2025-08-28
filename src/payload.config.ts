import { buildConfig } from 'payload'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import lexicalEditor from '@payloadcms/richtext-lexical'
import sharp from 'sharp'
import path from 'path'
import type { PayloadHandler } from 'payload'

// Import collections
import { Users } from './collections/Users'
import { Appointments } from './collections/Appointments'
import { Services } from './collections/Services'
import { Stylists } from './collections/Stylists'
import { Customers } from './collections/Customers'
import { Products } from './collections/Products'
import { Orders } from './collections/Orders'
import { Testimonials } from './collections/Testimonials'
import { Media } from './collections/Media'
import { Content } from './collections/Content'
import { Events } from './collections/Events'
import { BusinessDocumentation } from './collections/BusinessDocumentation'
import { StaffSchedules } from './collections/StaffSchedules'
import { ClockRecords } from './collections/ClockRecords'

// Import globals
import { Settings } from './globals/Settings'

// Import plugins
import { seoPlugin } from '@payloadcms/plugin-seo'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { s3Adapter } from '@payloadcms/plugin-cloud-storage/s3'

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- Modern Men Admin',
      openGraph: {
        title: 'Modern Men Admin Dashboard',
        description: 'Professional salon management system',
        images: [
          {
            url: '/og-image.jpg',
            width: 1200,
            height: 630,
            alt: 'Modern Men Admin Dashboard',
          },
        ],
      },
    },
    components: {
      graphics: {
        Logo: path.resolve(__dirname, 'components/admin/Logo'),
        Icon: path.resolve(__dirname, 'components/admin/Icon'),
      },
      beforeDashboard: [
        path.resolve(__dirname, 'components/admin/DashboardStats'),
      ],
      beforeNavLinks: [
        path.resolve(__dirname, 'components/admin/QuickActions'),
      ],
    },
    dateFormat: 'MM/dd/yyyy',
    disable: false,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  editor: lexicalEditor({
    features: ({ defaultFeatures }: { defaultFeatures: any }) => [
      ...defaultFeatures,
      // Add custom lexical features here
    ],
  }),
  collections: [
    Users,
    Appointments,
    Services,
    Stylists,
    Customers,
    Products,
    Orders,
    Testimonials,
    Media,
    Content,
    Events,
    BusinessDocumentation,
    StaffSchedules,
    ClockRecords,
  ],
  globals: [
    Settings,
  ],
  endpoints: [
    // Custom API endpoints
    {
      path: '/api/appointments/availability',
      method: 'get',
      handler: require(path.resolve(__dirname, 'endpoints/availability')) as PayloadHandler,
    },
    {
      path: '/api/reports/dashboard',
      method: 'get',
      handler: require(path.resolve(__dirname, 'endpoints/dashboard-stats')) as PayloadHandler,
    },
    {
      path: '/api/notifications/send',
      method: 'post',
      handler: require(path.resolve(__dirname, 'endpoints/send-notification')) as PayloadHandler,
    },
  ],
  plugins: [
    seoPlugin({
      collections: ['content', 'services', 'events'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${doc.title} | Modern Men`,
      generateDescription: ({ doc }) => doc.excerpt || doc.description,
    }),
    ...(process.env.S3_BUCKET ? [
      cloudStoragePlugin({
        collections: {
          media: {
            adapter: s3Adapter({
              config: {
                endpoint: process.env.S3_ENDPOINT,
                region: process.env.S3_REGION || 'us-east-1',
                credentials: {
                  accessKeyId: process.env.S3_ACCESS_KEY_ID!,
                  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
                },
              },
              bucket: process.env.S3_BUCKET!,
            }),
          },
        },
      }),
    ] : []),
  ],
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  serverURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  db: mongooseAdapter({
    url: process.env.DATABASE_URI || 'mongodb://localhost:27017/modernmen',
    connectOptions: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    },
  }),
  upload: {
    limits: {
      fileSize: 10000000, // 10MB
    },
    mimeTypes: ['image/*', 'application/pdf'],
  },
  email: nodemailerAdapter({
    defaultFromAddress: process.env.FROM_EMAIL || 'noreply@modernmen.com',
    defaultFromName: 'Modern Men',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    },
  }),
  cors: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'https://modernmen.vercel.app',
    ...(process.env.ADDITIONAL_CORS_ORIGINS?.split(',') || []),
  ],
  csrf: [
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'https://modernmen.vercel.app',
    ...(process.env.ADDITIONAL_CSRF_ORIGINS?.split(',') || []),
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
    maxComplexity: 1000,
    disablePlaygroundInProduction: true,
  },
  localization: {
    locales: [
      {
        label: 'English',
        code: 'en',
      },
      {
        label: 'Español',
        code: 'es',
      },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  onInit: async (payload) => {
    // Initialize default data if needed
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.totalDocs === 0) {
      await payload.create({
        collection: 'users',
        data: {
          name: 'Admin User',
          email: process.env.ADMIN_EMAIL || 'admin@modernmen.com',
          password: process.env.ADMIN_PASSWORD || 'admin123',
          role: 'admin',
        },
      })
      console.log('Default admin user created')
    }
  },
})