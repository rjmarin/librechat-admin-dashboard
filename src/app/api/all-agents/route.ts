import { NextResponse } from "next/server";
import { getTotalAgentCount } from "@/lib/db/repositories";

export async function GET() {
	try {
		const count = await getTotalAgentCount();
		return NextResponse.json([{ totalAgentsCount: count }]);
	} catch (e) {
		console.error("Error in all-agents API:", e);
		return NextResponse.json({ error: (e as Error).message }, { status: 500 });
	}
}
