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

    // Ignore problematic file types and directories
    config.module.rules.push({
      test: /\.(md|txt|license|node|d\.mts|d\.ts)$/i,
      use: 'ignore-loader',
    });

    // Ignore specific problematic files
    config.module.rules.push({
      test: /(LICENSE|README|CHANGELOG|COPYING)(\.md)?$/i,
      use: 'ignore-loader',
    });

    // Ignore libSQL client files that cause issues
    config.module.rules.push({
      test: /node_modules\/@libsql\/.*\.(md|txt|license)$/i,
      use: 'ignore-loader',
    });

    // Ignore drizzle-kit TypeScript declaration files
    config.module.rules.push({
      test: /node_modules\/drizzle-kit\/.*\.(d\.mts|d\.ts)$/i,
      use: 'ignore-loader',
    });

    // Ignore conflicting route files in admin segments
    config.module.rules.push({
      test: /admin\/\[\[\.\.\.segments\]\]\/route\.ts$/i,
      use: 'ignore-loader',
    });

    // Ignore conflicting signout route files
    config.module.rules.push({
      test: /auth\/signout\/route\.ts$/i,
      use: 'ignore-loader',
    });

    // Ignore the empty route file completely
    config.module.rules.push({
      test: /route\.ts$/i,
      exclude: /auth\/signout\/route\.ts$/,
      use: 'ignore-loader',
    });

    // Add a plugin to completely exclude the signout route file
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /auth\/signout\/route\.ts$/,
      })
    );

    // Configure fallbacks for both server and client
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
      sqlite3: false,
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
