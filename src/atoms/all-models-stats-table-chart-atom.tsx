import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { AllModelsStatsChart } from "@/components/models/all-models-stats-chart";
import { timeMap } from "@/components/utils/time-map";
import { dateRangeAtom } from "./date-range-atom";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL_NODE || "/api";

export const allModelsStatsTableChartAtom = atomFamily((model: string) =>
	atom(async (get) => {
		const timeArea = get(dateRangeAtom);
		const time = timeMap(timeArea);
		const res = await fetch(
			`${API_BASE}/all-models-stats-table-chart?groupRange=${time}&model=${encodeURIComponent(model)}&start=${timeArea?.startDate?.toISOString()}&end=${timeArea?.endDate?.toISOString()}`,
		);
		const data: AllModelsStatsChart[] = await res.json();
		return data;
	}),
);
