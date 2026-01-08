/**
 * Tests for File Statistics Repository
 */

import type { Collection } from "mongodb";

// Create mock implementations
const mockToArray = jest.fn();
const mockAggregate = jest.fn().mockReturnValue({ toArray: mockToArray });

const mockCollection: Partial<Collection> = {
	aggregate: mockAggregate,
};

// Mock the connection module
jest.mock("../../connection", () => ({
	getCollection: jest
		.fn()
		.mockImplementation(() => Promise.resolve(mockCollection)),
	Collections: {
		FILES: "files",
	},
}));

import { getFilesProcessedStats } from "../file-stats.repository";

describe("File Stats Repository", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe("getFilesProcessedStats", () => {
		it("should return files processed count with period comparison", async () => {
			const mockResult = [
				{
					current: 150,
					prev: 100,
				},
			];
			mockToArray.mockResolvedValueOnce(mockResult);

			const params = {
				startDate: new Date("2024-01-15"),
				endDate: new Date("2024-01-31"),
				prevStart: new Date("2024-01-01"),
				prevEnd: new Date("2024-01-15"),
			};

			const result = await getFilesProcessedStats(params);

			expect(result).toHaveLength(1);
			expect(result[0].currentInputToken).toBe(150); // current count
			expect(result[0].prevInputToken).toBe(100); // previous count
		});

		it("should apply date filter for current period", async () => {
			mockToArray.mockResolvedValueOnce([{ current: 0, prev: 0 }]);

			const startDate = new Date("2024-02-01");
			const endDate = new Date("2024-02-29");
			const prevStart = new Date("2024-01-01");
			const prevEnd = new Date("2024-02-01");

			await getFilesProcessedStats({ startDate, endDate, prevStart, prevEnd });

			const pipeline = mockAggregate.mock.calls[0][0];
			const facetStage = pipeline[0].$facet;

			// Check current period filter
			const currentMatch = facetStage.current[0].$match;
			expect(currentMatch.createdAt.$gte).toEqual(startDate);
			expect(currentMatch.createdAt.$lte).toEqual(endDate);
		});

		it("should apply date filter for previous period", async () => {
			mockToArray.mockResolvedValueOnce([{ current: 0, prev: 0 }]);

			const startDate = new Date("2024-02-01");
			const endDate = new Date("2024-02-29");
			const prevStart = new Date("2024-01-01");
			const prevEnd = new Date("2024-02-01");

			await getFilesProcessedStats({ startDate, endDate, prevStart, prevEnd });

			const pipeline = mockAggregate.mock.calls[0][0];
			const facetStage = pipeline[0].$facet;

			// Check previous period filter
			const prevMatch = facetStage.prev[0].$match;
			expect(prevMatch.createdAt.$gte).toEqual(prevStart);
			expect(prevMatch.createdAt.$lte).toEqual(prevEnd);
		});

		it("should use $facet for parallel count operations", async () => {
			mockToArray.mockResolvedValueOnce([{ current: 50, prev: 30 }]);

			await getFilesProcessedStats({
				startDate: new Date("2024-01-15"),
				endDate: new Date("2024-01-31"),
				prevStart: new Date("2024-01-01"),
				prevEnd: new Date("2024-01-15"),
			});

			const pipeline = mockAggregate.mock.calls[0][0];

			// Should use $facet for efficient parallel counting
			expect(pipeline[0].$facet).toBeDefined();
			expect(pipeline[0].$facet.current).toBeDefined();
			expect(pipeline[0].$facet.prev).toBeDefined();
		});

		it("should handle zero files in current period", async () => {
			const mockResult = [
				{
					current: 0,
					prev: 100,
				},
			];
			mockToArray.mockResolvedValueOnce(mockResult);

			const result = await getFilesProcessedStats({
				startDate: new Date("2024-01-15"),
				endDate: new Date("2024-01-31"),
				prevStart: new Date("2024-01-01"),
				prevEnd: new Date("2024-01-15"),
			});

			expect(result[0].currentInputToken).toBe(0);
			expect(result[0].prevInputToken).toBe(100);
		});

		it("should handle zero files in both periods", async () => {
			const mockResult = [
				{
					current: 0,
					prev: 0,
				},
			];
			mockToArray.mockResolvedValueOnce(mockResult);

			const result = await getFilesProcessedStats({
				startDate: new Date("2024-01-15"),
				endDate: new Date("2024-01-31"),
				prevStart: new Date("2024-01-01"),
				prevEnd: new Date("2024-01-15"),
			});

			expect(result[0].currentInputToken).toBe(0);
			expect(result[0].prevInputToken).toBe(0);
		});

		it("should use $ifNull to handle empty arrays from $facet", async () => {
			mockToArray.mockResolvedValueOnce([{ current: 0, prev: 0 }]);

			await getFilesProcessedStats({
				startDate: new Date("2024-01-15"),
				endDate: new Date("2024-01-31"),
				prevStart: new Date("2024-01-01"),
				prevEnd: new Date("2024-01-15"),
			});

			const pipeline = mockAggregate.mock.calls[0][0];
			const projectStage = pipeline[1].$project;

			// Should use $ifNull to default to 0 when no results
			expect(JSON.stringify(projectStage.current)).toContain("$ifNull");
			expect(JSON.stringify(projectStage.prev)).toContain("$ifNull");
		});

		it("should map results to TokenCountResult structure", async () => {
			const mockResult = [
				{
					current: 200,
					prev: 150,
				},
			];
			mockToArray.mockResolvedValueOnce(mockResult);

			const result = await getFilesProcessedStats({
				startDate: new Date("2024-01-15"),
				endDate: new Date("2024-01-31"),
				prevStart: new Date("2024-01-01"),
				prevEnd: new Date("2024-01-15"),
			});

			// Should return TokenCountResult compatible structure
			expect(result[0]).toHaveProperty("currentInputToken");
			expect(result[0]).toHaveProperty("prevInputToken");
			expect(result[0]).toHaveProperty("currentOutputToken");
			expect(result[0]).toHaveProperty("prevOutputToken");

			// Output tokens should be 0 for file counts
			expect(result[0].currentOutputToken).toBe(0);
			expect(result[0].prevOutputToken).toBe(0);
		});
	});
});
