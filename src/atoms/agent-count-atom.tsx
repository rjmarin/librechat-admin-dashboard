import { atom } from "jotai";
import type { AgentCount } from "@/components/models/agent-count";
import { API_BASE } from "@/lib/utils/api-base";

export const agentCountAtom = atom(async () => {
	const res = await fetch(`${API_BASE}/all-agents`);
	const data: AgentCount[] = await res.json();
	return data;
});
