import type { Metadata } from 'next';
import { Providers } from './providers';

import '@/styles/globals.css';
import '@/styles/home.css';
import '@/styles/dashboard.css';
import '@/styles/portal.css';

export const metadata: Metadata = {
  title: 'IVG B2B Portal',
  description: 'IVG Premium E-Liquids — B2B Trade Portal',
  robots: 'noindex, nofollow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="16x16" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning style={{ background: '#0A0A0A' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
