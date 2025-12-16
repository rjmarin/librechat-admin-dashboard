import { atom } from "jotai";
import type { AllModelsStatsTable } from "@/components/models/all-models-stats-table";
import { dateRangeAtom } from "./date-range-atom";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL_NODE || "/api";

export const allModelsStatsTableAtom = atom(async (get) => {
	const timeArea = get(dateRangeAtom);
	const res = await fetch(
		`${API_BASE}/all-models-stats-table?start=${timeArea?.startDate?.toISOString()}&end=${timeArea?.endDate?.toISOString()}`,
	);
	const data: AllModelsStatsTable[] = await res.json();
	return data;
});
