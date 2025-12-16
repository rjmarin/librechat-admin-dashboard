import { atom } from "jotai";
import type { AllAgentsStatsTable } from "@/components/models/all-agents-stats-table";
import { dateRangeAtom } from "./date-range-atom";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL_NODE || "/api";

export const allAgentsStatsTableAtom = atom(async (get) => {
	const timeArea = get(dateRangeAtom);
	const res = await fetch(
		`${API_BASE}/all-agents-stats-table?start=${timeArea?.startDate?.toISOString()}&end=${timeArea?.endDate?.toISOString()}`,
	);
	const data: AllAgentsStatsTable[] = await res.json();
	return data;
});
