import { NextResponse } from "next/server";
import {
	calculatePreviousPeriod,
	validateDateRange,
} from "@/lib/api/date-validation";
import { getWebSearchStats } from "@/lib/db/repositories";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const validation = validateDateRange(
			searchParams.get("startDate"),
			searchParams.get("endDate"),
		);
		if (!validation.success) {
			return validation.error;
		}

		const { startDate, endDate } = validation.data;
		const periodData = calculatePreviousPeriod(startDate, endDate);

		const data = await getWebSearchStats(periodData);
		return NextResponse.json(data);
	} catch (e) {
		console.error("Error in web-search-stats API:", e);
		return NextResponse.json({ error: (e as Error).message }, { status: 500 });
	}
}
