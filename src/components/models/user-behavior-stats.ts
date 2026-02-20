export interface UserBehaviorStatsRow {
	userId: string;
	userName?: string;
	email?: string;
	messageCount: number;
	conversationCount: number;
	mcpToolCallCount: number;
	webSearchCount: number;
	aiErrorCount?: number;
	lastActivityAt: string;
}

export interface UserMcpToolUsageRow {
	toolName: string;
	serverName: string;
	count: number;
}

export interface UserRecentActivityRow {
	messageId: string;
	conversationId: string;
	sender: string;
	model: string | null;
	endpoint: string;
	textPreview: string;
	createdAt: string;
	hasAiError: boolean;
}

export interface UserBehaviorDetailResponse {
	userId: string;
	userName?: string;
	email?: string;
	messageCount: number;
	conversationCount: number;
	userMessageCount: number;
	assistantMessageCount: number;
	mcpToolCallCount: number;
	webSearchCount: number;
	aiErrorCount: number;
	lastActivityAt: string | null;
	topMcpTools: UserMcpToolUsageRow[];
	recentActivities: UserRecentActivityRow[];
}
