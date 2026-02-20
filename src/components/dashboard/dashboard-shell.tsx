"use client";

import {
	Box,
	Stack,
	Tab,
	Tabs,
	Typography,
	useColorScheme,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";
import DarkLightSwitch from "@/components/dashboard/dark-light-switch";
import CustomDateRangePicker from "@/components/dashboard/date-range-picker";
import ExportButton from "@/components/dashboard/export-button";
import LogoutButton from "@/components/dashboard/logout-button";
import ReloadButton from "@/components/dashboard/refresh-button";

interface DashboardShellProps {
	title: string;
	subtitle: string;
	children: React.ReactNode;
}

const NAV_ITEMS = [
	{ label: "General", href: "/dashboard" },
	{ label: "Users", href: "/dashboard/users" },
	{ label: "Agents", href: "/dashboard/agents" },
];

function getActivePath(pathname: string): string {
	if (pathname.startsWith("/dashboard/users")) return "/dashboard/users";
	if (pathname.startsWith("/dashboard/agents")) return "/dashboard/agents";
	return "/dashboard";
}

const DashboardShell = ({ title, subtitle, children }: DashboardShellProps) => {
	const { mode } = useColorScheme();
	const { vars } = useTheme();
	const pathname = usePathname();
	const router = useRouter();
	const activePath = getActivePath(pathname);

	return (
		<div
			id="dashboard-content"
			style={{
				backgroundColor: vars?.palette.background.default,
				paddingTop: "10px",
				paddingBottom: "30px",
				minHeight: "100vh",
				background:
					mode === "dark"
						? "linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 100%)"
						: "linear-gradient(180deg, #f5f5f7 0%, #e8e8ed 100%)",
			}}
		>
			<Box
				sx={{
					marginTop: "20px",
					marginLeft: "40px",
					marginRight: "40px",
					"@media (max-width: 600px)": {
						marginLeft: "12px",
						marginRight: "12px",
					},
				}}
			>
				<Box sx={{ marginTop: "5px", padding: "15px" }}>
					<Box
						sx={{
							position: "sticky",
							top: "10px",
							zIndex: 10,
							display: "flex",
							flexDirection: "column",
							gap: 1.5,
							padding: "14px 16px",
							borderRadius: "16px",
							background:
								mode === "dark"
									? "rgba(32, 32, 35, 0.8)"
									: "rgba(255, 255, 255, 0.8)",
							backdropFilter: "blur(20px)",
							WebkitBackdropFilter: "blur(20px)",
							border: `1px solid ${mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)"}`,
						}}
					>
						<Stack
							direction={{ xs: "column", md: "row" }}
							alignItems={{ xs: "flex-start", md: "center" }}
							justifyContent="space-between"
							gap={1.5}
						>
							<Box>
								<Typography
									variant="h6"
									sx={{ fontWeight: 700, lineHeight: 1.2 }}
								>
									{title}
								</Typography>
								<Typography
									variant="body2"
									sx={{
										opacity: 0.75,
										marginTop: "3px",
										maxWidth: "720px",
									}}
								>
									{subtitle}
								</Typography>
							</Box>
							<Stack
								direction="row"
								flexWrap="wrap"
								gap={1}
								alignItems="center"
								justifyContent={{ xs: "flex-start", md: "flex-end" }}
							>
								<ReloadButton />
								<DarkLightSwitch />
								<CustomDateRangePicker />
								<ExportButton />
								<LogoutButton />
							</Stack>
						</Stack>

						<Box
							sx={{
								borderRadius: "12px",
								border: "1px solid",
								borderColor:
									mode === "dark"
										? "rgba(255,255,255,0.12)"
										: "rgba(0,0,0,0.08)",
								background:
									mode === "dark"
										? "rgba(255,255,255,0.03)"
										: "rgba(255,255,255,0.65)",
								overflowX: "auto",
							}}
						>
							<Tabs
								value={activePath}
								onChange={(_, newValue: string) => router.push(newValue)}
								variant="scrollable"
								scrollButtons="auto"
								allowScrollButtonsMobile
								sx={{
									minHeight: "42px",
									"& .MuiTabs-indicator": {
										height: "3px",
										borderRadius: "999px",
										backgroundColor: mode === "dark" ? "#4da3ff" : "#0071e3",
									},
									"& .MuiTab-root": {
										textTransform: "none",
										fontWeight: 700,
										minHeight: "42px",
										color:
											mode === "dark"
												? "rgba(255,255,255,0.75)"
												: "rgba(0,0,0,0.7)",
									},
									"& .MuiTab-root.Mui-selected": {
										color: mode === "dark" ? "#f5f5f7" : "#1d1d1f",
									},
								}}
							>
								{NAV_ITEMS.map((item) => (
									<Tab key={item.href} label={item.label} value={item.href} />
								))}
							</Tabs>
						</Box>
					</Box>

					<Box sx={{ marginTop: "22px" }}>{children}</Box>

					<Box
						component="footer"
						sx={{
							marginTop: "60px",
							paddingTop: "24px",
							paddingBottom: "24px",
							borderTop: "1px solid",
							borderColor:
								mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
							textAlign: "center",
						}}
					>
						<Typography
							sx={{
								fontSize: "13px",
								color:
									mode === "dark" ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
								display: "flex",
								flexWrap: "wrap",
								alignItems: "center",
								justifyContent: "center",
								gap: "8px",
								"& a": {
									color:
										mode === "dark"
											? "rgba(255,255,255,0.7)"
											: "rgba(0,0,0,0.7)",
									textDecoration: "none",
									transition: "color 0.2s ease",
									"&:hover": {
										color: "#0071e3",
										textDecoration: "underline",
									},
								},
							}}
						>
							© {new Date().getFullYear()}
							<a
								href="https://innfactory.ai"
								target="_blank"
								rel="noopener noreferrer"
							>
								innFactory AI Consulting GmbH
							</a>
							<span>|</span>
							<a
								href="https://innfactory.de"
								target="_blank"
								rel="noopener noreferrer"
							>
								innFactory GmbH
							</a>
							<span>|</span>
							<a
								href="https://company-gpt.com"
								target="_blank"
								rel="noopener noreferrer"
							>
								CompanyGPT - Managed AI for Enterprises GDPR & AI-Act compliant.
							</a>
						</Typography>
					</Box>
				</Box>
			</Box>
		</div>
	);
};

export default DashboardShell;
