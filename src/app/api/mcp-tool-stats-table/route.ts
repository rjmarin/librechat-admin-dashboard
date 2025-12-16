import { NextResponse } from "next/server";
import { validateDateRange } from "@/lib/api/date-validation";
import { getMcpToolStatsTable } from "@/lib/db/repositories";

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

		const data = await getMcpToolStatsTable(validation.data);
		return NextResponse.json(data);
	} catch (e) {
		console.error("Error in mcp-tool-stats-table API:", e);
		return NextResponse.json({ error: (e as Error).message }, { status: 500 });
	}
}
