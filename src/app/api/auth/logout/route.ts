import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/app/api/auth/login/route";

export async function POST() {
	try {
		const response = NextResponse.json({ success: true });

		// Clear the session cookie
		response.cookies.set(SESSION_COOKIE_NAME, "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			path: "/",
			maxAge: 0, // Expire immediately
		});

		return response;
	} catch (error) {
		console.error("Logout error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
