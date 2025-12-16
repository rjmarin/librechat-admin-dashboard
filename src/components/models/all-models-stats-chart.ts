export interface AllModelsStatsChart {
	model: string;
	endpoint: string;
	requests: number;
	totalInputToken: number;
	totalOutputToken: number;
	hour?: string;
	day?: string;
	month?: string;
}
