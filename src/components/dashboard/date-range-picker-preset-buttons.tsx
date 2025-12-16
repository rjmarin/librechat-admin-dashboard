"use client";

import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { grey } from "@mui/material/colors";
import {
	endOfDay,
	endOfMonth,
	endOfWeek,
	isSameDay,
	startOfDay,
	startOfMonth,
	startOfWeek,
	startOfYear,
	subDays,
	subMonths,
	subWeeks,
} from "date-fns";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { datePickerIsOpenAtom } from "@/atoms/date-picker-action-atom";
import { dateRangeAtom } from "@/atoms/date-range-atom";

const presets = [
	{
		key: "today",
		label: "Today",
		getValue: () => [startOfDay(new Date()), endOfDay(new Date())],
	},
	{
		key: "yesterday",
		label: "Yesterday",
		getValue: () => [
			startOfDay(subDays(new Date(), 1)),
			endOfDay(subDays(new Date(), 1)),
		],
	},
	{
		key: "thisWeek",
		label: "This Week",
		getValue: () => [
			startOfWeek(new Date(), {
				weekStartsOn: 1,
			}),
			endOfDay(new Date()),
		],
	},
	{
		key: "lastWeek",
		label: "Last Week",
		getValue: () => {
			const lastWeekDate = subWeeks(new Date(), 1);
			return [
				startOfWeek(lastWeekDate, { weekStartsOn: 1 }),
				endOfWeek(lastWeekDate, { weekStartsOn: 1 }),
			];
		},
	},
	{
		key: "thisMonth",
		label: "This Month",
		getValue: () => [startOfMonth(new Date()), endOfDay(new Date())],
	},
	{
		key: "lastMonth",
		label: "Last Month",
		getValue: () => {
			const prevMonth = subMonths(new Date(), 1);
			return [startOfMonth(prevMonth), endOfMonth(prevMonth)];
		},
	},
	{
		key: "thisYear",
		label: "This Year",
		getValue: () => [startOfYear(new Date()), endOfDay(new Date())],
	},
	{
		key: "lastYear",
		label: "Last Year",
		getValue: () => {
			const lastYear = new Date();
			lastYear.setFullYear(lastYear.getFullYear() - 1);
			return [
				startOfYear(lastYear),
				endOfDay(new Date(lastYear.getFullYear(), 11, 31)),
			];
		},
	},
];

const DateRangePickerPresetButtons = () => {
	const [date, setDate] = useAtom(dateRangeAtom);
	const [activePreset, setActivePreset] = useState<string | null>(null);

	const triggerDatePickerAction = useSetAtom(datePickerIsOpenAtom);

	useEffect(() => {
		let foundPresetKey: string | null = null;
		for (const preset of presets) {
			const [start, end] = preset.getValue();
			if (
				date.startDate &&
				date.endDate &&
				isSameDay(date.startDate, start) &&
				isSameDay(date.endDate, end)
			) {
				foundPresetKey = preset.key;
				break;
			}
		}
		setActivePreset(foundPresetKey);
	}, [date]);

	const handlePresetChange = (
		_event: React.MouseEvent<HTMLElement>,
		newPresetKey: string | null,
	) => {
		if (newPresetKey !== null) {
			const preset = presets.find((p) => p.key === newPresetKey);
			if (preset) {
				const [newStartDate, newEndDate] = preset.getValue();
				setDate({ startDate: newStartDate, endDate: newEndDate });
			}
			triggerDatePickerAction(false);
		}
	};

	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignContent: "center",
				marginLeft: "10px",
			}}
		>
			<ToggleButtonGroup
				value={activePreset}
				exclusive
				onChange={handlePresetChange}
				aria-label="Time Range Presets"
				orientation="vertical"
			>
				{presets.map((preset) => (
					<ToggleButton
						key={preset.key}
						sx={toggleButtonStyles}
						value={preset.key}
						aria-label={preset.label}
					>
						{preset.label}
					</ToggleButton>
				))}
			</ToggleButtonGroup>
		</div>
	);
};

const toggleButtonStyles = {
	height: "35px",
	borderRadius: "10px",
	padding: "0 12px",
	textTransform: "none",
	"&.Mui-selected": {
		color: "white",
		backgroundColor: grey["600"],
		"&:hover": {
			backgroundColor: grey["700"],
		},
	},
	color: "text.secondary",
	borderColor: "divider",
};
export default DateRangePickerPresetButtons;
