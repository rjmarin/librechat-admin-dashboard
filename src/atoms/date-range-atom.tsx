import { endOfDay, startOfDay, startOfWeek } from "date-fns";
import { atom } from "jotai";
import type { DateRange } from "@/components/models/date-range";

const DATE_RANGE_STORAGE_KEY = "dashboard-date-range";

// Validate if a date is valid
const isValidDate = (date: Date | null): date is Date => {
	return date instanceof Date && !Number.isNaN(date.getTime());
};

// Get default date range
const getDefaultDateRange = (): DateRange => {
	const initialEnd = new Date();
	const initialStart = startOfWeek(initialEnd, { weekStartsOn: 1 });
	return {
		startDate: startOfDay(initialStart),
		endDate: endOfDay(initialEnd),
	};
};

// Load from localStorage if available
const getInitialDateRange = (): DateRange => {
	if (typeof window !== "undefined") {
		const stored = localStorage.getItem(DATE_RANGE_STORAGE_KEY);
		if (stored) {
			try {
				const parsed = JSON.parse(stored);
				const startDate = parsed.startDate ? new Date(parsed.startDate) : null;
				const endDate = parsed.endDate ? new Date(parsed.endDate) : null;

				// Validate both dates - if either is invalid, return default range
				if (!isValidDate(startDate) || !isValidDate(endDate)) {
					// Clear invalid data from localStorage
					localStorage.removeItem(DATE_RANGE_STORAGE_KEY);
					return getDefaultDateRange();
				}

				// Validate that startDate is not after endDate
				if (startDate > endDate) {
					localStorage.removeItem(DATE_RANGE_STORAGE_KEY);
					return getDefaultDateRange();
				}

				return { startDate, endDate };
			} catch {
				// Clear corrupted data from localStorage
				localStorage.removeItem(DATE_RANGE_STORAGE_KEY);
			}
		}
	}

	return getDefaultDateRange();
};

const baseDateRangeAtom = atom<DateRange>(getInitialDateRange());

export const dateRangeAtom = atom(
	(get) => get(baseDateRangeAtom),
	(get, set, update: DateRange | ((prev: DateRange) => DateRange)) => {
		const prevValue = get(baseDateRangeAtom);
		const newValue =
			typeof update === "function"
				? (update as (prev: DateRange) => DateRange)(prevValue)
				: update;

		// Validate the new dates before setting
		const startDate = newValue.startDate;
		const endDate = newValue.endDate;

		// If either date is invalid, don't update
		if (startDate && !isValidDate(startDate)) {
			console.warn("Invalid start date provided, ignoring update");
			return;
		}
		if (endDate && !isValidDate(endDate)) {
			console.warn("Invalid end date provided, ignoring update");
			return;
		}

		// If both dates exist and start > end, don't update
		if (startDate && endDate && startDate > endDate) {
			console.warn("Start date is after end date, ignoring update");
			return;
		}

		set(baseDateRangeAtom, newValue);
		// Save to localStorage only if we have valid dates
		if (
			typeof window !== "undefined" &&
			isValidDate(startDate) &&
			isValidDate(endDate)
		) {
			localStorage.setItem(
				DATE_RANGE_STORAGE_KEY,
				JSON.stringify({
					startDate: startDate.toISOString(),
					endDate: endDate.toISOString(),
				}),
			);
		}
	},
);
