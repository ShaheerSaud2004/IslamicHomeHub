/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Static export configuration for GitHub Pages
  output: 'export',
  trailingSlash: true,
  
  // Images configuration
  images: {
    domains: ['via.placeholder.com', 'images.unsplash.com', 'picsum.photos'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: true
  },
  
  // Handle GitHub Pages subdirectory if needed
  basePath: process.env.NODE_ENV === 'production' ? '/IslamicHomeHub' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/IslamicHomeHub/' : '',
  
  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // SQLite configuration
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        os: false,
        buffer: false,
        stream: false,
      };
    }

    // Custom loader for SQLite
    config.module.rules.push({
      test: /\.node$/,
      use: 'raw-loader',
    });

    return config;
  },
};

module.exports = nextConfig; 