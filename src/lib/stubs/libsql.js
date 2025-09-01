// Stub for libsql - client-side only
// This prevents webpack from bundling the actual libsql package on the client side

module.exports = {
  Database: class {
    constructor() {
      throw new Error('libsql Database not available on client-side');
    }
  },
  open: () => {
    throw new Error('libsql open not available on client-side');
  },
};
