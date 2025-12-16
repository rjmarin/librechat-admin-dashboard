import { atom } from "jotai";
import type { AgentCount } from "@/components/models/agent-count";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL_NODE || "/api";

export const agentCountAtom = atom(async () => {
	const res = await fetch(`${API_BASE}/all-agents`);
	const data: AgentCount[] = await res.json();
	return data;
});
