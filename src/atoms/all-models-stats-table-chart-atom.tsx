import { atom } from "jotai";
import { atomFamily } from "jotai/utils";
import type { AllModelsStatsChart } from "@/components/models/all-models-stats-chart";
import { timeMap } from "@/components/utils/time-map";
import { API_BASE } from "@/lib/utils/api-base";
import { createDateQueryParams } from "./date-query-params";
import { dateRangeAtom } from "./date-range-atom";

export const allModelsStatsTableChartAtom = atomFamily((model: string) =>
	atom(async (get) => {
		const timeArea = get(dateRangeAtom);
		const time = timeMap(timeArea);
		const params = createDateQueryParams(timeArea);
		params.set("groupRange", time);
		params.set("model", model);
		params.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);

		const res = await fetch(
			`${API_BASE}/all-models-stats-table-chart?${params}`,
			{
				credentials: "include",
			},
		);
		if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

		const rawData: unknown = await res.json();
		const data: AllModelsStatsChart[] = Array.isArray(rawData) ? rawData : [];
		return data;
	}),
);
