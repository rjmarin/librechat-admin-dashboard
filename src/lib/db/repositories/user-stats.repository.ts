/**
 * User Statistics Repository
 *
 * Handles queries related to user counts and activity metrics.
 */

import { Collections, getCollection } from "../connection";
import type {
	ActiveUsersResult,
	ConversationsResult,
	PeriodComparison,
	UserBehaviorDetail,
	UserBehaviorEntry,
	UserMcpToolUsageEntry,
	UserRecentActivityEntry,
} from "../types";

const MCP_DELIMITER = "(_mcp_|::)";
const AI_ERROR_REGEX =
	"(error|failed|failure|timed out|rate limit|unavailable)";

/**
 * Get count of unique active users in a date range with period comparison
 */
export async function getActiveUsers(
	params: PeriodComparison,
): Promise<ActiveUsersResult[]> {
	const { startDate, endDate, prevStart, prevEnd } = params;
	const collection = await getCollection(Collections.MESSAGES);

	const pipeline = [
		{
			$facet: {
				current: [
					{ $match: { createdAt: { $gte: startDate, $lte: endDate } } },
					{ $group: { _id: "$user" } },
					{ $count: "activeUserCount" },
				],
				prev: [
					{ $match: { createdAt: { $gte: prevStart, $lte: prevEnd } } },
					{ $group: { _id: "$user" } },
					{ $count: "activeUserCount" },
				],
			},
		},
		{
			$project: {
				currentActiveUsers: {
					$ifNull: [{ $arrayElemAt: ["$current.activeUserCount", 0] }, 0],
				},
				prevActiveUsers: {
					$ifNull: [{ $arrayElemAt: ["$prev.activeUserCount", 0] }, 0],
				},
			},
		},
	];

	return collection.aggregate<ActiveUsersResult>(pipeline).toArray();
}

/**
 * Get count of unique conversations in a date range with period comparison
 */
export async function getConversations(
	params: PeriodComparison,
): Promise<ConversationsResult[]> {
	const { startDate, endDate, prevStart, prevEnd } = params;
	const collection = await getCollection(Collections.MESSAGES);

	const pipeline = [
		{
			$facet: {
				current: [
					{ $match: { createdAt: { $gte: startDate, $lte: endDate } } },
					{ $group: { _id: "$conversationId" } },
					{ $count: "conversationCount" },
				],
				prev: [
					{ $match: { createdAt: { $gte: prevStart, $lte: prevEnd } } },
					{ $group: { _id: "$conversationId" } },
					{ $count: "conversationCount" },
				],
			},
		},
		{
			$project: {
				currentConversations: {
					$ifNull: [{ $arrayElemAt: ["$current.conversationCount", 0] }, 0],
				},
				prevConversations: {
					$ifNull: [{ $arrayElemAt: ["$prev.conversationCount", 0] }, 0],
				},
			},
		},
	];

	return collection.aggregate<ConversationsResult>(pipeline).toArray();
}

/**
 * Get total user count from users collection
 */
export async function getTotalUserCount(): Promise<number> {
	const collection = await getCollection(Collections.USERS);
	return collection.countDocuments();
}

/**
 * Get per-user behavior metrics for a date range
 */
