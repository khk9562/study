/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const repo = "archive_studying";

const nextConfig = {
  output: "export",
  // GitHub Pages는 user.github.io/<repo> 하위 경로에 배포되므로 prod에서만 basePath 적용
  basePath: isProd ? `/${repo}` : "",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
