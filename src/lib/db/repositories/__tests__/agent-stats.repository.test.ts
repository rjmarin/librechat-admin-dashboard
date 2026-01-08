/**
 * Tests for Agent Statistics Repository
 */

import type { Collection, Document } from "mongodb";

// Create mock implementations
const mockToArray = jest.fn();
const mockAggregate = jest.fn().mockReturnValue({ toArray: mockToArray });
const mockCountDocuments = jest.fn();

const mockCollection: Partial<Collection> = {
	aggregate: mockAggregate,
	countDocuments: mockCountDocuments,
};

// Mock the connection module
jest.mock("../../connection", () => ({
	getCollection: jest
		.fn()
		.mockImplementation(() => Promise.resolve(mockCollection)),
	Collections: {
		TRANSACTIONS: "transactions",
		CONVERSATIONS: "conversations",
		AGENTS: "agents",
	},
}));

import {
	getAgentStatsTable,
	getAgentTimeSeries,
	getTotalAgentCount,
} from "../agent-stats.repository";

describe("Agent Stats Repository", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getTotalAgentCount", () => {
		it("should return the total count of agents", async () => {
			mockCountDocuments.mockResolvedValueOnce(15);

			const result = await getTotalAgentCount();

			expect(result).toBe(15);
			expect(mockCountDocuments).toHaveBeenCalled();
		});

		it("should return 0 when no agents exist", async () => {
			mockCountDocuments.mockResolvedValueOnce(0);

			const result = await getTotalAgentCount();

			expect(result).toBe(0);
		});
	});

	describe("getAgentStatsTable", () => {
		it("should return agent statistics for table display", async () => {
			const mockResult = [
				{
					agentId: "agent-1",
					agentName: "Research Assistant",
					model: "gpt-4",
					endpoint: "openAI",
					totalInputToken: 50000,
					totalOutputToken: 150000,
					requests: 500,
				},
			];
			mockToArray.mockResolvedValueOnce(mockResult);

			const params = {
				startDate: new Date("2024-01-01"),
				endDate: new Date("2024-01-31"),
			};

			const result = await getAgentStatsTable(params);

			expect(result).toHaveLength(1);
			expect(result[0].agentName).toBe("Research Assistant");
			expect(result[0].totalInputToken).toBe(50000);
			expect(result[0].totalOutputToken).toBe(150000);
		});

		it("should apply date filter correctly", async () => {
			mockToArray.mockResolvedValueOnce([]);

			const startDate = new Date("2024-02-01");
			const endDate = new Date("2024-02-29");

			await getAgentStatsTable({ startDate, endDate });

			const pipeline = mockAggregate.mock.calls[0][0];
			const matchStage = pipeline[0].$match;

			expect(matchStage.createdAt.$gte).toEqual(startDate);
			expect(matchStage.createdAt.$lte).toEqual(endDate);
		});

		it("should filter to agent conversations only", async () => {
			mockToArray.mockResolvedValueOnce([]);

			await getAgentStatsTable({
				startDate: new Date("2024-01-01"),
				endDate: new Date("2024-01-31"),
			});

			const pipeline = mockAggregate.mock.calls[0][0];

			// Find the $match stage that filters by endpoint
			const endpointMatchStage = pipeline.find(
				(stage: Document) =>
					"$match" in stage && stage.$match["conv.endpoint"] === "agents",
			);

			expect(endpointMatchStage).toBeDefined();
		});

		it("should lookup conversation and agent details", async () => {
			mockToArray.mockResolvedValueOnce([]);

			await getAgentStatsTable({
				startDate: new Date("2024-01-01"),
				endDate: new Date("2024-01-31"),
			});

			const pipeline = mockAggregate.mock.calls[0][0];

			// Check for conversation lookup
			const convLookup = pipeline.find(
				(stage: Document) =>
					"$lookup" in stage && stage.$lookup.from === "conversations",
			);
			expect(convLookup).toBeDefined();
			expect(convLookup.$lookup.localField).toBe("conversationId");

			// Check for agent lookup
			const agentLookup = pipeline.find(
				(stage: Document) =>
					"$lookup" in stage && stage.$lookup.from === "agents",
			);
			expect(agentLookup).toBeDefined();
			expect(agentLookup.$lookup.localField).toBe("conv.agent_id");
		});

		it("should use $abs for token amounts (LibreChat compatibility)", async () => {
			mockToArray.mockResolvedValueOnce([]);

			await getAgentStatsTable({
				startDate: new Date("2024-01-01"),
				endDate: new Date("2024-01-31"),
			});

			const pipeline = mockAggregate.mock.calls[0][0];
			const groupStage = pipeline.find((stage: Document) => "$group" in stage);

			expect(groupStage).toBeDefined();
			// The $abs is used inside $cond for rawAmount
			const groupDoc = groupStage.$group;
			expect(JSON.stringify(groupDoc.totalInputToken)).toContain("$abs");
			expect(JSON.stringify(groupDoc.totalOutputToken)).toContain("$abs");
		});

		it("should fall back to agent_id when agent name is null", async () => {
			const mockResult = [
				{
					agentId: "agent-123",
					agentName: "agent-123", // Falls back to ID
					model: "claude-3",
					endpoint: "anthropic",
					totalInputToken: 1000,
					totalOutputToken: 2000,
					requests: 10,
				},
			];
			mockToArray.mockResolvedValueOnce(mockResult);

			const result = await getAgentStatsTable({
				startDate: new Date("2024-01-01"),
				endDate: new Date("2024-01-31"),
			});

			expect(result[0].agentName).toBe("agent-123");
		});
	});

	describe("getAgentTimeSeries", () => {
		it("should return time series data for a specific agent", async () => {
			const mockResult = [
				{
					agentId: "agent-1",
					agentName: "Research Assistant",
					endpoint: "openAI",
					day: "2024-01-15",
					totalInputToken: 10000,
					totalOutputToken: 30000,
					requests: 100,
				},
			];
			mockToArray.mockResolvedValueOnce(mockResult);

			const result = await getAgentTimeSeries({
				startDate: new Date("2024-01-01"),
				endDate: new Date("2024-01-31"),
				agentName: "Research Assistant",
				granularity: "day",
			});

			expect(result).toHaveLength(1);
			expect(result[0].day).toBe("2024-01-15");
		});

		it("should use correct date format for different granularities", async () => {
			mockToArray.mockResolvedValueOnce([]);

			await getAgentTimeSeries({
				startDate: new Date("2024-01-01"),
				endDate: new Date("2024-01-31"),
				agentName: "Test Agent",
				granularity: "hour",
			});

			const pipeline = mockAggregate.mock.calls[0][0];
			const addFieldsStage = pipeline.find(
				(stage: Document) => "$addFields" in stage,
			);

			expect(addFieldsStage).toBeDefined();
			expect(addFieldsStage.$addFields.hour.$dateToString.format).toBe(
				"%d, %H:00",
			);
		});

		it("should filter by agent name or agent_id", async () => {
			mockToArray.mockResolvedValueOnce([]);

			await getAgentTimeSeries({
				startDate: new Date("2024-01-01"),
				endDate: new Date("2024-01-31"),
				agentName: "My Agent",
				granularity: "day",
			});

			const pipeline = mockAggregate.mock.calls[0][0];

			// Find the $match stage that filters by agent
			const agentMatchStage = pipeline.find(
				(stage: Document) => "$match" in stage && stage.$match.$or,
			);

			expect(agentMatchStage).toBeDefined();
			expect(agentMatchStage.$match.$or).toEqual([
				{ "agent.name": "My Agent" },
				{ "conv.agent_id": "My Agent" },
			]);
		});

		it("should apply timezone for date formatting", async () => {
			mockToArray.mockResolvedValueOnce([]);

			await getAgentTimeSeries({
				startDate: new Date("2024-01-01"),
				endDate: new Date("2024-01-31"),
				agentName: "Test Agent",
				granularity: "day",
				timezone: "Europe/Berlin",
			});

			const pipeline = mockAggregate.mock.calls[0][0];
			const addFieldsStage = pipeline.find(
				(stage: Document) => "$addFields" in stage,
			);

			expect(addFieldsStage.$addFields.day.$dateToString.timezone).toBe(
				"Europe/Berlin",
			);
		});

		it("should default timezone to UTC", async () => {
			mockToArray.mockResolvedValueOnce([]);

			await getAgentTimeSeries({
				startDate: new Date("2024-01-01"),
				endDate: new Date("2024-01-31"),
				agentName: "Test Agent",
				granularity: "day",
			});

			const pipeline = mockAggregate.mock.calls[0][0];
			const addFieldsStage = pipeline.find(
				(stage: Document) => "$addFields" in stage,
			);

			expect(addFieldsStage.$addFields.day.$dateToString.timezone).toBe("UTC");
		});

		it("should sort results by time field", async () => {
			mockToArray.mockResolvedValueOnce([]);

			await getAgentTimeSeries({
				startDate: new Date("2024-01-01"),
				endDate: new Date("2024-01-31"),
				agentName: "Test Agent",
				granularity: "month",
			});

			const pipeline = mockAggregate.mock.calls[0][0];
			const sortStage = pipeline.find((stage: Document) => "$sort" in stage);

			expect(sortStage).toBeDefined();
			expect(sortStage.$sort["_id.month"]).toBe(1);
		});
	});
});