export async function getUserBehaviorStats(params: {
	startDate: Date;
	endDate: Date;
}): Promise<UserBehaviorEntry[]> {
	const { startDate, endDate } = params;
	const collection = await getCollection(Collections.MESSAGES);

	const pipeline = [
		{
			$match: {
				createdAt: { $gte: startDate, $lte: endDate },
			},
		},
		{
			$addFields: {
				toolCallsInMessage: {
					$filter: {
						input: {
							$cond: [{ $isArray: "$content" }, "$content", []],
						},
						as: "contentItem",
						cond: { $eq: ["$$contentItem.type", "tool_call"] },
					},
				},
			},
		},
		{
			$addFields: {
				mcpToolCallsInMessage: {
					$size: {
						$filter: {
							input: "$toolCallsInMessage",
							as: "toolCallItem",
							cond: {
								$regexMatch: {
									input: { $ifNull: ["$$toolCallItem.tool_call.name", ""] },
									regex: MCP_DELIMITER,
								},
							},
						},
					},
				},
				webSearchCallsInMessage: {
					$size: {
						$filter: {
							input: "$toolCallsInMessage",
							as: "toolCallItem",
							cond: {
								$regexMatch: {
									input: { $ifNull: ["$$toolCallItem.tool_call.name", ""] },
									regex: "web_search",
									options: "i",
								},
							},
						},
					},
				},
				errorItemsInMessage: {
					$filter: {
						input: {
							$cond: [{ $isArray: "$content" }, "$content", []],
						},
						as: "contentItem",
						cond: { $eq: ["$$contentItem.type", "error"] },
					},
				},
			},
		},
		{
			$group: {
				_id: "$user",
				messageCount: { $sum: 1 },
				conversations: { $addToSet: "$conversationId" },
				mcpToolCallCount: { $sum: "$mcpToolCallsInMessage" },
				webSearchCount: { $sum: "$webSearchCallsInMessage" },
				aiErrorCount: {
					$sum: {
						$cond: [
							{
								$and: [
									{ $eq: ["$sender", "assistant"] },
									{
										$or: [
											{
												$regexMatch: {
													input: { $ifNull: ["$text", ""] },
													regex: AI_ERROR_REGEX,
													options: "i",
												},
											},
											{ $gt: [{ $size: "$errorItemsInMessage" }, 0] },
										],
									},
								],
							},
							1,
							0,
						],
					},
				},
				lastActivityAt: { $max: "$createdAt" },
			},
		},
		{
			$lookup: {
				from: Collections.USERS,
				let: { targetUserId: "$_id" },
				pipeline: [
					{ $match: { $expr: { $eq: ["$userId", "$$targetUserId"] } } },
					{ $project: { _id: 0, name: 1, email: 1, username: 1 } },
					{ $limit: 1 },
				],
				as: "userProfile",
			},
		},
		{
			$project: {
				_id: 0,
				userId: { $ifNull: ["$_id", "unknown"] },
				userName: {
					$ifNull: [
						{ $arrayElemAt: ["$userProfile.name", 0] },
						{ $arrayElemAt: ["$userProfile.username", 0] },
					],
				},
				email: { $arrayElemAt: ["$userProfile.email", 0] },
				messageCount: 1,
				conversationCount: { $size: "$conversations" },
				mcpToolCallCount: 1,
				webSearchCount: 1,
				aiErrorCount: 1,
				lastActivityAt: 1,
			},
		},
		{
			$sort: { messageCount: -1, lastActivityAt: -1 },
		},
	];

	return collection.aggregate<UserBehaviorEntry>(pipeline).toArray();
}

/**
 * Get deep-dive metrics for a specific user
 */
