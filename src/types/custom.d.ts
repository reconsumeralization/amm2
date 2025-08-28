declare module 'framer-motion';
declare module '@radix-ui/react-label';
declare module '@radix-ui/react-slot' {
  export const Slot: any;
}
declare module 'lucide-react' {
  export const X: any;
}
declare module '@payloadcms/db-postgres' {
  const value: any;
  export default value;
}
declare module '@payloadcms/richtext-lexical' {
  const value: any;
  export default value;
}
declare module '@testing-library/react' {
  export const render: any;
  export const screen: any;
}
declare module '@storybook/react' {
  export const Meta: any;
  export const Story: any;
}
declare module 'class-variance-authority' {
  // Minimal type declarations for class-variance-authority
  export function cva(...args: any[]): any;
  export type VariantProps<T> = any;
}
declare module 'date-fns';
declare module 'gray-matter';
declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): any;
}

// Fallback for any other missing modules
declare module '*';
