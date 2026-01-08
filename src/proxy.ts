/**
 * Next.js Proxy for API Route Authentication
 *
 * Protects all API routes (except /api/auth/*) by validating session tokens.
 * This ensures that even direct API calls require authentication.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

const SESSION_SECRET = process.env.SESSION_SECRET || "";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_COOKIE_NAME = "dashboard_session";

/**
 * Verify session token (duplicated from login route for proxy isolation)
 * Proxy runs on Edge, so we keep this self-contained
 */
function verifySessionToken(token: string): boolean {
	if (!SESSION_SECRET) {
		// In development without SESSION_SECRET, allow all requests
		// This maintains backward compatibility for local dev
		return process.env.NODE_ENV !== "production";
	}

	const parts = token.split(".");
	if (parts.length !== 2) {
		return false;
	}

	const [timestampStr, signature] = parts;
	const timestamp = Number.parseInt(timestampStr, 10);

	if (Number.isNaN(timestamp)) {
		return false;
	}

	// Check if session has expired
	if (Date.now() - timestamp > SESSION_DURATION) {
		return false;
	}

	// Verify signature
	const hmac = createHmac("sha256", SESSION_SECRET);
	hmac.update(`${timestamp}`);
	const expectedSignature = hmac.digest("hex");

	try {
		return timingSafeEqual(
			Buffer.from(signature),
			Buffer.from(expectedSignature),
		);
	} catch {
		return false;
	}
}

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Skip auth routes - they handle their own authentication
	if (pathname.startsWith("/api/auth/")) {
		return NextResponse.next();
	}

	// Skip health check endpoint
	if (pathname === "/api/health") {
		return NextResponse.next();
	}

	// Protect all other API routes
	if (pathname.startsWith("/api/")) {
		const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

		if (!sessionCookie?.value) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 },
			);
		}

		if (!verifySessionToken(sessionCookie.value)) {
			const response = NextResponse.json(
				{ error: "Invalid or expired session" },
				{ status: 401 },
			);
			response.cookies.delete(SESSION_COOKIE_NAME);
			return response;
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all API routes except:
		 * - /api/auth/* (authentication routes)
		 * - /api/health (health check)
		 */
		"/api/:path*",
	],
};
