import { NextResponse } from "next/server";
import {
	getDateParamsFromUrl,
	validateDateRange,
} from "@/lib/api/date-validation";
import { getModelUsageByProvider } from "@/lib/db/repositories";

export async function GET(request: Request) {
	try {
		const { start, end } = getDateParamsFromUrl(request);
		const validation = validateDateRange(start, end);
		if (!validation.success) {
			return validation.error;
		}

		const data = await getModelUsageByProvider(validation.data);
		return NextResponse.json(data);
	} catch (e) {
		console.error("Error in provider-with-model-usage API:", e);
		return NextResponse.json({ error: (e as Error).message }, { status: 500 });
	}
}
