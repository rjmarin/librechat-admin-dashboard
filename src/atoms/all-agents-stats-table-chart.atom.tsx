import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { AllAgentsStatsChart } from "@/components/models/all-agents-stats-chart";
import { timeMap } from "@/components/utils/time-map";
import { dateRangeAtom } from "./date-range-atom";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL_NODE || "/api";

export const allAgentsStatsTableChartAtom = atomFamily((agent: string) =>
	atom(async (get) => {
		const timeArea = get(dateRangeAtom);
		const time = timeMap(timeArea);
		const res = await fetch(
			`${API_BASE}/all-agents-stats-table-chart?groupRange=${time}&agent=${encodeURIComponent(agent)}&start=${timeArea?.startDate?.toISOString()}&end=${timeArea?.endDate?.toISOString()}`,
		);
		const data: AllAgentsStatsChart[] = await res.json();
		return data;
	}),
);
