import { webpackBundler } from '@payloadcms/bundler-webpack'
import postgresAdapter from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import type { Config } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'your-secret-here',
  admin: {
    meta: {
      title: 'Modern Men Salon - Simple',
      description: 'Simple test salon management system',
    },
  },
  collections: [
    {
      slug: 'users',
      admin: {
        usTitle: 'name',
        description: 'User accounts',
      },
      auth: true,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          unique: true,
        },
        {
          name: 'role',
          type: 'select',
          required: true,
          defaultValue: 'staff',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Manager', value: 'manager' },
            { label: 'Staff', value: 'staff' },
          ],
        },
      ],
      timestamps: true,
    }
  ],
  cors: [
    'http://localhost:3000',
  ].filter(Boolean),
  csrf: [
    'http://localhost:3000',
  ].filter(Boolean),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/modernmen',
    },
  }),
  editor: lexicalEditor({}),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  upload: {
    limits: {
      fileSize: 5000000,
    },
  },
} satisfies Config)
