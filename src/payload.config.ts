import { buildConfig } from 'payload'
import postgresAdapter from '@payloadcms/db-postgres'
import lexicalEditor from '@payloadcms/richtext-lexical'
import path from 'path'

import collections from '@/payload/collections'

export default buildConfig({
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- ModernMen Admin',
    },
    components: {
      graphics: {
        Logo: { path: '@/payload/components/Logo' },
        Icon: { path: '@/payload/components/Icon' },
      },
    },
    autoLogin: process.env.NODE_ENV === 'development' ? {
      email: 'admin@modernmen.com',
      password: 'admin123',
      prefillOnly: true,
    } : false,
  },
  collections,
  endpoints: [],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/modernmen',
    },
  }),
  editor: lexicalEditor({
    features: ({ defaultFeatures }: { defaultFeatures: any }) => [
      ...defaultFeatures,
    ],
  }),
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
})

 
