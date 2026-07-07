/** @type {import('next').NextConfig} */
const landingRewrites = [
  "/pestana",
].flatMap((path) => {
  const base = path === "/" ? "" : path;
  const dest = base ? `${base}/index.html` : "/index.html";
  if (path === "/") {
    return [{ source: "/", destination: dest }];
  }
  return [
    { source: path, destination: dest },
    { source: `${path}/`, destination: dest },
  ];
});

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  /** Las páginas estáticas de la landing usan rutas con / final */
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      { source: "/login", destination: "/eduguia", permanent: true },
      { source: "/register", destination: "/eduguia/register", permanent: true },
      { source: "/forgot-password", destination: "/eduguia/forgot-password", permanent: true },
      { source: "/reset-password", destination: "/eduguia/reset-password", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/favicon.ico", destination: "/assets/logo-edukids.png" },
        ...landingRewrites,
      ],
    };
  },
};

export default nextConfig;
