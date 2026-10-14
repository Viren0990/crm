import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Dashboard was removed; New Leads is the home page
      { source: '/', destination: '/leads/new', permanent: false },
      // Leads were split into New Leads and Assigned Leads
      { source: '/leads', destination: '/leads/new', permanent: false },
      // Each caller has their own Assigned page
      { source: '/leads/assigned', destination: '/leads/assigned/ritu', permanent: false },
    ]
  },
};

export default nextConfig;
