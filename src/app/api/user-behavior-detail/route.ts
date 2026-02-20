import { NextResponse } from "next/server";
import {
	getDateParamsFromUrl,
	validateDateRange,
} from "@/lib/api/date-validation";
import { getUserBehaviorDetail } from "@/lib/db/repositories";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const userId = searchParams.get("userId");
		const { start, end } = getDateParamsFromUrl(request);
		const validation = validateDateRange(start, end);

		if (!validation.success) {
			return validation.error;
		}

		if (!userId) {
			return NextResponse.json(
				{ error: "Missing required query parameter: userId" },
				{ status: 400 },
			);
		}

		const data = await getUserBehaviorDetail({
			userId,
			...validation.data,
		});

		if (!data) {
			return NextResponse.json(
				{ error: "No data found for this user in selected period" },
				{ status: 404 },
			);
		}

		return NextResponse.json(data);
	} catch (e) {
		console.error("Error in user-behavior-detail API:", e);
		return NextResponse.json({ error: (e as Error).message }, { status: 500 });
	}
}
