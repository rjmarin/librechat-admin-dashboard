import { Input, Toolbar, Typography, useColorScheme } from "@mui/material";
import { useState } from "react";

// Toolbar for filtering/search
const EnhancedTableToolbar = (props: {
	onSearchChange: (value: string) => void;
	tableTitle: string;
	searchFieldPlaceholder: string;
}) => {
	const [searchValue, setSearchValue] = useState("");
	const { mode } = useColorScheme();

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setSearchValue(newValue);
		props.onSearchChange(newValue);
	};

	return (
		<Toolbar sx={{ paddingTop: "16px", paddingBottom: "8px" }}>
			<Typography
				sx={{
					flex: "1 1 100%",
					fontWeight: 600,
					letterSpacing: "-0.02em",
					background:
						mode === "dark"
							? "linear-gradient(135deg, #f5f5f7 0%, rgba(255,255,255,0.7) 100%)"
							: "linear-gradient(135deg, #1d1d1f 0%, rgba(0,0,0,0.7) 100%)",
					backgroundClip: "text",
					WebkitBackgroundClip: "text",
					WebkitTextFillColor: "transparent",
				}}
				variant="h6"
				id="tableTitle"
			>
				{props.tableTitle}
			</Typography>
			<Input
				size="small"
				type="text"
				placeholder={props.searchFieldPlaceholder}
				value={searchValue}
				onChange={handleInputChange}
				inputProps={{ autoCorrect: "off", spellCheck: "false" }}
				sx={{
					padding: "8px 12px",
					minWidth: "200px",
					marginRight: "10px",
					marginLeft: "10px",
					borderRadius: "12px",
					background:
						mode === "dark"
							? "rgba(255, 255, 255, 0.06)"
							: "rgba(0, 0, 0, 0.04)",
					border: "1px solid",
					borderColor:
						mode === "dark"
							? "rgba(255, 255, 255, 0.1)"
							: "rgba(0, 0, 0, 0.08)",
					"&:before, &:after": {
						display: "none",
					},
					"&:hover": {
						background:
							mode === "dark"
								? "rgba(255, 255, 255, 0.08)"
								: "rgba(0, 0, 0, 0.06)",
					},
					"&.Mui-focused": {
						borderColor: mode === "dark" ? "#0a84ff" : "#0071e3",
					},
					fontSize: "14px",
				}}
			/>
		</Toolbar>
	);
};
export default EnhancedTableToolbar;
