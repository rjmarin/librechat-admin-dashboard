"use client";

import { Box, useColorScheme } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ActiveUsersText from "@/components/dashboard/active-user-text";
import ConversationsText from "@/components/dashboard/conversations-text";
import DashboardShell from "@/components/dashboard/dashboard-shell";
import InputTokenText from "@/components/dashboard/input-token-text";
import McpToolCallsText from "@/components/dashboard/mcp-tool-calls-text";
import OutputTokenText from "@/components/dashboard/output-token-text";
import TokensPerMessage from "@/components/dashboard/tokens-per-message";
import TotalRequestHeatMap from "@/components/dashboard/total-request-heat-map";
import TotalRequestsText from "@/components/dashboard/total-requests-text";
import TotalUsersText from "@/components/dashboard/total-users-text";
import UserBehaviorStatsTable from "@/components/dashboard/user-behavior-stats-table";
import WebSearchStatsText from "@/components/dashboard/web-search-stats-text";

const UsersDashboardPage = () => {
	const { mode } = useColorScheme();
	const { vars } = useTheme();

	const panelStyle = {
		bgcolor: vars?.palette.background.glass,
		borderRadius: "20px",
		background:
			mode === "dark" ? "rgba(32, 32, 35, 0.72)" : "rgba(255, 255, 255, 0.72)",
		backdropFilter: "blur(20px)",
		WebkitBackdropFilter: "blur(20px)",
		border: `1px solid ${mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.5)"}`,
		boxShadow:
			mode === "dark"
				? "0 8px 32px rgba(0, 0, 0, 0.4)"
				: "0 8px 32px rgba(0, 0, 0, 0.08)",
	};

	const statCardStyle = {
		flex: 1,
		borderRadius: "20px",
		background:
			mode === "dark"
				? "linear-gradient(135deg, rgba(50,50,55,0.9) 0%, rgba(35,35,40,0.8) 100%)"
				: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,245,247,0.9) 100%)",
		backdropFilter: "blur(20px)",
		WebkitBackdropFilter: "blur(20px)",
		border: `1px solid ${mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.6)"}`,
		minHeight: "110px",
		boxShadow:
			mode === "dark"
				? "0 8px 32px rgba(0, 0, 0, 0.3)"
				: "0 8px 32px rgba(0, 0, 0, 0.06)",
		transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
		"&:hover": {
			transform: "translateY(-2px)",
			boxShadow:
				mode === "dark"
					? "0 12px 40px rgba(0, 0, 0, 0.4)"
					: "0 12px 40px rgba(0, 0, 0, 0.1)",
		},
	};

	return (
		<DashboardShell
			title="Users Analytics"
			subtitle="Comportamiento por usuario: actividad, conversaciones y adopcion de herramientas."
		>
			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(5, 1fr)",
					gap: 2,
					marginBottom: "16px",
					"@media (max-width: 1400px)": {
						gridTemplateColumns: "repeat(3, 1fr)",
					},
					"@media (max-width: 900px)": {
						gridTemplateColumns: "repeat(2, 1fr)",
					},
					"@media (max-width: 600px)": {
						gridTemplateColumns: "1fr",
					},
				}}
			>
				<Box sx={{ ...statCardStyle }}>
					<TotalUsersText />
				</Box>
				<Box sx={{ ...statCardStyle }}>
					<ActiveUsersText />
				</Box>
				<Box sx={{ ...statCardStyle }}>
					<ConversationsText />
				</Box>
				<Box sx={{ ...statCardStyle }}>
					<TotalRequestsText />
				</Box>
				<Box sx={{ ...statCardStyle }}>
					<McpToolCallsText />
				</Box>
			</Box>

			<Box
				sx={{
					display: "grid",
					gridTemplateColumns: "repeat(4, 1fr)",
					gap: 2,
					marginBottom: "30px",
					"@media (max-width: 1200px)": {
						gridTemplateColumns: "repeat(2, 1fr)",
					},
					"@media (max-width: 600px)": {
						gridTemplateColumns: "1fr",
					},
				}}
			>
				<Box sx={{ ...statCardStyle }}>
					<InputTokenText />
				</Box>
				<Box sx={{ ...statCardStyle }}>
					<OutputTokenText />
				</Box>
				<Box sx={{ ...statCardStyle }}>
					<WebSearchStatsText />
				</Box>
				<Box sx={{ ...statCardStyle }}>
					<TokensPerMessage />
				</Box>
			</Box>

			<Box sx={{ ...panelStyle, marginTop: "40px" }}>
				<UserBehaviorStatsTable />
			</Box>

			<Box
				sx={{
					marginTop: "35px",
					display: "grid",
					gridTemplateColumns: "1fr",
					gap: 3,
				}}
			>
				<Box
					padding={"20px"}
					sx={{
						...panelStyle,
						minWidth: 0,
						overflow: "hidden",
					}}
				>
					<TotalRequestHeatMap />
				</Box>
			</Box>
		</DashboardShell>
	);
};

export default UsersDashboardPage;
