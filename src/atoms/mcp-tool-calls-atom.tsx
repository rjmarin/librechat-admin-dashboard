import { atom } from "jotai";
import type { McpToolCalls } from "@/components/models/mcp-tool-calls";
import { API_BASE } from "@/lib/utils/api-base";
import { createDateQueryParams } from "./date-query-params";
import { dateRangeAtom } from "./date-range-atom";

export const mcpToolCallsAtom = atom(async (get) => {
	const dateRange = get(dateRangeAtom);
	const params = createDateQueryParams(dateRange);
	const res = await fetch(`${API_BASE}/mcp-tool-calls?${params}`, {
		credentials: "include",
	});
	if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
	const data: McpToolCalls = await res.json();
	return data;
});
