import { atom } from "jotai";
import type { UserBehaviorStatsRow } from "@/components/models/user-behavior-stats";
import { API_BASE } from "@/lib/utils/api-base";
import { createDateQueryParams } from "./date-query-params";
import { dateRangeAtom } from "./date-range-atom";

export const userBehaviorStatsTableAtom = atom<Promise<UserBehaviorStatsRow[]>>(
	async (get) => {
		const dateRange = get(dateRangeAtom);
		const params = createDateQueryParams(dateRange);
		const response = await fetch(
			`${API_BASE}/user-behavior-stats-table?${params}`,
			{
				credentials: "include",
			},
		);

		if (!response.ok) {
			throw new Error("Failed to fetch user behavior stats");
		}

		const rawData: unknown = await response.json();
		return Array.isArray(rawData) ? (rawData as UserBehaviorStatsRow[]) : [];
	},
);
