declare module 'next-auth' {
  export function getServerSession(...args: any[]): any;
  export interface NextAuthOptions {
    providers: any[];
    adapter?: any;
    secret?: string;
    session?: any;
    callbacks?: any;
    events?: any;
    pages?: any;
  }
  
  export interface User {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    role?: string;
  }
  
  export interface Session {
    user: User;
    accessToken?: string;
  }
  
  export interface JWT {
    sub?: string;
    role?: string;
    accessToken?: string;
  }
}

declare module 'next-auth/react' {
  import { Session } from 'next-auth';
  import { ReactNode } from 'react';

  export interface SessionProviderProps {
    children: ReactNode;
    session?: Session | null;
    refetchInterval?: number;
    refetchOnWindowFocus?: boolean;
    refetchWhenOffline?: boolean;
  }

  export function SessionProvider(props: SessionProviderProps): JSX.Element;
  export function useSession(): {
    data: Session | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
  };
  export function signIn(provider?: string, options?: any): Promise<any>;
  export function signOut(options?: any): Promise<any>;
  export function getSession(options?: any): Promise<Session | null>;
  export function getCsrfToken(): Promise<string | null>;
  export function getProviders(): Promise<any>;
}
