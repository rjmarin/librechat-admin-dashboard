export interface ProviderWithModelUsage {
	_id: string;
	totalTokenCount: number;
	models: ModelUsage[];
}

interface ModelUsage {
	name: string;
	tokenCount: number;
	agentName?: string;
}
