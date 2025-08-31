import './globals.css';
import '../styles/responsive-image.css';
import { Providers } from '@/providers/providers';
import { ErrorBoundary } from '@/components/error-boundary';
import { ClientLayout } from '@/components/layout/client-layout';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ModernMen Hair BarberShop',
  description: 'Regina\'s Premier Men\'s Grooming',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ErrorBoundary>
          <Providers>
            <ClientLayout>
              {children}
            </ClientLayout>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
