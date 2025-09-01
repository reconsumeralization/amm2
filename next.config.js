const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Note: ESLint and TypeScript error ignoring moved to package.json scripts for better control
  // This fixes Vercel deployment issues with Next.js 14+
  // Vercel-specific optimizations
  transpilePackages: ['payload'],

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Experimental features for better performance and faster builds
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    webVitalsAttribution: ['CLS', 'LCP'],
    // Optimize build performance
    webpackBuildWorker: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Build performance optimizations
  output: 'standalone',
  trailingSlash: false,

  // Image optimization settings
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.modernmen.ca' },
      { protocol: 'https', hostname: '**.vercel.app' },
      { protocol: 'https', hostname: '**.vercel-storage.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Environment variables
  env: {
    PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },

  // Webpack configuration - Optimized for Vercel builds
  webpack: (config, { isServer, dev, buildId }) => {
    // Performance optimization: Skip expensive operations in Vercel builds
    if (process.env.VERCEL) {
      // Disable webpack cache serialization warnings
      config.cache = false;

      // Optimize for build speed
      config.optimization = {
        ...config.optimization,
        emitOnErrors: false,
        moduleIds: 'deterministic',
      };
    }

    // Handle Payload CMS and other server-only packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        url: false,
        querystring: false,
        os: false,
        http: false,
        https: false,
        zlib: false,
      };
    }

    // Exclude problematic files from webpack bundling
    config.module.rules.push({
      test: /\.(md|txt|readme|license|LICENSE)$/i,
      include: /node_modules/,
      type: 'javascript/auto',
      use: [{
        loader: 'null-loader'
      }]
    });

    // Additional exclusion for libsql LICENSE files
    config.module.rules.push({
      test: /LICENSE$/,
      include: /node_modules\/@libsql/,
      use: [{
        loader: 'null-loader'
      }]
    });

    // Handle .node files properly for SQLite
    config.module.rules.push({
      test: /\.node$/,
      include: /node_modules/,
      use: [{
        loader: 'file-loader',
        options: {
          publicPath: '/_next/static/chunks/',
          outputPath: 'static/chunks/',
        },
      }],
    });

    // Fix for libsql client-side imports - use stubs instead of externals
    if (!isServer) {
      // Use stubs for client-side to prevent bundling issues
      config.resolve.alias = {
        ...config.resolve.alias,
        '@libsql/client': path.resolve(__dirname, 'src/lib/stubs/libsql-client.js'),
        '@libsql/hrana-client': path.resolve(__dirname, 'src/lib/stubs/libsql-hrana-client.js'),
        '@libsql/core': false,
        'libsql': path.resolve(__dirname, 'src/lib/stubs/libsql.js'),
        '@/payload.config': path.resolve(__dirname, 'src/lib/stubs/payload-config.js'),
        '../payload.config': path.resolve(__dirname, 'src/lib/stubs/payload-config.js'),
        '../../../payload.config': path.resolve(__dirname, 'src/lib/stubs/payload-config.js'),
        '../../../../payload.config': path.resolve(__dirname, 'src/lib/stubs/payload-config.js'),
        '../../../../../payload.config': path.resolve(__dirname, 'src/lib/stubs/payload-config.js'),
      };
    }

    // Exclude all libsql TypeScript definition files from webpack processing
    config.module.rules.push({
      test: /\.d\.ts$/,
      include: [
        /node_modules\/@libsql/,
        /node_modules\/libsql/,
        /node_modules\/@payloadcms\/db-sqlite/
      ],
      use: [{
        loader: 'null-loader'
      }]
    });

    // Exclude payload.config.ts from client-side bundling
    if (!isServer) {
      config.module.rules.push({
        test: /payload\.config\.ts$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'modernmen-yolo/src')
        ],
        use: [{
          loader: 'null-loader'
        }]
      });
    }

    // Handle ESM imports from libsql packages - exclude all problematic files
    config.module.rules.push({
      test: /\.js$/,
      include: [
        /node_modules\/@libsql\/.*\/lib-esm/,
        /node_modules\/libsql\/.*\/lib-esm/,
        /node_modules\/@payloadcms\/db-sqlite\/.*\/lib-esm/
      ],
      type: 'javascript/auto',
      use: [{
        loader: 'null-loader'
      }]
    });

    // Exclude libsql core files from bundling
    config.module.rules.push({
      test: /\.(js|mjs|ts)$/,
      include: /node_modules\/@libsql\/core/,
      use: [{
        loader: 'null-loader'
      }]
    });

    // Handle any remaining libsql files
    config.module.rules.push({
      test: /\.(js|mjs|ts)$/,
      include: [
        /node_modules\/@libsql\/hrana-client/,
        /node_modules\/@libsql\/client/,
        /node_modules\/libsql/
      ],
      use: [{
        loader: 'null-loader'
      }]
    });

    // Optimize bundle size in production - simplified for faster builds
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/](?!@payloadcms)/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          payload: {
            test: /[\\/]node_modules[\\/]@payloadcms[\\/]/,
            name: 'payload',
            chunks: 'all',
            priority: 20,
          },
        },
      };
    }

    // Add custom aliases for cleaner imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname),
    };

    return config;
  },

  // Security headers
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/admin/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },

  // Redirects and rewrites
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/admin',
        destination: '/admin',
        permanent: false,
      },
    ];
  },

  // Build optimization
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,

  // Logging configuration
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === 'development',
    },
  },

  // On-demand revalidation
  generateEtags: true,
}

module.exports = nextConfig
