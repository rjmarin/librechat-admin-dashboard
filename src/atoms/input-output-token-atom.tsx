import { atom } from "jotai";
import type { InputOutputToken } from "@/components/models/input-output-token";
import { API_BASE } from "@/lib/utils/api-base";
import { dateRangeAtom } from "./date-range-atom";

export const inputOuputTokenAtom = atom(async (get) => {
	const timeArea = get(dateRangeAtom);
	const res = await fetch(
		`${API_BASE}/input-output-token?start=${timeArea?.startDate?.toISOString()}&end=${timeArea?.endDate?.toISOString()}`,
	);
	const data: InputOutputToken[] = await res.json();
	return data;
});
