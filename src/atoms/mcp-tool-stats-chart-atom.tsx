import { atom } from "jotai";
import type { McpToolStatsChartResponse } from "@/components/models/mcp-tool-stats";
import { dateRangeAtom } from "./date-range-atom";

export const mcpToolStatsChartAtom = atom<Promise<McpToolStatsChartResponse>>(
	async (get) => {
		const dateRange = get(dateRangeAtom);
		const params = new URLSearchParams({
			startDate: dateRange.startDate?.toISOString() ?? "",
			endDate: dateRange.endDate?.toISOString() ?? "",
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		});

		const response = await fetch(`/api/mcp-tool-stats-chart?${params}`);
		if (!response.ok) {
			throw new Error("Failed to fetch MCP tool stats chart");
		}
		return response.json();
	},
);
