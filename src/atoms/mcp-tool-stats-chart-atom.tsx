import { atom } from "jotai";
import type { McpToolStatsChartResponse } from "@/components/models/mcp-tool-stats";
import { API_BASE } from "@/lib/utils/api-base";
import { createDateQueryParams } from "./date-query-params";
import { dateRangeAtom } from "./date-range-atom";

export const mcpToolStatsChartAtom = atom<Promise<McpToolStatsChartResponse>>(
	async (get) => {
		const dateRange = get(dateRangeAtom);
		const params = createDateQueryParams(dateRange);
		params.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);

		const response = await fetch(`${API_BASE}/mcp-tool-stats-chart?${params}`, {
			credentials: "include",
		});
		if (!response.ok) {
			throw new Error("Failed to fetch MCP tool stats chart");
		}
		return response.json();
	},
);
