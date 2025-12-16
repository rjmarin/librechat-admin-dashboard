import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
	output: "standalone",
	// Support for running behind a reverse proxy with a base path
	basePath: basePath || undefined,
	// Disable x-powered-by header for security
	poweredByHeader: false,
	// Enable strict mode for better security
	reactStrictMode: true,
	// Optimize images
	images: {
		unoptimized: true, // For standalone output
	},
	// Security headers
	async headers() {
		return [
			{
				source: "/:path*",
				headers: [
					{
						key: "X-DNS-Prefetch-Control",
						value: "on",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=63072000; includeSubDomains; preload",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					{
						key: "Referrer-Policy",
						value: "origin-when-cross-origin",
					},
					{
						key: "Permissions-Policy",
						value: "camera=(), microphone=(), geolocation=()",
					},
				],
			},
		];
	},
	async redirects() {
		return [
			{
				source: "/",
				destination: "/dashboard",
				permanent: true,
			},
		];
	},
};

export default nextConfig;
