"use client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import type { ReactNode } from "react";
import { theme } from "@/app/theme";

const MuiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	return (
		<ThemeProvider theme={theme} defaultMode="system">
			<CssBaseline />
			{children}
		</ThemeProvider>
	);
};

export default MuiProvider;
