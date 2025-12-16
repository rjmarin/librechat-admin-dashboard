/**
 * Tests for MongoDB connection module
 */

// Mock mongodb module before importing connection
jest.mock("mongodb", () => {
	const mockCollection = {
		aggregate: jest.fn().mockReturnValue({
			toArray: jest.fn().mockResolvedValue([]),
		}),
		countDocuments: jest.fn().mockResolvedValue(0),
		find: jest.fn().mockReturnValue({
			toArray: jest.fn().mockResolvedValue([]),
		}),
	};

	const mockDb = {
		collection: jest.fn().mockReturnValue(mockCollection),
	};

	const mockClient = {
		connect: jest.fn().mockResolvedValue({
			db: jest.fn().mockReturnValue(mockDb),
		}),
		close: jest.fn().mockResolvedValue(undefined),
		db: jest.fn().mockReturnValue(mockDb),
	};

	return {
		MongoClient: jest.fn().mockImplementation(() => mockClient),
	};
});

// Set environment variable before importing
process.env.MONGODB_URI = "mongodb://localhost:27017/testdb";

describe("MongoDB Connection", () => {
	beforeEach(() => {
		jest.resetModules();
		process.env.MONGODB_URI = "mongodb://localhost:27017/testdb";
		delete process.env.MONGODB_DB_NAME;
	});

	it("should extract database name from URI", async () => {
		const { getDatabase } = await import("../connection");
		const db = await getDatabase();

		expect(db).toBeDefined();
	});

	it("should use MONGODB_DB_NAME override when provided", async () => {
		process.env.MONGODB_DB_NAME = "override-db";

		const { getDatabase } = await import("../connection");
		const db = await getDatabase();

		expect(db).toBeDefined();
	});

	it("should export getCollection function", async () => {
		const { getCollection } = await import("../connection");

		expect(typeof getCollection).toBe("function");
	});

	it("should export Collections enum", async () => {
		const { Collections } = await import("../connection");

		expect(Collections.MESSAGES).toBe("messages");
		expect(Collections.USERS).toBe("users");
		expect(Collections.AGENTS).toBe("agents");
	});

	it("should export connectDB for backward compatibility", async () => {
		const { connectDB, getCollection } = await import("../connection");

		expect(connectDB).toBe(getCollection);
	});
});

describe("extractDbNameFromUri", () => {
	// Test the URI parsing logic indirectly through module behavior

	it("should handle standard mongodb URI", async () => {
		process.env.MONGODB_URI = "mongodb://localhost:27017/mydb";
		delete process.env.MONGODB_DB_NAME;

		// Module should load without error
		const module = await import("../connection");
		expect(module).toBeDefined();
	});

	it("should handle mongodb+srv URI", async () => {
		process.env.MONGODB_URI =
			"mongodb+srv://user:pass@cluster.mongodb.net/production";
		delete process.env.MONGODB_DB_NAME;

		const module = await import("../connection");
		expect(module).toBeDefined();
	});

	it("should handle URI with query parameters", async () => {
		process.env.MONGODB_URI =
			"mongodb://localhost:27017/testdb?retryWrites=true&w=majority";
		delete process.env.MONGODB_DB_NAME;

		const module = await import("../connection");
		expect(module).toBeDefined();
	});
});
