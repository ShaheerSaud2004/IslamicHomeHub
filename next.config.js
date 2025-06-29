/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Image optimization for article images
  images: {
    domains: [
      'www.aljazeera.com',
      'www.islamonline.net',
      'www.isna.net',
      'www.middleeasteye.net',
      'www.arabnews.com',
      'www.muslimnews.co.uk',
      'islam21c.com',
      
      // New Arabic sources
      'www.alukah.net',
      'www.islamweb.net',
      'islamtoday.net',
      'al-eman.com',
      
      // New English sources
      'www.islamicnewsdaily.com',
      'aboutislam.net',
      'muslimmatters.org',
      'iqna.ir',
      
      // South Asian sources
      'www.ummat.net',
      'www.siasat.com',
      'muslimmirror.com',
      
      // Southeast Asian sources
      'www.republika.co.id',
      'www.bharian.com.my',
      
      // Turkish sources
      'www.diyanet.gov.tr',
      'www.yenisafak.com',
      
      // African sources
      'muslumnews.com.ng',
      'www.islaminafrica.com',
      
      // Persian sources
      'www.hawzahnews.com',
      
      // French sources
      'oumma.com',
      'www.saphirnews.com',
      
      // Additional common image hosts
      'cdn.aljazeera.com',
      'images.aljazeera.com',
      'static.aljazeera.com',
      'media.islamonline.net',
      'images.islamonline.net',
      'static.middleeasteye.net',
      'images.middleeasteye.net',
      'www.arabnews.pk',
      'images.arabnews.com'
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Environment variables
  env: {
    FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DATABASE_PATH: process.env.DATABASE_PATH,
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    // Enable server components for better performance
    serverComponentsExternalPackages: ['sqlite3'],
  },

  // Webpack configuration for handling sqlite3
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle these Node.js modules in the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        'sqlite3': false,
        'better-sqlite3': false,
        'child_process': false,
        'worker_threads': false,
      };
      
      // Ignore sqlite3 and other server-only modules
      config.externals = config.externals || [];
      config.externals.push('sqlite3', 'better-sqlite3');
    } else {
      // Server-side configuration
      config.externals = config.externals || [];
      // Don't externalize sqlite3 on server-side (we want it bundled)
      config.externals = config.externals.filter(external => 
        external !== 'sqlite3' && external !== 'better-sqlite3'
      );
    }
    
    return config;
  },
};

module.exports = nextConfig; 