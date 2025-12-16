/**
 * Number formatting utilities for dashboard display
 *
 * Formats large numbers with German abbreviations:
 * - Tsd. (Tausend) for thousands
 * - Mio. (Millionen) for millions
 * - Mrd. (Milliarden) for billions
 */

export interface FormattedNumber {
	/** Short formatted string (e.g., "1,23 Mio.") */
	short: string;
	/** Full number for tooltip (e.g., "1.234.567") */
	full: string;
	/** Raw numeric value */
	value: number;
}

/**
 * Format a number with German abbreviations for display
 *
 * @param value - The number to format
 * @param maxDecimals - Maximum decimal places for short format (default: 2)
 * @returns Object with short, full, and raw value
 */
export function formatLargeNumber(
	value: number | null | undefined,
	maxDecimals = 2,
): FormattedNumber {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return {
			short: "--",
			full: "--",
			value: 0,
		};
	}

	const absValue = Math.abs(value);
	const sign = value < 0 ? "-" : "";

	// Full formatted number with German locale
	const full = value.toLocaleString("de-DE", {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
	});

	// Short format with abbreviations
	let short: string;

	if (absValue >= 1_000_000_000) {
		// Milliarden (Billions)
		const formatted = (absValue / 1_000_000_000).toLocaleString("de-DE", {
			minimumFractionDigits: 0,
			maximumFractionDigits: maxDecimals,
		});
		short = `${sign}${formatted} Mrd.`;
	} else if (absValue >= 1_000_000) {
		// Millionen (Millions)
		const formatted = (absValue / 1_000_000).toLocaleString("de-DE", {
			minimumFractionDigits: 0,
			maximumFractionDigits: maxDecimals,
		});
		short = `${sign}${formatted} Mio.`;
	} else if (absValue >= 1_000) {
		// Tausend (Thousands)
		const formatted = (absValue / 1_000).toLocaleString("de-DE", {
			minimumFractionDigits: 0,
			maximumFractionDigits: maxDecimals,
		});
		short = `${sign}${formatted} Tsd.`;
	} else {
		// No abbreviation needed
		short = value.toLocaleString("de-DE", {
			minimumFractionDigits: 0,
			maximumFractionDigits: maxDecimals,
		});
	}

	return {
		short,
		full,
		value,
	};
}

/**
 * Format a trend value (delta) with abbreviations
 * Includes + sign for positive values
 */
export function formatTrendValue(
	value: number | null | undefined,
	maxDecimals = 2,
): FormattedNumber {
	if (value === null || value === undefined || Number.isNaN(value)) {
		return {
			short: "--",
			full: "--",
			value: 0,
		};
	}

	const formatted = formatLargeNumber(Math.abs(value), maxDecimals);
	const sign = value > 0 ? "+" : value < 0 ? "-" : "";

	return {
		short: value === 0 ? "0" : `${sign}${formatted.short}`,
		full: value === 0 ? "0" : `${sign}${formatted.full}`,
		value,
	};
}
