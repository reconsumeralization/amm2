declare module 'next-auth' {
  export interface NextAuthOptions {
    providers: any[]
    adapter?: any
    secret?: string
    session?: any
    callbacks?: any
    events?: any
    pages?: any
  }

  export interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
    permissions: string[]
    customerId?: string | null
    stylistId?: string | null
    phone?: string | null
    address?: string | null
    specialties?: string[] | null
  }
  
  export interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      permissions: string[]
      customerId?: string | null
      stylistId?: string | null
      phone?: string | null
      address?: string | null
      specialties?: string[] | null
    }
    accessToken?: string
    expires: string
  }
  
  export interface JWT {
    sub?: string
    role?: string
    permissions?: string[]
    accessToken?: string
    customerId?: string | null
    stylistId?: string | null
    phone?: string | null
    address?: string | null
    specialties?: string[] | null
  }

  export function getServerSession(...args: any[]): Promise<Session | null>
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
