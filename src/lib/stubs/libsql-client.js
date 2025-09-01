// Stub for @libsql/client - client-side only
// This prevents webpack from bundling the actual libsql client on the client side

const createClientStub = () => ({
  execute: () => Promise.reject(new Error('libsql client not available on client-side')),
  close: () => Promise.resolve(),
  batch: () => Promise.reject(new Error('libsql client not available on client-side')),
  migrate: () => Promise.reject(new Error('libsql client not available on client-side')),
  sync: () => Promise.reject(new Error('libsql client not available on client-side')),
  transaction: () => Promise.reject(new Error('libsql client not available on client-side')),
});

module.exports = {
  createClient: createClientStub,
  // Export other common functions as no-ops
  Config: class Config {},
  Client: class Client {
    constructor() {
      throw new Error('libsql client not available on client-side');
    }
  }
};
