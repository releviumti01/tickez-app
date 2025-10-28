/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Desabilita a renderização estática automática
    // Isso fará com que todas as rotas sejam renderizadas dinamicamente
    missingSuspenseWithCSRBailout: false,
  },
}

export default nextConfig
