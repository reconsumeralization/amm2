import { buildConfig } from 'payload'
import postgresAdapter from '@payloadcms/db-postgres'
import path from 'path'
import { withLexicalEditor } from './payload/utils/withLexicalEditor'
import collections from './payload/collections'

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'dev-secret',
  serverURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- ModernMen Admin',
    },
  },
  collections,
  endpoints: [],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL,
    },
  }),
  typescript: {
    outputFile: path.resolve(process.cwd(), 'src/payload-types.ts'),
  },
  plugins: [],
})