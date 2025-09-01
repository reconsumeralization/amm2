// Stub for @libsql/client - client-side only
// This prevents webpack from bundling the actual libsql client on the client side

module.exports = {
  createClient: () => ({
    execute: () => Promise.reject(new Error('libsql client not available on client-side')),
    close: () => Promise.resolve(),
  }),
};
