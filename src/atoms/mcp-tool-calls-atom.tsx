import { atom } from "jotai";
import type { McpToolCalls } from "@/components/models/mcp-tool-calls";
import { dateRangeAtom } from "./date-range-atom";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL_NODE || "/api";

export const mcpToolCallsAtom = atom(async (get) => {
	const dateRange = get(dateRangeAtom);
	const res = await fetch(
		`${API_BASE}/mcp-tool-calls?start=${dateRange?.startDate?.toISOString()}&end=${dateRange?.endDate?.toISOString()}`,
	);
	if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
	const data: McpToolCalls = await res.json();
	return data;
});
