/**
 * Tests for Authentication Routes
 */

// Define response type for our mocked NextResponse
interface MockedResponse {
	body: Record<string, unknown>;
	status: number;
	cookies: {
		set: jest.Mock;
		delete: jest.Mock;
	};
}

// Mock implementations
const mockCookiesGet = jest.fn();
const mockCookiesDelete = jest.fn();

jest.mock("next/headers", () => ({
	cookies: jest.fn().mockImplementation(() =>
		Promise.resolve({
			get: mockCookiesGet,
			delete: mockCookiesDelete,
		}),
	),
}));

// Mock NextResponse to capture JSON responses
jest.mock("next/server", () => ({
	NextResponse: {
		json: jest.fn((body, init): MockedResponse => {
			const response: MockedResponse = {
				body,
				status: init?.status || 200,
				cookies: {
					set: jest.fn(),
					delete: jest.fn(),
				},
			};
			return response;
		}),
	},
}));

describe("Auth Routes", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	describe("POST /api/auth/login", () => {
		// Dynamic import to get fresh module for each test
		const getLoginRoute = async () => {
			jest.resetModules();
			jest.mock("next/server", () => ({
				NextResponse: {
					json: jest.fn(
						(body: Record<string, unknown>, init?: { status?: number }) => ({
							body,
							status: init?.status || 200,
							cookies: { set: jest.fn(), delete: jest.fn() },
						}),
					),
				},
			}));
			return import("@/app/api/auth/login/route");
		};

		it("should return 400 if password is missing", async () => {
			const { POST } = await getLoginRoute();
			const request = new Request("http://localhost/api/auth/login", {
				method: "POST",
				body: JSON.stringify({}),
				headers: { "Content-Type": "application/json" },
			});

			const response = (await POST(request)) as unknown as MockedResponse;

			expect(response.status).toBe(400);
			expect(response.body.error).toBe("Password is required");
		});

		it("should return 400 if password is not a string", async () => {
			const { POST } = await getLoginRoute();
			const request = new Request("http://localhost/api/auth/login", {
				method: "POST",
				body: JSON.stringify({ password: 12345 }),
				headers: { "Content-Type": "application/json" },
			});

			const response = (await POST(request)) as unknown as MockedResponse;

			expect(response.status).toBe(400);
			expect(response.body.error).toBe("Password is required");
		});

		it("should return 401 for invalid password", async () => {
			const { POST } = await getLoginRoute();
			const request = new Request("http://localhost/api/auth/login", {
				method: "POST",
				body: JSON.stringify({ password: "wrong-password" }),
				headers: { "Content-Type": "application/json" },
			});

			const response = (await POST(request)) as unknown as MockedResponse;

			expect(response.status).toBe(401);
			expect(response.body.error).toBe("Invalid password");
		}, 10000);

		it("should return 200 and set session cookie for valid password", async () => {
			const originalPassword = process.env.DASHBOARD_PASSWORD;
			process.env.DASHBOARD_PASSWORD = "test-password";

			const { POST } = await getLoginRoute();
			const request = new Request("http://localhost/api/auth/login", {
				method: "POST",
				body: JSON.stringify({ password: "test-password" }),
				headers: { "Content-Type": "application/json" },
			});

			const response = (await POST(request)) as unknown as MockedResponse;

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.cookies.set).toHaveBeenCalled();

			process.env.DASHBOARD_PASSWORD = originalPassword;
		});
	});

	describe("POST /api/auth/verify", () => {
		it("should return 401 if no session cookie exists", async () => {
			mockCookiesGet.mockReturnValue(undefined);

			const { POST } = await import("@/app/api/auth/verify/route");
			const response = (await POST()) as unknown as MockedResponse;

			expect(response.status).toBe(401);
			expect(response.body.authenticated).toBe(false);
		});

		it("should return 401 if session cookie is empty", async () => {
			mockCookiesGet.mockReturnValue({ value: "" });

			const { POST } = await import("@/app/api/auth/verify/route");
			const response = (await POST()) as unknown as MockedResponse;

			expect(response.status).toBe(401);
			expect(response.body.authenticated).toBe(false);
		});

		it("should return 401 for invalid session token format", async () => {
			mockCookiesGet.mockReturnValue({ value: "invalid-token" });

			const { POST } = await import("@/app/api/auth/verify/route");
			const response = (await POST()) as unknown as MockedResponse;

			expect(response.status).toBe(401);
			expect(response.body.authenticated).toBe(false);
		});
	});

	describe("POST /api/auth/logout", () => {
		it("should clear session cookie", async () => {
			const { POST } = await import("@/app/api/auth/logout/route");
			const response = (await POST()) as unknown as MockedResponse;

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			// Logout sets cookie with maxAge: 0 to expire it immediately
			expect(response.cookies.set).toHaveBeenCalled();
		});
	});

	describe("verifySessionToken", () => {
		it("should return false for token with invalid format", () => {
			const loginModule = jest.requireActual("@/app/api/auth/login/route");

			expect(loginModule.verifySessionToken("no-dot-here")).toBe(false);
			expect(loginModule.verifySessionToken("")).toBe(false);
			expect(loginModule.verifySessionToken("...")).toBe(false);
		});

		it("should return false for token with invalid timestamp", () => {
			const loginModule = jest.requireActual("@/app/api/auth/login/route");

			expect(loginModule.verifySessionToken("not-a-number.signature")).toBe(
				false,
			);
		});

		it("should return false for expired token", () => {
			const loginModule = jest.requireActual("@/app/api/auth/login/route");

			const expiredTimestamp = Date.now() - 25 * 60 * 60 * 1000;
			expect(
				loginModule.verifySessionToken(`${expiredTimestamp}.fakesignature`),
			).toBe(false);
		});
	});
});
