/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable bundle analysis
  webpack: (config, { dev, isServer }) => {
    // Bundle analysis
    if (process.env.NEXT_BUILD_ANALYZE) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
  // Remove console logs in production
  compiler: {
    removeConsole: {
      exclude: ['error'],
    },
  },
  // Enable React 18 features
  reactStrictMode: true,
};

module.exports = nextConfig;
