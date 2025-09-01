import { webpackBundler } from '@payloadcms/bundler-webpack'
import postgresAdapter from '@payloadcms/db-postgres'
import lexicalEditor from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import type { Config, CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Simple test collections
const Users = {
  slug: 'users',
  admin: {
    useAsTitle: 'name',
    description: 'User accounts',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text' as const,
      required: true,
    },
    {
      name: 'email',
      type: 'email' as const,
      required: true,
      unique: true,
    },
    {
      name: 'role',
      type: 'select' as const,
      required: true,
      defaultValue: 'staff',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Manager', value: 'manager' },
        { label: 'Staff', value: 'staff' },
      ] as const,
    },
  ],
  timestamps: true,
}

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || 'test-secret-key-for-development',
  admin: {
    meta: {
      title: 'Modern Men barber - Test',
      description: 'Test barber management system',
    },
  },
  collections: [
    Users
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
