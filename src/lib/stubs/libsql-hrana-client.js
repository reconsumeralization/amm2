// Stub for @libsql/hrana-client - client-side only
// This prevents webpack from bundling the actual libsql hrana client on the client side

module.exports = {
  open: () => ({
    close: () => Promise.resolve(),
    execute: () => Promise.reject(new Error('libsql hrana client not available on client-side')),
  }),
};
