/**
 * Zod schemas for API query parameter validation
 *
 * This module provides type-safe validation schemas for all API endpoints.
 * Using Zod ensures consistent validation across all routes and provides
 * better error messages for invalid input.
 */

import { z } from "zod";

/**
 * ISO-8601 date string schema with validation
 */
const isoDateString = z.string().refine(
	(val) => {
		const date = new Date(val);
		return !Number.isNaN(date.getTime());
	},
	{ message: "Invalid date format. Use ISO-8601 (YYYY-MM-DDTHH:mm:ssZ)" },
);

/**
 * Schema for date range query parameters
 * Used by most statistics endpoints
 */
export const dateRangeSchema = z
	.object({
		start: isoDateString,
		end: isoDateString,
	})
	.refine(
		(data) => {
			const startDate = new Date(data.start);
			const endDate = new Date(data.end);
			return startDate <= endDate;
		},
		{ message: "Start date cannot be after end date" },
	);

/**
 * Schema for time granularity
 */
export const timeGranularitySchema = z.enum(["hour", "day", "month"]);

/**
 * Schema for time series chart query parameters
 */
export const timeSeriesQuerySchema = dateRangeSchema.and(
	z.object({
		granularity: timeGranularitySchema.optional().default("day"),
		timezone: z.string().optional().default("UTC"),
	}),
);

/**
 * Schema for model/agent specific queries
 */
export const modelQuerySchema = dateRangeSchema.and(
	z.object({
		model: z.string().min(1, "Model name is required"),
	}),
);

/**
 * Schema for agent specific queries
 */
export const agentQuerySchema = dateRangeSchema.and(
	z.object({
		agentName: z.string().min(1, "Agent name is required"),
		granularity: timeGranularitySchema.optional().default("day"),
		timezone: z.string().optional().default("UTC"),
	}),
);

/**
 * Schema for pagination parameters
 */
export const paginationSchema = z.object({
	page: z.coerce.number().int().positive().optional().default(1),
	limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

/**
 * Schema for heat map query parameters
 */
export const heatMapQuerySchema = dateRangeSchema.and(
	z.object({
		timezone: z.string().optional().default("UTC"),
	}),
);

/**
 * Type exports for use in route handlers
 */
export type DateRangeQuery = z.infer<typeof dateRangeSchema>;
export type TimeSeriesQuery = z.infer<typeof timeSeriesQuerySchema>;
export type ModelQuery = z.infer<typeof modelQuerySchema>;
export type AgentQuery = z.infer<typeof agentQuerySchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
export type HeatMapQuery = z.infer<typeof heatMapQuerySchema>;

/**
 * Helper to parse and validate query parameters from a Request
 */
export function parseQueryParams<T extends z.ZodType>(
	request: Request,
	schema: T,
): ReturnType<T["safeParse"]> {
	const url = new URL(request.url);
	const params = Object.fromEntries(url.searchParams.entries());
	return schema.safeParse(params) as ReturnType<T["safeParse"]>;
}

/**
 * Convert parsed date strings to Date objects
 */
export function toDateRange(parsed: DateRangeQuery): {
	startDate: Date;
	endDate: Date;
} {
	return {
		startDate: new Date(parsed.start),
		endDate: new Date(parsed.end),
	};
}
