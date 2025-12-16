import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
	SESSION_COOKIE_NAME,
	verifySessionToken,
} from "@/app/api/auth/login/route";

export async function POST() {
	try {
		const cookieStore = await cookies();
		const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

		if (!sessionCookie?.value) {
			return NextResponse.json({ authenticated: false }, { status: 401 });
		}

		const isValid = verifySessionToken(sessionCookie.value);

		if (!isValid) {
			// Clear invalid session cookie
			const response = NextResponse.json(
				{ authenticated: false },
				{ status: 401 },
			);
			response.cookies.delete(SESSION_COOKIE_NAME);
			return response;
		}

		return NextResponse.json({ authenticated: true });
	} catch (error) {
		console.error("Session verification error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
