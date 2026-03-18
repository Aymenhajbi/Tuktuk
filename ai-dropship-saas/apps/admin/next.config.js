const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Ensure monorepo root is traced so shared packages are included
  outputFileTracingRoot: path.join(__dirname, '../../'),
};
module.exports = nextConfig;
