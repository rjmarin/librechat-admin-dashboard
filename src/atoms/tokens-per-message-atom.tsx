import { atom } from "jotai";
import type { AvgTokensPerMessage } from "@/components/models/avg-tokens-per-message";
import { dateRangeAtom } from "./date-range-atom";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL_NODE || "/api";

export const tokensPerMessageAtom = atom(async (get) => {
	const timeArea = get(dateRangeAtom);
	const res = await fetch(
		`${API_BASE}/avg-stats-per-message?start=${timeArea?.startDate?.toISOString()}&end=${timeArea?.endDate?.toISOString()}`,
	);
	if (!res.ok) throw new Error(`HTTP Error${res.status}`);
	const data: AvgTokensPerMessage[] = await res.json();
	return data;
});
