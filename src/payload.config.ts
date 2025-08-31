import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import path from 'path'

// Import all collections from the organized structure
import collections from './payload/collections/index.ts'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'dev-secret',
  serverURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
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
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || 'file:./dev.db',
    },
  }),
  typescript: {
    outputFile: path.resolve(process.cwd(), 'src/payload-types.ts'),
  },
})

 
