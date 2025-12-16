import { atom } from "jotai";
import { loadable } from "jotai/utils";
import { dateRangeAtom } from "./date-range-atom";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL_NODE || "/api";

const filesProcessedAsyncAtom = atom(async (get) => {
	const dateRange = get(dateRangeAtom);

	if (!dateRange.startDate || !dateRange.endDate) {
		return null;
	}

	const res = await fetch(
		`${API_BASE}/files-processed?start=${dateRange.startDate.toISOString()}&end=${dateRange.endDate.toISOString()}`,
	);

	if (!res.ok) {
		throw new Error("Failed to fetch files processed stats");
	}

	return res.json();
});

export const filesProcessedAtom = loadable(filesProcessedAsyncAtom);
