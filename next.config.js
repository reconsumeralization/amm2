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
    '@payloadcms/db-sqlite',
    '@libsql/client',
    'sqlite3'
  ],

  images: {
    domains: ['images.unsplash.com', 'localhost'],
  },
  env: {
    PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
  },
  webpack: (config, { isServer, webpack }) => {
    // Configure webpack for Payload CMS compatibility
    if (!isServer) {
      // Exclude server-only packages from client bundle
      config.externals = config.externals || [];
      config.externals.push({
        'payload': 'commonjs payload',
        '@payloadcms/db-sqlite': 'commonjs @payloadcms/db-sqlite',
        '@libsql/client': 'commonjs @libsql/client',
        'sqlite3': 'commonjs sqlite3',
      });

      // Ignore problematic file types
      config.module.rules.push({
        test: /\.(md|txt|license|node)$/i,
        use: 'ignore-loader',
      });

      // Ignore specific problematic files
      config.module.rules.push({
        test: /(LICENSE|README|CHANGELOG|COPYING)(\.md)?$/i,
        use: 'ignore-loader',
      });
    }

    // Configure fallbacks for both server and client
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: isServer ? false : false,
      path: isServer ? false : false,
      os: isServer ? false : false,
      sqlite3: isServer ? false : false,
    };

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
