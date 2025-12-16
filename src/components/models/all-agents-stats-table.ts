export interface AllAgentsStatsTable {
	agentId: string;
	model: string;
	endpoint: string;
	agentName: string;
	totalInputToken: number;
	totalOutputToken: number;
	requests: number;
}
