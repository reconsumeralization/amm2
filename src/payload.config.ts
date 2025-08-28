import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';

import { Appointments, BusinessDocumentation, Users, Tenants, Media, StaffSchedules, Events, Products, ClockRecords, Settings, Customers, Services, Stylists, Orders, Testimonials } from './collections';

export default buildConfig({
  admin: {
    user: 'users',
    autoLogin: process.env.NODE_ENV === 'development' ? {
      email: 'admin@modernmen.com',
      password: 'admin123',
      prefillOnly: true
    } : false,
  },
  collections: [Appointments, BusinessDocumentation, Users, Tenants, Media, StaffSchedules, Events, Products, ClockRecords, Settings, Customers, Services, Stylists, Orders, Testimonials],
  endpoints: [],
  db: sqliteAdapter({ url: process.env.DATABASE_URI || './database.sqlite' }),
  secret: process.env.PAYLOAD_SECRET || 'your-secret-key',
  serverURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  routes: {
    admin: '/admin',
    api: '/api/admin',
  },
  
  plugins: [
    // Plugins temporarily disabled until dependencies are properly installed
  ],

  // Add CORS configuration
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ].filter(Boolean),

  // Add CSRF protection
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ].filter(Boolean),
});