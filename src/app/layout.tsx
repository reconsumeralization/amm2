import './globals.css';

import { Metadata } from 'next';
import { Providers } from '@/providers/providers'

export const metadata: Metadata = {
  title: 'ModernMen Hair BarberShop',
  description: 'Regina\'s Premier Men\'s Grooming',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
