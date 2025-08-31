import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  transpilePackages: [],
  serverExternalPackages: [
    'payload',
    '@payloadcms/db-postgres',
    '@payloadcms/db-sqlite',
    '@libsql/client',
    'sqlite3',
    'pg',
    'undici',
    'next-auth',
    '@next-auth/prisma-adapter',
    'bcryptjs',
    'jsonwebtoken'
  ],

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.modernmen.ca' },
      { protocol: 'https', hostname: '**.vercel.app' },
    ],
  },
  env: {
    PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  },
  webpack: (config, { isServer, webpack }) => {
    // Configure webpack for Payload CMS compatibility

    // Configure fallbacks for both server and client
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      sqlite3: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      url: false,
      util: false,
      querystring: false,
      buffer: false,
      console: false,
      diagnostics_channel: false,
      dns: false,
      // Add more Node.js modules that might cause issues
      child_process: false,
      cluster: false,
      dgram: false,
      events: false,
      net: false,
      readline: false,
      repl: false,
      tls: false,
      tty: false,
      v8: false,
      vm: false,
      worker_threads: false,
    };

    // Handle node: protocol imports by resolving them to empty modules
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:console': false,
      'node:crypto': false,
      'node:diagnostics_channel': false,
      'node:dns': false,
      'node:fs': false,
      // Add more node: protocol aliases
      'node:child_process': false,
      'node:cluster': false,
      'node:dgram': false,
      'node:events': false,
      'node:net': false,
      'node:readline': false,
      'node:repl': false,
      'node:tls': false,
      'node:tty': false,
      'node:v8': false,
      'node:vm': false,
      'node:worker_threads': false,
      // Prevent webpack from attempting to resolve optional native pg binding
      'pg-native': false,
    };

    // Add rules to handle node: protocol imports
    config.module.rules.push({
      test: /node:.*/,
      use: 'ignore-loader'
    });

    // Add plugins to handle problematic imports
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      })
    );

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
}

export default nextConfig
