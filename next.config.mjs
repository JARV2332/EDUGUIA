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

/** Proxy ISABEL (proyecto aparte en Vercel) bajo /ISABEL */
const isabelRewrites = [
  {
    source: "/ISABEL",
    destination: "https://isabel-lake.vercel.app/ISABEL",
  },
  {
    source: "/ISABEL/",
    destination: "https://isabel-lake.vercel.app/ISABEL/",
  },
  {
    source: "/ISABEL/:path*",
    destination: "https://isabel-lake.vercel.app/ISABEL/:path*",
  },
];

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
      { source: "/isabel", destination: "/ISABEL", permanent: true },
      { source: "/isabel/:path*", destination: "/ISABEL/:path*", permanent: true },
      { source: "/login", destination: "/eduguia", permanent: true },
      { source: "/register", destination: "/eduguia/register", permanent: true },
      { source: "/forgot-password", destination: "/eduguia/forgot-password", permanent: true },
      { source: "/reset-password", destination: "/eduguia/reset-password", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        ...isabelRewrites,
        { source: "/favicon.ico", destination: "/assets/logo-edukids.png" },
        ...landingRewrites,
      ],
    };
  },
};

export default nextConfig;
