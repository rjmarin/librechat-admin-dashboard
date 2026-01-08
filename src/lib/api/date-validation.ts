/**
 * Date validation and calculation utilities for API routes
 *
 * Note: For new API routes, prefer using Zod schemas from ./schemas.ts
 * This module is maintained for backward compatibility with existing routes.
 */

import { NextResponse } from "next/server";
import type { DateRange, PeriodComparison } from "../db/types";
import { dateRangeSchema, parseQueryParams, toDateRange } from "./schemas";

/**
 * Validation result type
 */
type ValidationResult =
	| { success: true; data: DateRange }
	| { success: false; error: NextResponse };

/**
 * Validate start and end date query parameters
 */
export function validateDateRange(
	start: string | null,
	end: string | null,
): ValidationResult {
	if (!start) {
		return {
			success: false,
			error: NextResponse.json(
				{ error: "Missing required query parameter 'start'" },
				{ status: 400 },
			),
		};
	}

	if (!end) {
		return {
			success: false,
			error: NextResponse.json(
				{ error: "Missing required query parameter 'end'" },
				{ status: 400 },
			),
		};
	}

	const startDate = new Date(start);
	const endDate = new Date(end);

	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		return {
			success: false,
			error: NextResponse.json(
				{ error: "Invalid date format. Use ISO-8601 (YYYY-MM-DDTHH:mm:ssZ)" },
				{ status: 400 },
			),
		};
	}

	if (startDate > endDate) {
		return {
			success: false,
			error: NextResponse.json(
				{ error: "Start date cannot be after end date" },
				{ status: 400 },
			),
		};
	}

	return { success: true, data: { startDate, endDate } };
}

/**
 * Calculate previous period dates for comparison
 * The previous period has the same duration and ends when the current period starts
 */
export function calculatePreviousPeriod(
	startDate: Date,
	endDate: Date,
): PeriodComparison {
	const durationMs = endDate.getTime() - startDate.getTime();
	const prevEnd = new Date(startDate.getTime());
	const prevStart = new Date(startDate.getTime() - durationMs);

	return { startDate, endDate, prevStart, prevEnd };
}

/**
 * Helper to extract date params from request URL
 */
export function getDateParamsFromUrl(request: Request): {
	start: string | null;
	end: string | null;
} {
	const { searchParams } = new URL(request.url);
	return {
		start: searchParams.get("start"),
		end: searchParams.get("end"),
	};
}

/**
 * Combined validation and period calculation
 */
export function validateAndCalculatePeriod(
	request: Request,
):
	| { success: true; data: PeriodComparison }
	| { success: false; error: NextResponse } {
	const { start, end } = getDateParamsFromUrl(request);
	const validation = validateDateRange(start, end);

	if (!validation.success) {
		return validation;
	}

	const { startDate, endDate } = validation.data;
	const periodData = calculatePreviousPeriod(startDate, endDate);

	return { success: true, data: periodData };
}

/**
 * Zod-based validation (recommended for new routes)
 * Provides better error messages and type safety
 */
export function validateWithZod(
	request: Request,
):
	| { success: true; data: PeriodComparison }
	| { success: false; error: NextResponse } {
	const result = parseQueryParams(request, dateRangeSchema);

	if (!result.success) {
		const errorMessage = result.error.issues.map((e) => e.message).join(", ");
		return {
			success: false,
			error: NextResponse.json({ error: errorMessage }, { status: 400 }),
		};
	}

	const { startDate, endDate } = toDateRange(result.data);
	const periodData = calculatePreviousPeriod(startDate, endDate);

	return { success: true, data: periodData };
}
