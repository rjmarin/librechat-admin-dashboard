/**
 * Base path for the application, set at build time via NEXT_PUBLIC_BASE_PATH.
 *
 * For local development: empty string (app runs at /)
 * For Docker/Kubernetes: typically "/dashboard" (app runs at /dashboard)
 *
 * Note: Docker images are built with NEXT_PUBLIC_BASE_PATH=/dashboard by default.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * API base URL for fetch calls.
 * Combines basePath with /api to form the complete API URL.
 *
 * Usage:
 * ```ts
 * import { API_BASE } from "@/lib/utils/api-base";
 * const response = await fetch(`${API_BASE}/your-endpoint`);
 * ```
 */
export const API_BASE = `${basePath}/api`;

/**
 * Get an absolute URL path that includes the basePath.
 * Use this for window.location.href or other browser navigation
 * where Next.js router is not available.
 *
 * Note: For Next.js router.push() / router.replace(), the basePath
 * is automatically applied - use regular paths like "/login".
 *
 * Usage:
 * ```ts
 * import { getAbsolutePath } from "@/lib/utils/api-base";
 * window.location.href = getAbsolutePath("/login");
 * ```
 */
export function getAbsolutePath(path: string): string {
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${basePath}${normalizedPath}`;
}
