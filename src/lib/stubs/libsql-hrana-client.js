// Stub for @libsql/hrana-client - client-side only
// This prevents webpack from bundling the actual libsql hrana client on the client side

const openStub = () => ({
  close: () => Promise.resolve(),
  execute: () => Promise.reject(new Error('libsql hrana client not available on client-side')),
  batch: () => Promise.reject(new Error('libsql hrana client not available on client-side')),
  sequence: () => Promise.reject(new Error('libsql hrana client not available on client-side')),
  store: () => Promise.reject(new Error('libsql hrana client not available on client-side')),
});

class HranaClientStub {
  constructor() {
    throw new Error('libsql hrana client not available on client-side');
  }

  open() {
    return openStub();
  }

  close() {
    return Promise.resolve();
  }
}

module.exports = {
  open: openStub,
  Client: HranaClientStub,
  // Export other common functions and classes
  Stream: class Stream {
    constructor() {
      throw new Error('libsql hrana Stream not available on client-side');
    }
  },
  Cursor: class Cursor {
    constructor() {
      throw new Error('libsql hrana Cursor not available on client-side');
    }
  }
};
