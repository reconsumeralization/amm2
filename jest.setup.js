import '@testing-library/jest-dom';

// Provide Web Fetch API globals for Next's Request/Response usage in tests
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const undici = require('undici');
  const undiciFetch = undici.fetch;
  const Headers = undici.Headers;
  const Request = undici.Request;
  const Response = undici.Response;
  if (typeof globalThis.fetch === 'undefined') globalThis.fetch = undiciFetch;
  if (typeof globalThis.Headers === 'undefined') globalThis.Headers = Headers;
  if (typeof globalThis.Request === 'undefined') globalThis.Request = Request;
  if (typeof globalThis.Response === 'undefined') globalThis.Response = Response;
} catch {}

// Mock Next's server request/response for API route tests
jest.mock('next/server', () => {
  const HeadersCtor = globalThis.Headers || class {};
  const ResponseCtor = globalThis.Response || class {};
  const RequestCtor = globalThis.Request || class {};

  class NextRequest extends RequestCtor {
    constructor(input, init) {
      super(input, init);
    }
  }
  class NextResponse {
    static json(body, init) {
      const headers = new HeadersCtor({ 'Content-Type': 'application/json' });
      return new ResponseCtor(JSON.stringify(body), Object.assign({ headers }, init || {}));
    }
  }
  return { NextRequest, NextResponse };
});

global.renderHook = (hook) => {
  let result;
  function TestComponent() {
    result = hook();
    return null;
  }
  return result;
};