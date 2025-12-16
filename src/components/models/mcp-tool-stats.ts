export interface McpToolStatsTable {
	toolName: string;
	serverName: string;
	callCount: number;
	uniqueUsers: number;
	uniqueConversations: number;
}

export interface McpToolStatsChartEntry {
	toolName: string;
	serverName: string;
	date: string;
	callCount: number;
}

export interface McpToolStatsChartResponse {
	data: McpToolStatsChartEntry[];
	granularity: "hour" | "day" | "month";
}
