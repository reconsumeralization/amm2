declare module 'next-auth/react' {
  /**
   * Mock implementation of the useSession hook for TypeScript compilation.
   * Returns a default unauthenticated session.
   */
  export function useSession(): {
    data: any | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };

  /**
   * Optional getSession function placeholder.
   */
  export function getSession(): Promise<any>;

  /**
   * Optional signIn and signOut placeholders.
   */
  export function signIn(...args: any[]): Promise<any>;
  export function signOut(...args: any[]): Promise<any>;
}
