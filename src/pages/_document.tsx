import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en-GB" suppressHydrationWarning>
      <Head>
        {/*
          CRITICAL: No charset or viewport here —
          Next.js Pages Router injects those automatically.
          Adding them here causes duplicates that break Power Pages.
        */}
        <meta name="robots" content="noindex, nofollow" />
        {/*
          CRITICAL: React 18 UMD globals must load BEFORE Next.js chunks.
          This bypasses Power Pages' Webpack 5 Module Federation which
          injects React 16.14.0 and collides with Next.js's React 18.
          With webpack externals, our chunks reference window.React/ReactDOM
          directly — no module resolution for Module Federation to intercept.
        */}
        <script src="/vendor/react.production.min.js" />
        <script src="/vendor/react-dom.production.min.js" />
        <link rel="icon" href="/favicon.ico?603d046c9a6fdfbb" type="image/x-icon" sizes="16x16" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body suppressHydrationWarning style={{ background: '#0A0A0A' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
