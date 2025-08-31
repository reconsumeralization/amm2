import './globals.css';
import '../styles/responsive-image.css';
import { Providers } from '@/providers/providers';
import { ErrorBoundary } from '@/components/error-boundary';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ModernMen Hair BarberShop',
  description: 'Regina\'s Premier Men\'s Grooming',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
            <Navbar />
            <main className="pt-16 min-h-screen">
              {children}
            </main>
            <Footer />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
