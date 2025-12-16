import { differenceInCalendarDays } from "date-fns";
import type { DateRange } from "../models/date-range";

export function timeMap(dateRange: DateRange) {
	const dayDiff = differenceInCalendarDays(
		dateRange.endDate ?? 0,
		dateRange.startDate ?? 0,
	);

	if (dayDiff <= 2) {
		return "day";
	} else if (dayDiff <= 90) {
		return "month";
	} else {
		return "year";
	}
}
