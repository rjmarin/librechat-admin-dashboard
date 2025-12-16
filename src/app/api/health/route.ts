import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface HealthStatus {
	status: "healthy" | "unhealthy";
	timestamp: string;
	version: string;
	uptime: number;
	checks: {
		database?: "connected" | "disconnected" | "unknown";
	};
}

export async function GET() {
	const healthStatus: HealthStatus = {
		status: "healthy",
		timestamp: new Date().toISOString(),
		version: process.env.npm_package_version || "0.1.0",
		uptime: process.uptime(),
		checks: {},
	};

	// Basic health check - just return OK for Kubernetes liveness probe
	// For readiness probe, you could add database connectivity check

	return NextResponse.json(healthStatus, {
		status: 200,
		headers: {
			"Cache-Control": "no-store, no-cache, must-revalidate",
		},
	});
}
