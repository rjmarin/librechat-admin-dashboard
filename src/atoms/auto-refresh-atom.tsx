import { atom } from "jotai";

/**
 * Atom to track auto-refresh state globally
 * This allows components to adjust their trend display logic
 */
export const autoRefreshAtom = atom<boolean>(true);
