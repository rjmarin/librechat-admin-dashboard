import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { AllAgentsStatsChart } from "@/components/models/all-agents-stats-chart";
import { timeMap } from "@/components/utils/time-map";
import { API_BASE } from "@/lib/utils/api-base";
import { dateRangeAtom } from "./date-range-atom";

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
