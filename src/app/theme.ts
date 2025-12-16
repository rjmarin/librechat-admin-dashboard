import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
	cssVariables: { colorSchemeSelector: "data" },
	typography: {
		fontFamily:
			'"SF Pro Display", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
		h5: {
			fontWeight: 600,
			letterSpacing: "-0.02em",
		},
		h6: {
			fontWeight: 600,
			letterSpacing: "-0.01em",
		},
		body1: {
			letterSpacing: "-0.01em",
		},
	},
	shape: {
		borderRadius: 16,
	},
	components: {
		MuiPaper: {
			styleOverrides: {
				root: {
					backgroundImage: "none",
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
					fontWeight: 500,
					borderRadius: 12,
				},
			},
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: 20,
				},
			},
		},
	},
	colorSchemes: {
		light: {
			palette: {
				background: {
					default: "#f5f5f7",
					paper: "rgba(255, 255, 255, 0.92)",
					shade: "rgba(0, 0, 0, 0.04)",
					invert:
						"linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
					skeletonInvert: "rgba(0, 0, 0, 0.08)",
					glass: "rgba(255, 255, 255, 0.88)",
					glassBorder: "rgba(255, 255, 255, 0.5)",
					glassHover: "rgba(255, 255, 255, 0.95)",
					gradientCard:
						"linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,245,247,0.8) 100%)",
					subtleGlow: "0 8px 32px rgba(0, 0, 0, 0.08)",
				},
				text: {
					primary: "#1d1d1f",
					secondary: "rgba(0, 0, 0, 0.55)",
					invert: "#1d1d1f",
					secondaryInvert: "rgba(0, 0, 0, 0.55)",
				},
				primary: {
					main: "#0071e3",
					light: "#42a5f5",
					dark: "#0058b0",
				},
				divider: "rgba(0, 0, 0, 0.06)",
			},
		},
		dark: {
			palette: {
				background: {
					default: "#0d0d0d",
					paper: "rgba(32, 32, 35, 0.92)",
					shade: "rgba(255, 255, 255, 0.06)",
					invert:
						"linear-gradient(135deg, rgba(45,45,50,0.9) 0%, rgba(35,35,40,0.8) 100%)",
					skeletonInvert: "rgba(255, 255, 255, 0.08)",
					glass: "rgba(32, 32, 35, 0.88)",
					glassBorder: "rgba(255, 255, 255, 0.08)",
					glassHover: "rgba(45, 45, 50, 0.95)",
					gradientCard:
						"linear-gradient(135deg, rgba(50,50,55,0.9) 0%, rgba(35,35,40,0.8) 100%)",
					subtleGlow: "0 8px 32px rgba(0, 0, 0, 0.4)",
				},
				text: {
					primary: "#f5f5f7",
					secondary: "rgba(255, 255, 255, 0.55)",
					invert: "#f5f5f7",
					secondaryInvert: "rgba(255, 255, 255, 0.55)",
				},
				primary: {
					main: "#0a84ff",
					light: "#5ac8fa",
					dark: "#0058b0",
				},
				divider: "rgba(255, 255, 255, 0.08)",
			},
		},
	},
});

declare module "@mui/material/styles" {
	interface TypeBackground {
		shade?: string;
		invert?: string;
		skeletonInvert?: string;
		glass?: string;
		glassBorder?: string;
		glassHover?: string;
		gradientCard?: string;
		subtleGlow?: string;
	}
}
declare module "@mui/material/styles" {
	interface TypeText {
		invert?: string;
		secondaryInvert?: string;
	}
}
