/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // No longer static export — this is now a headless server-rendered app
  // connected to a live Dataverse backend

  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },

};

export default nextConfig;
