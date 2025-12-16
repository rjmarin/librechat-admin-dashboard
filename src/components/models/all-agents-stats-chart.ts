export interface AllAgentsStatsChart {
	totalInputToken: number;
	totalOutputToken: number;
	requests: number;
	agentId: string;
	hour?: string;
	day?: string;
	month?: string;
}
