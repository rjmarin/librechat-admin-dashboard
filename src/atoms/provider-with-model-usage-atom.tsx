import { atom } from "jotai";
import type { ProviderWithModelUsage } from "@/components/models/provider-with-model-usage";
import { dateRangeAtom } from "./date-range-atom";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL_NODE || "/api";

export const providerWithModelUsageAtom = atom(async (get) => {
	const timeArea = get(dateRangeAtom);
	const res = await fetch(
		`${API_BASE}/provider-with-model-usage?start=${timeArea?.startDate?.toISOString()}&end=${timeArea?.endDate?.toISOString()}`,
	);
	if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
	const data: ProviderWithModelUsage[] = await res.json();
	return data;
});
