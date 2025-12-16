/**
 * Tests for date validation utilities
 */

import {
	calculatePreviousPeriod,
	getDateParamsFromUrl,
	validateDateRange,
} from "../date-validation";

describe("validateDateRange", () => {
	it("should return error when start is missing", () => {
		const result = validateDateRange(null, "2024-01-31");

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.status).toBe(400);
		}
	});

	it("should return error when end is missing", () => {
		const result = validateDateRange("2024-01-01", null);

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.status).toBe(400);
		}
	});

	it("should return error for invalid date format", () => {
		const result = validateDateRange("invalid-date", "2024-01-31");

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.status).toBe(400);
		}
	});

	it("should return error when start is after end", () => {
		const result = validateDateRange("2024-01-31", "2024-01-01");

		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.status).toBe(400);
		}
	});

	it("should return valid date range for correct input", () => {
		const result = validateDateRange("2024-01-01", "2024-01-31");

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.startDate).toBeInstanceOf(Date);
			expect(result.data.endDate).toBeInstanceOf(Date);
			expect(result.data.startDate.toISOString()).toContain("2024-01-01");
			expect(result.data.endDate.toISOString()).toContain("2024-01-31");
		}
	});

	it("should accept ISO-8601 format with time", () => {
		const result = validateDateRange(
			"2024-01-01T00:00:00Z",
			"2024-01-31T23:59:59Z",
		);

		expect(result.success).toBe(true);
	});

	it("should accept same start and end date", () => {
		const result = validateDateRange("2024-01-15", "2024-01-15");

		expect(result.success).toBe(true);
	});
});

describe("calculatePreviousPeriod", () => {
	it("should calculate previous period with same duration", () => {
		const startDate = new Date("2024-01-15T00:00:00Z");
		const endDate = new Date("2024-01-31T00:00:00Z");

		const result = calculatePreviousPeriod(startDate, endDate);

		// Duration is 16 days
		const expectedPrevStart = new Date("2023-12-30T00:00:00Z");
		const expectedPrevEnd = new Date("2024-01-15T00:00:00Z");

		expect(result.prevStart.getTime()).toBe(expectedPrevStart.getTime());
		expect(result.prevEnd.getTime()).toBe(expectedPrevEnd.getTime());
		expect(result.startDate).toBe(startDate);
		expect(result.endDate).toBe(endDate);
	});

	it("should handle single day period", () => {
		const startDate = new Date("2024-01-15T00:00:00Z");
		const endDate = new Date("2024-01-15T23:59:59Z");

		const result = calculatePreviousPeriod(startDate, endDate);

		// Previous period should be almost 24 hours before
		expect(result.prevEnd.getTime()).toBe(startDate.getTime());
		expect(result.prevStart.getTime()).toBeLessThan(result.prevEnd.getTime());
	});

	it("should handle month-long period", () => {
		const startDate = new Date("2024-02-01T00:00:00Z");
		const endDate = new Date("2024-02-29T23:59:59Z"); // Leap year

		const result = calculatePreviousPeriod(startDate, endDate);

		// Previous period ends at current start
		expect(result.prevEnd.getTime()).toBe(startDate.getTime());

		// Duration should be preserved
		const currentDuration = endDate.getTime() - startDate.getTime();
		const prevDuration = result.prevEnd.getTime() - result.prevStart.getTime();
		expect(prevDuration).toBe(currentDuration);
	});
});

describe("getDateParamsFromUrl", () => {
	it("should extract start and end params from URL", () => {
		const request = new Request(
			"https://example.com/api/test?start=2024-01-01&end=2024-01-31",
		);

		const result = getDateParamsFromUrl(request);

		expect(result.start).toBe("2024-01-01");
		expect(result.end).toBe("2024-01-31");
	});

	it("should return null for missing params", () => {
		const request = new Request("https://example.com/api/test");

		const result = getDateParamsFromUrl(request);

		expect(result.start).toBeNull();
		expect(result.end).toBeNull();
	});

	it("should handle URL-encoded dates", () => {
		const request = new Request(
			"https://example.com/api/test?start=2024-01-01T00%3A00%3A00Z&end=2024-01-31T23%3A59%3A59Z",
		);

		const result = getDateParamsFromUrl(request);

		expect(result.start).toBe("2024-01-01T00:00:00Z");
		expect(result.end).toBe("2024-01-31T23:59:59Z");
	});
});
