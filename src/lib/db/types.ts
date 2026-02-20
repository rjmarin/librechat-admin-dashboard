/**
 * Common TypeScript interfaces for database documents
 */

export interface Message {
	_id?: string;
	messageId: string;
	parentMessageId?: string;
	conversationId: string;
	user: string;
	sender: string;
	model: string | null;
	endpoint: string;
	tokenCount: number;
	summaryTokenCount?: number;
	createdAt: Date;
}

export interface User {
	_id?: string;
	userId: string;
	email?: string;
	name?: string;
	createdAt: Date;
}

export interface Agent {
	_id?: string;
	id: string;
	name: string;
	model: string;
	provider: string;
	createdAt: Date;
}

/**
 * Query result types
 */

export interface DateRange {
	startDate: Date;
	endDate: Date;
}

export interface PeriodComparison extends DateRange {
	prevStart: Date;
	prevEnd: Date;
}

export interface ActiveUsersResult {
	currentActiveUsers: number | null;
	prevActiveUsers: number | null;
}

export interface ConversationsResult {
	currentConversations: number | null;
	prevConversations: number | null;
}

export interface UserBehaviorEntry {
	userId: string;
	userName?: string;
	email?: string;
	messageCount: number;
	conversationCount: number;
	mcpToolCallCount: number;
	webSearchCount: number;
	aiErrorCount?: number;
	lastActivityAt: Date;
}

export interface UserMcpToolUsageEntry {
	toolName: string;
	serverName: string;
	count: number;
}

export interface UserRecentActivityEntry {
	messageId: string;
	conversationId: string;
	sender: string;
	model: string | null;
	endpoint: string;
	textPreview: string;
	createdAt: Date;
	hasAiError: boolean;
}

export interface UserBehaviorDetail {
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
	lastActivityAt: Date | null;
	topMcpTools: UserMcpToolUsageEntry[];
	recentActivities: UserRecentActivityEntry[];
}

export interface McpToolCallsResult {
	currentMcpToolCalls: number | null;
	prevMcpToolCalls: number | null;
}

export interface TokenCountResult {
	currentInputToken: number | null;
	currentOutputToken: number | null;
	prevInputToken: number | null;
	prevOutputToken: number | null;
}

export interface MessageStatsResult {
	totalMessages: number | null;
	totalTokenCount: number | null;
	totalSummaryTokenCount: number | null;
	prevTotalMessages: number | null;
	prevTotalTokenCount: number | null;
	prevTotalSummaryTokenCount: number | null;
}

export interface HeatMapEntry {
	dayOfWeek: number;
	timeSlot: number;
	totalRequests: number;
}

export interface ModelUsageEntry {
	_id: string;
	totalTokenCount: number;
	models: Array<{
		name: string;
		tokenCount: number;
		agentName?: string;
	}>;
}

export interface StatsTableEntry {
	model: string;
	endpoint: string;
	agentName?: string;
	totalInputToken: number;
	totalOutputToken: number;
	requests: number;
	tokenMedian?: number;
	avg?: number;
}

export interface TimeSeriesEntry {
	model?: string;
	agentId?: string;
	agentName?: string;
	endpoint: string;
	day?: string;
	hour?: string;
	month?: string;
	totalInputToken: number;
	totalOutputToken: number;
	requests: number;
}

/**
 * Aggregation granularity for time series data
 */
export type TimeGranularity = "hour" | "day" | "month";

/**
 * Pipeline builder options
 */
export interface TimeSeriesOptions {
	startDate: Date;
	endDate: Date;
	granularity: TimeGranularity;
	modelOrAgent: string;
	isAgent?: boolean;
}
