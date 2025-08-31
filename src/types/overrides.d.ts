// Comprehensive type overrides to fix remaining issues

declare module 'next/navigation' {
  export function redirect(url: string): never;
  export function notFound(): never;
}

// Fix any remaining Payload type issues
declare global {
  namespace Payload {
    interface Config {
      [key: string]: any;
    }
  }
}

// Generic session type that works everywhere
interface UniversalSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    permissions: string[];
    [key: string]: any;
  };
  [key: string]: any;
}

export {};
