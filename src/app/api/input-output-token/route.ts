import { NextResponse } from "next/server";
import { validateAndCalculatePeriod } from "@/lib/api/date-validation";
import { getTokenCounts } from "@/lib/db/repositories";

export async function GET(request: Request) {
	try {
		const validation = validateAndCalculatePeriod(request);
		if (!validation.success) {
			return validation.error;
		}

		const data = await getTokenCounts(validation.data);
		return NextResponse.json(data);
	} catch (e) {
		console.error("Error in input-output-token API:", e);
		return NextResponse.json({ error: (e as Error).message }, { status: 500 });
	}
}
