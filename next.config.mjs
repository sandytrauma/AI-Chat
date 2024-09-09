/** @type {import('next').NextConfig} */
const nextConfig = {
    // Target serverless deployment
    target: 'serverless',
    // Optional: you can enable experimental features or other settings here
    experimental: {
      // Enables React Strict Mode
      reactStrictMode: true,
    },
  };
  
  export default nextConfig;
  