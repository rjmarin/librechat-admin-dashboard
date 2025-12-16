import { atom } from "jotai";
import type { Conversations } from "@/components/models/conversations";
import { dateRangeAtom } from "./date-range-atom";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL_NODE || "/api";

export const conversationsAtom = atom(async (get) => {
	const timeArea = get(dateRangeAtom);
	const res = await fetch(
		`${API_BASE}/conversations?start=${timeArea?.startDate?.toISOString()}&end=${timeArea?.endDate?.toISOString()}`,
	);
	const data: Conversations[] = await res.json();
	return data;
});
