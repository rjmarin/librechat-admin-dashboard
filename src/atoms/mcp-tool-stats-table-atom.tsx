import { atom } from "jotai";
import type { McpToolStatsTable } from "@/components/models/mcp-tool-stats";
import { API_BASE } from "@/lib/utils/api-base";
import { createDateQueryParams } from "./date-query-params";
import { dateRangeAtom } from "./date-range-atom";

export const mcpToolStatsTableAtom = atom<Promise<McpToolStatsTable[]>>(
	async (get) => {
		const dateRange = get(dateRangeAtom);
		const params = createDateQueryParams(dateRange);

		const response = await fetch(`${API_BASE}/mcp-tool-stats-table?${params}`, {
			credentials: "include",
		});
		if (!response.ok) {
			throw new Error("Failed to fetch MCP tool stats table");
		}
		const rawData: unknown = await response.json();
		return Array.isArray(rawData) ? rawData : [];
	},
);
