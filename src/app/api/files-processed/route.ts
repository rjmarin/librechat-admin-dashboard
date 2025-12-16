import { NextResponse } from "next/server";
import { validateAndCalculatePeriod } from "@/lib/api/date-validation";
import { getFilesProcessedStats } from "@/lib/db/repositories/file-stats.repository";

export async function GET(request: Request) {
	try {
		const validation = validateAndCalculatePeriod(request);
		if (!validation.success) {
			return validation.error;
		}

		const data = await getFilesProcessedStats(validation.data);
		return NextResponse.json(data);
	} catch (e) {
		console.error("Error in files-processed API:", e);
		return NextResponse.json({ error: (e as Error).message }, { status: 500 });
	}
}
