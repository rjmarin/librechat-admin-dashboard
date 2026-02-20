import { atom } from "jotai";
import type { AllAgentsStatsTable } from "@/components/models/all-agents-stats-table";
import { API_BASE } from "@/lib/utils/api-base";
import { createDateQueryParams } from "./date-query-params";
import { dateRangeAtom } from "./date-range-atom";

export const allAgentsStatsTableAtom = atom(async (get) => {
	const dateRange = get(dateRangeAtom);
	const params = createDateQueryParams(dateRange);
	const res = await fetch(`${API_BASE}/all-agents-stats-table?${params}`, {
		credentials: "include",
	});
	if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
	const rawData: unknown = await res.json();
	const data: AllAgentsStatsTable[] = Array.isArray(rawData) ? rawData : [];
	return data;
});
