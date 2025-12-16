/**
 * Calculate the percentage trend between current and previous values.
 * Returns null if no meaningful trend can be calculated (e.g., no previous data).
 */
const CalculateTrend = (
	currentData: number,
	prevData: number,
): number | null => {
	// If no previous data exists, we can't calculate a trend
	if (prevData === 0) {
		// If both are 0, no change (0%)
		if (currentData === 0) return 0;
		// If previous was 0 but now there's data, we can't show a percentage
		return null;
	}

	const dataDiff = currentData - prevData;
	const dataDiffPercentage = (dataDiff / prevData) * 100;
	const roundedDiffPercentage =
		Math.round(dataDiffPercentage * 10 ** 2) / 10 ** 2;

	// Guard against NaN/Infinity
	if (!Number.isFinite(roundedDiffPercentage)) {
		return null;
	}

	return roundedDiffPercentage;
};
export default CalculateTrend;
