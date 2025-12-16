import { TimeArea } from "@/components/models/time-area";

export function buildTimeAreaQuery(area: TimeArea) {
	const now = new Date("2025-09-24T19:02:09.811+00:00"); //start date now last entry in db for better visualisation and testing
	let start: Date;
	const end = now;

	switch (area) {
		case TimeArea.Day:
			start = new Date(now);
			start.setDate(now.getDate() - 1);
			break;
		case TimeArea.Week:
			start = new Date(now);
			start.setDate(now.getDate() - 7);
			break;
		case TimeArea.Month:
			start = new Date(now);
			start.setMonth(now.getMonth() - 1);
			break;
		case TimeArea.Year:
			start = new Date(now);
			start.setFullYear(now.getFullYear() - 1);
	}
	const startISO = start.toISOString();
	const endISO = end.toISOString();

	return `start=${startISO}&end=${endISO}`;
}
