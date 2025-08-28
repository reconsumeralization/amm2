import './globals.css';
import '../styles/responsive-image.css';
import { Providers } from '@/providers/providers';
import { ErrorBoundary } from '@/components/error-boundary';
import { Footer } from '@/components/layout/footer';
import { getPayload } from 'payload';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ModernMen Hair Salon',
  description: 'Regina\'s Premier Men\'s Grooming',
};

async function getFooterMenuItems() {
  try {
    if (process.env.NODE_ENV === 'test') return []
    const payload = await getPayload({ config: await import('../payload.config') })
    const res = await payload.find({
      collection: 'navigationMenus',
      where: { location: { equals: 'footer' } },
      depth: 2,
      limit: 1,
    })
    return res.docs?.[0]?.items || []
  } catch {
    return []
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const footerItems = await getFooterMenuItems()
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
            {children}
            <Footer items={footerItems} />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}