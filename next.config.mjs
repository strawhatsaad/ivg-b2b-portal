/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: Disable Strict Mode to prevent double-invocation of the Double-rAF mounting sequence
  reactStrictMode: false,

  // CRITICAL: Static export for Power Pages Code Site
  output: 'export',

  // CRITICAL: Trailing slash ensures correct routing behavior
  // when Power Pages serves the root index.html for all sub-routes
  trailingSlash: true,

  // CRITICAL: No image optimization — static export doesn't support it
  images: {
    unoptimized: true,
  },

  // Compiler options
  typescript: {
    ignoreBuildErrors: false,
  },

  webpack: (config, { isServer, dev }) => {
    // Production client build: externalize React so it loads from the global
    // UMD scripts (public/vendor/), completely bypassing webpack module
    // resolution and Power Pages' Module Federation interference.
    if (!isServer && !dev) {
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        {
          'react': 'React',
          'react-dom': 'ReactDOM',
        },
        // Handle subpath imports (react-dom/client, react-dom/server, etc.)
        function ({ request }, callback) {
          if (request && /^react-dom\//.test(request)) {
            return callback(null, 'ReactDOM');
          }
          callback();
        },
      ];
    }
    return config;
  },

  // Dev proxy — only active with `next dev`, not in the export
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/_api/:path*',
          destination: `${process.env.POWER_PAGES_URL || 'http://localhost:3000'}/_api/:path*`,
        },
        {
          source: '/_layout/:path*',
          destination: `${process.env.POWER_PAGES_URL || 'http://localhost:3000'}/_layout/:path*`,
        },
        {
          source: '/Account/:path*',
          destination: `${process.env.POWER_PAGES_URL || 'http://localhost:3000'}/Account/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
