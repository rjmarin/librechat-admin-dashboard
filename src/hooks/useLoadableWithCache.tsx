"use client";

import type { Atom } from "jotai";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";

type LoadableState<T> =
	| { state: "loading" }
	| { state: "hasData"; data: T }
	| { state: "hasError"; error: unknown };

/**
 * Hook that caches the last successful data from a loadable atom
 * to prevent flickering during re-fetches.
 * Only shows loading state on initial load after a delay, not on subsequent refreshes.
 * Also tracks previous data for delta calculation and load count.
 */
export function useLoadableWithCache<T>(loadableAtom: Atom<LoadableState<T>>) {
	const atomValue = useAtomValue(loadableAtom);
	const cachedDataRef = useRef<T | null>(null);
	const previousDataRef = useRef<T | null>(null);
	const loadCountRef = useRef(0);
	const [isInitialLoad, setIsInitialLoad] = useState(true);
	// Delayed skeleton state to prevent flicker on fast loads
	const [showDelayedSkeleton, setShowDelayedSkeleton] = useState(false);
	const skeletonTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Update cache when we have new data
	useEffect(() => {
		if (atomValue.state === "hasData") {
			// Clear skeleton timeout if data arrives
			if (skeletonTimeoutRef.current) {
				clearTimeout(skeletonTimeoutRef.current);
				skeletonTimeoutRef.current = null;
			}
			setShowDelayedSkeleton(false);

			// Store previous data before updating cache
			if (cachedDataRef.current !== null) {
				previousDataRef.current = cachedDataRef.current;
			}
			cachedDataRef.current = atomValue.data;
			loadCountRef.current += 1;
			setIsInitialLoad(false);
		}
	}, [atomValue]);

	// Delay showing skeleton to prevent flicker on fast loads
	useEffect(() => {
		if (
			atomValue.state === "loading" &&
			cachedDataRef.current === null &&
			!showDelayedSkeleton
		) {
			// Only show skeleton after 150ms delay
			skeletonTimeoutRef.current = setTimeout(() => {
				setShowDelayedSkeleton(true);
			}, 150);
		}

		return () => {
			if (skeletonTimeoutRef.current) {
				clearTimeout(skeletonTimeoutRef.current);
			}
		};
	}, [atomValue.state, showDelayedSkeleton]);

	// Return cached data during loading if available
	const getData = (): T | null => {
		if (atomValue.state === "hasData") {
			return atomValue.data;
		}
		// Return cached data during loading/error
		return cachedDataRef.current;
	};

	// Get previous data for delta calculation
	const getPreviousData = (): T | null => {
		return previousDataRef.current;
	};

	const isLoading = atomValue.state === "loading";
	const hasError = atomValue.state === "hasError";
	const error = hasError ? atomValue.error : null;

	// Only show loading skeleton on initial load after delay, not on re-fetches
	const showSkeleton =
		isInitialLoad && showDelayedSkeleton && cachedDataRef.current === null;

	// Show subtle loading indicator for re-fetches
	const isRefetching = !isInitialLoad && isLoading;

	// Check if this is the first successful load (no previous data available for delta)
	const isFirstLoad = loadCountRef.current <= 1;

	return {
		data: getData(),
		previousData: getPreviousData(),
		isLoading,
		isInitialLoad,
		isFirstLoad,
		showSkeleton,
		isRefetching,
		hasError,
		error,
	};
}
