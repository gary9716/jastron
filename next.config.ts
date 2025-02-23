const repoName = "jastron";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Required for static export
  },
  basePath: repoName, // Replace with your GitHub repo name
  assetPrefix: repoName,
};

export default nextConfig;
