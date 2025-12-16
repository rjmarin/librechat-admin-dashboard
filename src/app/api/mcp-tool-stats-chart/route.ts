import { NextResponse } from "next/server";
import { validateDateRange } from "@/lib/api/date-validation";
import { getMcpToolStatsChart } from "@/lib/db/repositories";
import type { TimeGranularity } from "@/lib/db/types";

/**
 * Determine the appropriate time granularity based on date range
 */
function getGranularity(startDate: Date, endDate: Date): TimeGranularity {
	const diffMs = endDate.getTime() - startDate.getTime();
	const diffDays = diffMs / (1000 * 60 * 60 * 24);

	if (diffDays <= 2) {
		return "hour";
	}
	if (diffDays <= 60) {
		return "day";
	}
	return "month";
}

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
		const granularity = getGranularity(startDate, endDate);

		const timezone = searchParams.get("timezone") || "UTC";

		const data = await getMcpToolStatsChart({
			startDate,
			endDate,
			granularity,
			timezone,
		});

		return NextResponse.json({
			data,
			granularity,
		});
	} catch (e) {
		console.error("Error in mcp-tool-stats-chart API:", e);
		return NextResponse.json({ error: (e as Error).message }, { status: 500 });
	}
}
