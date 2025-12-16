"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef } from "react";
import { dateRangeAtom } from "@/atoms/date-range-atom";

// Refresh interval in milliseconds (30 seconds for live data)
const LIVE_REFRESH_INTERVAL = 30000;

/**
 * Check if the selected date range includes today (live data)
 */
function isLiveDataRange(endDate: Date | null): boolean {
	if (!endDate) return false;

	const today = new Date();
	const todayStart = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);
	const todayEnd = new Date(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
		23,
		59,
		59,
		999,
	);

	return endDate >= todayStart && endDate <= todayEnd;
}

/**
 * Hook to trigger auto-refresh of data when viewing live (today's) data
 * Returns a refresh trigger that can be used to force refresh atoms
 */
export function useAutoRefresh(onRefresh: () => void) {
	const dateRange = useAtomValue(dateRangeAtom);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const isLive = isLiveDataRange(dateRange.endDate);

	// Cleanup interval on unmount
	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, []);

	// Set up auto-refresh when viewing live data
	useEffect(() => {
		// Clear existing interval
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}

		// Only auto-refresh if we're viewing live data
		if (isLive) {
			intervalRef.current = setInterval(() => {
				onRefresh();
			}, LIVE_REFRESH_INTERVAL);
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [isLive, onRefresh]);

	return { isLive };
}

/**
 * Atom that triggers refresh by updating the date range slightly
 * This causes all dependent atoms to refetch
 */
export function useRefreshTrigger() {
	const setDateRange = useSetAtom(dateRangeAtom);
	const dateRange = useAtomValue(dateRangeAtom);

	const triggerRefresh = useCallback(() => {
		// Slightly modify the date range to trigger atom refresh
		// This is a workaround since jotai async atoms refetch when dependencies change
		const now = new Date();
		const isEndToday = isLiveDataRange(dateRange.endDate);

		if (isEndToday && dateRange.endDate) {
			// Update end date to current moment for live refresh
			setDateRange({
				startDate: dateRange.startDate,
				endDate: now,
			});
		}
	}, [dateRange, setDateRange]);

	return triggerRefresh;
}
