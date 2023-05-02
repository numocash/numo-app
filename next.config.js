/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coingecko.com",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/earn",
        permanent: true,
      },
      {
        source: "/trade",
        destination: "/earn",
        permanent: false,
      },
      {
        source: "/trade/details",
        destination: "/earn",
        permanent: false,
      },
      {
        source: "/earn/details",
        destination: "/earn",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
