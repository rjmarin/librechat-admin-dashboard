"use client";

import { Box, Divider } from "@mui/material";
import type { PickersLayoutProps } from "@mui/x-date-pickers/PickersLayout";
import DateRangePickerPresetButtons from "./date-range-picker-preset-buttons";

const CustomDatePickerLayout = (props: PickersLayoutProps<Date | null>) => {
	const { children } = props;

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "row",
				alignItems: "center",
			}}
		>
			<DateRangePickerPresetButtons />
			<Divider orientation="vertical" />
			<Box sx={{ ml: 2 }}>{children}</Box>
		</Box>
	);
};

export default CustomDatePickerLayout;
