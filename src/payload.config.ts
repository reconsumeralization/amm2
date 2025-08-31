import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import path from 'path'

// Import essential collections only for testing
import { Users } from './payload/collections/system/Users'
import { Settings } from './payload/collections/system/Settings'
import { Media } from './payload/collections/content/Media'
import { Tenants } from './payload/collections/system/Tenants'
import { Products } from './payload/collections/content/Products'
import BeforeDashboard from './payload/components/BeforeDashboard'

const collections = [Users, Settings, Media, Tenants, Products]

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'dev-secret',
  serverURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- ModernMen Admin',
    },
    components: {
      beforeDashboard: [BeforeDashboard],
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
      url: process.env.DATABASE_URL || process.env.DATABASE_URI || 'file:./dev.db',
    },
  }),
  typescript: {
    outputFile: path.resolve(process.cwd(), 'src/payload-types.ts'),
  },
})

 
