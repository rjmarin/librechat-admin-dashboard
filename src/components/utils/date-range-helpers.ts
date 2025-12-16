/**
 * Date range helper utilities for dashboard components
 *
 * Provides functions to detect and format date range presets
 */

import {
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	startOfDay,
	startOfMonth,
	startOfWeek,
	subMonths,
	subWeeks,
} from "date-fns";
import { de } from "date-fns/locale";

/**
 * Determine the preset type for a given date range
 */
export type DateRangePreset =
	| "today"
	| "yesterday"
	| "thisWeek"
	| "lastWeek"
	| "thisMonth"
	| "lastMonth"
	| "thisYear"
	| "lastYear"
	| "custom";

/**
 * Check if date range matches "today"
 */
export function isToday(startDate: Date | null, endDate: Date | null): boolean {
	if (!startDate || !endDate) return false;
	const today = new Date();
	const start = new Date(startDate);
	const end = new Date(endDate);
	return (
		start.getDate() === today.getDate() &&
		start.getMonth() === today.getMonth() &&
		start.getFullYear() === today.getFullYear() &&
		end.getDate() === today.getDate()
	);
}

/**
 * Check if date range matches "yesterday"
 */
export function isYesterday(
	startDate: Date | null,
	endDate: Date | null,
): boolean {
	if (!startDate || !endDate) return false;
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const start = new Date(startDate);
	const end = new Date(endDate);
	return (
		start.getDate() === yesterday.getDate() &&
		start.getMonth() === yesterday.getMonth() &&
		start.getFullYear() === yesterday.getFullYear() &&
		end.getDate() === yesterday.getDate()
	);
}

/**
 * Check if date range matches "this week"
 */
export function isThisWeek(
	startDate: Date | null,
	endDate: Date | null,
): boolean {
	if (!startDate || !endDate) return false;
	const today = new Date();
	const weekStart = startOfWeek(today, { weekStartsOn: 1 });
	const start = new Date(startDate);
	return isSameDay(startOfDay(start), startOfDay(weekStart));
}

/**
 * Check if date range matches "last week"
 */
export function isLastWeek(
	startDate: Date | null,
	endDate: Date | null,
): boolean {
	if (!startDate || !endDate) return false;
	const lastWeekDate = subWeeks(new Date(), 1);
	const weekStart = startOfWeek(lastWeekDate, { weekStartsOn: 1 });
	const weekEnd = endOfWeek(lastWeekDate, { weekStartsOn: 1 });
	const start = new Date(startDate);
	const end = new Date(endDate);
	return (
		isSameDay(startOfDay(start), startOfDay(weekStart)) &&
		isSameDay(startOfDay(end), startOfDay(weekEnd))
	);
}

/**
 * Check if date range matches "this month"
 */
export function isThisMonth(
	startDate: Date | null,
	endDate: Date | null,
): boolean {
	if (!startDate || !endDate) return false;
	const today = new Date();
	const start = new Date(startDate);
	return (
		start.getDate() === 1 &&
		start.getMonth() === today.getMonth() &&
		start.getFullYear() === today.getFullYear()
	);
}

/**
 * Check if date range matches "last month"
 */
export function isLastMonth(
	startDate: Date | null,
	endDate: Date | null,
): boolean {
	if (!startDate || !endDate) return false;
	const prevMonth = subMonths(new Date(), 1);
	const monthStart = startOfMonth(prevMonth);
	const monthEnd = endOfMonth(prevMonth);
	const start = new Date(startDate);
	const end = new Date(endDate);
	return (
		isSameDay(startOfDay(start), startOfDay(monthStart)) &&
		isSameDay(startOfDay(end), startOfDay(monthEnd))
	);
}

/**
 * Check if date range matches "this year"
 */
export function isThisYear(
	startDate: Date | null,
	endDate: Date | null,
): boolean {
	if (!startDate || !endDate) return false;
	const today = new Date();
	const start = new Date(startDate);
	return (
		start.getDate() === 1 &&
		start.getMonth() === 0 &&
		start.getFullYear() === today.getFullYear()
	);
}

/**
 * Check if date range matches "last year"
 */
export function isLastYear(
	startDate: Date | null,
	endDate: Date | null,
): boolean {
	if (!startDate || !endDate) return false;
	const lastYear = new Date().getFullYear() - 1;
	const start = new Date(startDate);
	const end = new Date(endDate);
	return (
		start.getDate() === 1 &&
		start.getMonth() === 0 &&
		start.getFullYear() === lastYear &&
		end.getMonth() === 11 &&
		end.getDate() === 31 &&
		end.getFullYear() === lastYear
	);
}

/**
 * Detect which preset a date range matches
 */
export function detectDateRangePreset(
	startDate: Date | null,
	endDate: Date | null,
): DateRangePreset {
	if (isToday(startDate, endDate)) return "today";
	if (isYesterday(startDate, endDate)) return "yesterday";
	if (isThisWeek(startDate, endDate)) return "thisWeek";
	if (isLastWeek(startDate, endDate)) return "lastWeek";
	if (isThisMonth(startDate, endDate)) return "thisMonth";
	if (isLastMonth(startDate, endDate)) return "lastMonth";
	if (isThisYear(startDate, endDate)) return "thisYear";
	if (isLastYear(startDate, endDate)) return "lastYear";
	return "custom";
}

/**
 * Get a human-readable time range string for card titles
 * Returns the time range as a subtitle (e.g., "01.12. - 15.12.2025")
 */
export function getDateRangeLabel(
	startDate: Date | null,
	endDate: Date | null,
): string {
	if (!startDate || !endDate) return "";

	const preset = detectDateRangePreset(startDate, endDate);

	// For presets, show the actual date range
	switch (preset) {
		case "today":
			return format(startDate, "dd.MM.yyyy", { locale: de });
		case "yesterday":
			return format(startDate, "dd.MM.yyyy", { locale: de });
		case "thisWeek":
		case "lastWeek":
		case "thisMonth":
		case "lastMonth":
		case "thisYear":
		case "lastYear":
		case "custom": {
			// Show full range
			const startFormatted = format(startDate, "dd.MM.", { locale: de });
			const endFormatted = format(endDate, "dd.MM.yyyy", { locale: de });
			return `${startFormatted} - ${endFormatted}`;
		}
	}
}

/**
 * Get granularity for heatmap based on date range
 */
export type HeatmapGranularity = "hourly" | "daily" | "weekly" | "monthly";

export function getHeatmapGranularity(
	startDate: Date | null,
	endDate: Date | null,
): HeatmapGranularity {
	if (!startDate || !endDate) return "daily";

	const diffMs = endDate.getTime() - startDate.getTime();
	const diffDays = diffMs / (1000 * 60 * 60 * 24);

	if (diffDays <= 1) {
		// Today, Yesterday: Show hours (0-24h)
		return "hourly";
	} else if (diffDays <= 7) {
		// This Week, Last Week: Show days with hours
		return "daily";
	} else if (diffDays <= 31) {
		// This Month, Last Month: Show days
		return "daily";
	} else if (diffDays <= 365) {
		// This Year, custom ranges: Show weeks
		return "weekly";
	} else {
		// Multi-year: Show months
		return "monthly";
	}
}
