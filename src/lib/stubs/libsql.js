// Stub for libsql - client-side only
// This prevents webpack from bundling the actual libsql package on the client side

class DatabaseStub {
  constructor() {
    throw new Error('libsql Database not available on client-side');
  }

  prepare() {
    throw new Error('libsql Database not available on client-side');
  }

  exec() {
    throw new Error('libsql Database not available on client-side');
  }

  close() {
    throw new Error('libsql Database not available on client-side');
  }

  transaction() {
    throw new Error('libsql Database not available on client-side');
  }
}

module.exports = {
  Database: DatabaseStub,
  open: () => {
    throw new Error('libsql open not available on client-side');
  },
  connect: () => {
    throw new Error('libsql connect not available on client-side');
  },
  // Export other common functions
  SQLITE_OK: 0,
  SQLITE_ERROR: 1,
  SQLITE_BUSY: 5,
  SQLITE_ROW: 100,
  SQLITE_DONE: 101,
};
