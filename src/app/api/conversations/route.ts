import { NextResponse } from "next/server";
import { validateAndCalculatePeriod } from "@/lib/api/date-validation";
import { getConversations } from "@/lib/db/repositories";

export async function GET(request: Request) {
	try {
		const validation = validateAndCalculatePeriod(request);
		if (!validation.success) {
			return validation.error;
		}

		const data = await getConversations(validation.data);
		return NextResponse.json(data);
	} catch (e) {
		console.error("Error in conversations API:", e);
		return NextResponse.json({ error: (e as Error).message }, { status: 500 });
	}
}
