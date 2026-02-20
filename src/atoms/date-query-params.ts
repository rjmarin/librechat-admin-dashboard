import type { DateRange } from "@/components/models/date-range";

function isValidDate(date: Date | null): date is Date {
	return date instanceof Date && !Number.isNaN(date.getTime());
}

export function createDateQueryParams(dateRange: DateRange): URLSearchParams {
	if (!isValidDate(dateRange.startDate) || !isValidDate(dateRange.endDate)) {
		throw new Error("Invalid date range selected");
	}

	return new URLSearchParams({
		start: dateRange.startDate.toISOString(),
		end: dateRange.endDate.toISOString(),
	});
}
