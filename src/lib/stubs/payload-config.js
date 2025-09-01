// Stub for payload.config.ts - client-side only
// This prevents webpack from bundling the actual payload config on the client side

const payloadConfigStub = {
  // Mock configuration that satisfies the basic interface
  collections: [],
  globals: [],
  endpoints: [],
  db: null,
  typescript: {
    outputFile: 'payload-types.ts'
  },
  plugins: [],
  hooks: {},
  cors: [],
  csrf: [],
  upload: {},
  admin: {
    user: 'users',
    meta: {
      titleSuffix: '- ModernMen Admin'
    }
  },
  secret: 'dev-secret',
  serverURL: 'http://localhost:3000'
};

module.exports = payloadConfigStub;
module.exports.default = payloadConfigStub;
