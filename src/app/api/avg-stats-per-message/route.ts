import { NextResponse } from "next/server";
import { validateAndCalculatePeriod } from "@/lib/api/date-validation";
import { getMessageStats } from "@/lib/db/repositories";

export async function GET(request: Request) {
	try {
		const validation = validateAndCalculatePeriod(request);
		if (!validation.success) {
			return validation.error;
		}

		const data = await getMessageStats(validation.data);
		return NextResponse.json(data);
	} catch (e) {
		console.error("Error in avg-stats-per-message API:", e);
		return NextResponse.json({ error: (e as Error).message }, { status: 500 });
	}
}
