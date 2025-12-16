export interface AllModelsStatsTable {
	model: string;
	endpoint: string;
	totalInputToken: number;
	totalOutputToken: number;
	requests: number;
}
