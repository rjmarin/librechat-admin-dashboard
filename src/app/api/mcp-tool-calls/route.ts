import { NextResponse } from "next/server";
import { validateAndCalculatePeriod } from "@/lib/api/date-validation";
import { getMcpToolCalls } from "@/lib/db/repositories";

export async function GET(request: Request) {
	try {
		const validation = validateAndCalculatePeriod(request);
		if (!validation.success) {
			return validation.error;
		}

		const data = await getMcpToolCalls(validation.data);
		return NextResponse.json(
			data[0] ?? { currentMcpToolCalls: 0, prevMcpToolCalls: 0 },
		);
	} catch (e) {
		console.error("Error in mcp-tool-calls API:", e);
		return NextResponse.json({ error: (e as Error).message }, { status: 500 });
	}
}
