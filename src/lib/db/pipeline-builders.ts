/**
 * MongoDB Aggregation Pipeline Builders
 *
 * Reusable pipeline stages to reduce code duplication
 * and improve query maintainability.
 */

import type { Document } from "mongodb";
import type { TimeGranularity } from "./types";

/**
 * Date format strings for different granularities
 */
const DATE_FORMATS: Record<TimeGranularity, string> = {
	hour: "%d, %H:00",
	day: "%Y-%m-%d",
	month: "%Y-%m",
};

/**
 * Create a date range match stage
 */
export function matchDateRange(
	startDate: Date,
	endDate: Date,
	additionalFilters: Document = {},
): Document {
	return {
		$match: {
			createdAt: { $gte: startDate, $lte: endDate },
			...additionalFilters,
		},
	};
}

/**
 * Create a projection stage with date formatting
 */
export function addTimeField(
	granularity: TimeGranularity,
	dateField = "$createdAt",
): Document {
	const fieldName = granularity; // 'hour', 'day', or 'month'
	return {
		$addFields: {
			[fieldName]: {
				$dateToString: {
					format: DATE_FORMATS[granularity],
					date: dateField,
				},
			},
		},
	};
}

/**
 * Create facet stages for current/previous period comparison
 */
export function createPeriodComparisonFacet(
	startDate: Date,
	endDate: Date,
	prevStart: Date,
	prevEnd: Date,
	aggregationStages: Document[],
): Document {
	return {
		$facet: {
			current: [
				{ $match: { createdAt: { $gte: startDate, $lte: endDate } } },
				...aggregationStages,
			],
			prev: [
				{ $match: { createdAt: { $gte: prevStart, $lte: prevEnd } } },
				...aggregationStages,
			],
		},
	};
}

/**
 * Create a lookup stage for parent messages (user input)
 */
export function lookupParentMessage(): Document[] {
	return [
		{
			$lookup: {
				from: "messages",
				localField: "parentMessageId",
				foreignField: "messageId",
				as: "parentData",
			},
		},
		{ $unwind: "$parentData" },
	];
}

/**
 * Create count aggregation stages
 */
export function createCountByField(
	field: string,
	countField = "count",
): Document[] {
	return [
		{ $group: { _id: `$${field}` } },
		{ $group: { _id: null, [countField]: { $sum: 1 } } },
		{ $project: { [countField]: 1, _id: 0 } },
	];
}

/**
 * Create token sum aggregation
 */
export function sumTokens(groupBy: Document = { _id: null }): Document {
	return {
		$group: {
			...groupBy,
			totalTokens: { $sum: "$tokenCount" },
			totalSummaryTokens: { $sum: "$summaryTokenCount" },
			messageCount: { $sum: 1 },
		},
	};
}

/**
 * Sort stage helper
 */
export function sortBy(field: string, direction: 1 | -1 = 1): Document {
	return { $sort: { [field]: direction } };
}

/**
 * Project stage to extract array element
 */
export function extractArrayElement(
	outputField: string,
	arrayField: string,
	index = 0,
): Document {
	return {
		[outputField]: { $arrayElemAt: [`$${arrayField}`, index] },
	};
}

/**
 * Create time series grouping for charts
 */
export function groupByTimeAndModel(
	granularity: TimeGranularity,
	additionalGroupFields: Document = {},
): Document {
	return {
		$group: {
			_id: {
				[granularity]: `$${granularity}`,
				model: "$model",
				endpoint: "$endpoint",
				...additionalGroupFields,
			},
			totalTokens: { $sum: "$tokenCount" },
			requests: { $sum: 1 },
		},
	};
}