export async function getUserBehaviorDetail(params: {
	userId: string;
	startDate: Date;
	endDate: Date;
}): Promise<UserBehaviorDetail | null> {
	const { userId, startDate, endDate } = params;
	const collection = await getCollection(Collections.MESSAGES);

	const summaryPipeline = [
		{
			$match: {
				user: userId,
				createdAt: { $gte: startDate, $lte: endDate },
			},
		},
		{
			$addFields: {
				toolCallsInMessage: {
					$filter: {
						input: {
							$cond: [{ $isArray: "$content" }, "$content", []],
						},
						as: "contentItem",
						cond: { $eq: ["$$contentItem.type", "tool_call"] },
					},
				},
				errorItemsInMessage: {
					$filter: {
						input: {
							$cond: [{ $isArray: "$content" }, "$content", []],
						},
						as: "contentItem",
						cond: { $eq: ["$$contentItem.type", "error"] },
					},
				},
			},
		},
		{
			$addFields: {
				mcpToolCallsInMessage: {
					$size: {
						$filter: {
							input: "$toolCallsInMessage",
							as: "toolCallItem",
							cond: {
								$regexMatch: {
									input: { $ifNull: ["$$toolCallItem.tool_call.name", ""] },
									regex: MCP_DELIMITER,
								},
							},
						},
					},
				},
				webSearchCallsInMessage: {
					$size: {
						$filter: {
							input: "$toolCallsInMessage",
							as: "toolCallItem",
							cond: {
								$regexMatch: {
									input: { $ifNull: ["$$toolCallItem.tool_call.name", ""] },
									regex: "web_search",
									options: "i",
								},
							},
						},
					},
				},
				hasAiError: {
					$and: [
						{ $eq: ["$sender", "assistant"] },
						{
							$or: [
								{
									$regexMatch: {
										input: { $ifNull: ["$text", ""] },
										regex: AI_ERROR_REGEX,
										options: "i",
									},
								},
								{ $gt: [{ $size: "$errorItemsInMessage" }, 0] },
							],
						},
					],
				},
			},
		},
		{
			$group: {
				_id: "$user",
				messageCount: { $sum: 1 },
				conversations: { $addToSet: "$conversationId" },
				userMessageCount: {
					$sum: {
						$cond: [{ $eq: ["$sender", "user"] }, 1, 0],
					},
				},
				assistantMessageCount: {
					$sum: {
						$cond: [{ $eq: ["$sender", "assistant"] }, 1, 0],
					},
				},
				mcpToolCallCount: { $sum: "$mcpToolCallsInMessage" },
				webSearchCount: { $sum: "$webSearchCallsInMessage" },
				aiErrorCount: {
					$sum: {
						$cond: ["$hasAiError", 1, 0],
					},
				},
				lastActivityAt: { $max: "$createdAt" },
			},
		},
		{
			$lookup: {
				from: Collections.USERS,
				let: { targetUserId: "$_id" },
				pipeline: [
					{ $match: { $expr: { $eq: ["$userId", "$$targetUserId"] } } },
					{ $project: { _id: 0, name: 1, email: 1, username: 1 } },
					{ $limit: 1 },
				],
				as: "userProfile",
			},
		},
		{
			$project: {
				_id: 0,
				userId: { $ifNull: ["$_id", userId] },
				userName: {
					$ifNull: [
						{ $arrayElemAt: ["$userProfile.name", 0] },
						{ $arrayElemAt: ["$userProfile.username", 0] },
					],
				},
				email: { $arrayElemAt: ["$userProfile.email", 0] },
				messageCount: 1,
				conversationCount: { $size: "$conversations" },
				userMessageCount: 1,
				assistantMessageCount: 1,
				mcpToolCallCount: 1,
				webSearchCount: 1,
				aiErrorCount: 1,
				lastActivityAt: 1,
			},
		},
	];

	const topMcpToolsPipeline = [
		{
			$match: {
				user: userId,
				createdAt: { $gte: startDate, $lte: endDate },
				"content.type": "tool_call",
			},
		},
		{ $unwind: "$content" },
		{ $match: { "content.type": "tool_call" } },
		{
			$match: {
				"content.tool_call.name": { $regex: MCP_DELIMITER },
			},
		},
		{
			$addFields: {
				toolId: "$content.tool_call.name",
				delimiter: {
					$cond: {
						if: {
							$regexMatch: { input: "$content.tool_call.name", regex: "::" },
						},
						then: "::",
						else: "_mcp_",
					},
				},
			},
		},
		{
			$addFields: {
				parts: { $split: ["$toolId", "$delimiter"] },
			},
		},
		{
			$group: {
				_id: {
					toolName: { $arrayElemAt: ["$parts", 0] },
					serverName: { $arrayElemAt: ["$parts", 1] },
				},
				count: { $sum: 1 },
			},
		},
		{
			$project: {
				_id: 0,
				toolName: "$_id.toolName",
				serverName: "$_id.serverName",
				count: 1,
			},
		},
		{ $sort: { count: -1 } },
		{ $limit: 10 },
	];

	const recentActivitiesPipeline = [
		{
			$match: {
				user: userId,
				createdAt: { $gte: startDate, $lte: endDate },
			},
		},
		{
			$addFields: {
				errorItemsInMessage: {
					$filter: {
						input: {
							$cond: [{ $isArray: "$content" }, "$content", []],
						},
						as: "contentItem",
						cond: { $eq: ["$$contentItem.type", "error"] },
					},
				},
				hasAiError: {
					$and: [
						{ $eq: ["$sender", "assistant"] },
						{
							$or: [
								{
									$regexMatch: {
										input: { $ifNull: ["$text", ""] },
										regex: AI_ERROR_REGEX,
										options: "i",
									},
								},
								{ $gt: [{ $size: "$errorItemsInMessage" }, 0] },
							],
						},
					],
				},
			},
		},
		{
			$project: {
				_id: 0,
				messageId: { $ifNull: ["$messageId", ""] },
				conversationId: { $ifNull: ["$conversationId", ""] },
				sender: { $ifNull: ["$sender", "unknown"] },
				model: "$model",
				endpoint: { $ifNull: ["$endpoint", "unknown"] },
				textPreview: {
					$substrCP: [{ $ifNull: ["$text", ""] }, 0, 180],
				},
				createdAt: "$createdAt",
				hasAiError: "$hasAiError",
			},
		},
		{ $sort: { createdAt: -1 } },
		{ $limit: 25 },
	];

	const [summary, topMcpTools, recentActivities] = await Promise.all([
		collection.aggregate<UserBehaviorDetail>(summaryPipeline).toArray(),
		collection.aggregate<UserMcpToolUsageEntry>(topMcpToolsPipeline).toArray(),
		collection
			.aggregate<UserRecentActivityEntry>(recentActivitiesPipeline)
			.toArray(),
	]);

	if (!summary[0]) {
		return null;
	}

	return {
		...summary[0],
		topMcpTools,
		recentActivities,
	};
}
