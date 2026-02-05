import type { NextConfig } from 'next'
import withSerwistInit from '@serwist/next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development', // Disable SW in dev mode
})

const nextConfig: NextConfig = {
  turbopack: {}, // Silence Turbopack warning for webpack-based plugins like @serwist/next
}

export default withSerwist(nextConfig)
