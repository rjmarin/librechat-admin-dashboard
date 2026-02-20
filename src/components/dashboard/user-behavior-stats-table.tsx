"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useAtom, useAtomValue } from "jotai";
import { loadable } from "jotai/utils";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { createDateQueryParams } from "@/atoms/date-query-params";
import { dateRangeAtom } from "@/atoms/date-range-atom";
import { userBehaviorStatsTableAtom } from "@/atoms/user-behavior-stats-table-atom";
import useTableManager from "@/hooks/useTableManager";
import { API_BASE } from "@/lib/utils/api-base";
import type {
	UserBehaviorDetailResponse,
	UserBehaviorStatsRow,
} from "../models/user-behavior-stats";
import EnhancedTableHead from "./enhanced-table-head";
import EnhancedTableToolbar from "./enhanced-table-toolbar";

interface UserBehaviorTableRow {
	userId: string;
	userName: string;
	email: string;
	messageCount: number;
	conversationCount: number;
	mcpToolCallCount: number;
	webSearchCount: number;
	aiErrorCount: number;
	lastActivityAt: number;
	lastActivityLabel: string;
}

interface HeadCell {
	id: keyof UserBehaviorTableRow;
	label: string;
	numeric: boolean;
}

const headCells: readonly HeadCell[] = [
	{ id: "userId", label: "User", numeric: false },
	{ id: "email", label: "Email", numeric: false },
	{ id: "messageCount", label: "Messages", numeric: true },
	{ id: "conversationCount", label: "Conversations", numeric: true },
	{ id: "mcpToolCallCount", label: "MCP Calls", numeric: true },
	{ id: "aiErrorCount", label: "AI Failures", numeric: true },
	{ id: "lastActivityAt", label: "Last Activity", numeric: true },
];

function formatLastActivity(value: number): string {
	if (!Number.isFinite(value) || value <= 0) {
		return "N/A";
	}
	return new Date(value).toLocaleString();
}

const UserBehaviorStatsTable: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const [isClient, setIsClient] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [detailData, setDetailData] =
		useState<UserBehaviorDetailResponse | null>(null);
	const [detailLoading, setDetailLoading] = useState(false);
	const [detailError, setDetailError] = useState<string | null>(null);
	const dateRange = useAtomValue(dateRangeAtom);

	const loadableUserBehaviorStatsAtom = loadable(userBehaviorStatsTableAtom);
	const [tableData] = useAtom(loadableUserBehaviorStatsAtom);

	useEffect(() => setIsClient(true), []);

	useEffect(() => {
		if (!selectedUserId) {
			return;
		}

		let isCancelled = false;
		const loadDetail = async () => {
			setDetailLoading(true);
			setDetailError(null);
			try {
				const params = createDateQueryParams(dateRange);
				params.set("userId", selectedUserId);
				const response = await fetch(
					`${API_BASE}/user-behavior-detail?${params}`,
					{
						credentials: "include",
					},
				);

				if (!response.ok) {
					throw new Error(`HTTP Error ${response.status}`);
				}

				const data = (await response.json()) as UserBehaviorDetailResponse;
				if (!isCancelled) {
					setDetailData(data);
				}
			} catch (e) {
				if (!isCancelled) {
					setDetailData(null);
					setDetailError((e as Error).message);
				}
			} finally {
				if (!isCancelled) {
					setDetailLoading(false);
				}
			}
		};

		loadDetail();
		return () => {
			isCancelled = true;
		};
	}, [selectedUserId, dateRange]);

	const mappedRows: UserBehaviorTableRow[] = useMemo(() => {
		if (tableData.state !== "hasData") {
			return [];
		}

		return tableData.data.map((entry: UserBehaviorStatsRow) => {
			const lastActivityMs = new Date(entry.lastActivityAt).getTime();
			return {
				userId: entry.userId,
				userName: entry.userName ?? "",
				email: entry.email ?? "",
				messageCount: entry.messageCount ?? 0,
				conversationCount: entry.conversationCount ?? 0,
				mcpToolCallCount: entry.mcpToolCallCount ?? 0,
				webSearchCount: entry.webSearchCount ?? 0,
				aiErrorCount: entry.aiErrorCount ?? 0,
				lastActivityAt: Number.isNaN(lastActivityMs) ? 0 : lastActivityMs,
				lastActivityLabel: formatLastActivity(lastActivityMs),
			};
		});
	}, [tableData]);

	const filteredRows = useMemo(() => {
		if (!searchTerm) return mappedRows;
		const lowerTerm = searchTerm.toLowerCase();
		return mappedRows.filter(
			(row) =>
				row.userId.toLowerCase().includes(lowerTerm) ||
				row.userName.toLowerCase().includes(lowerTerm) ||
				row.email.toLowerCase().includes(lowerTerm),
		);
	}, [mappedRows, searchTerm]);

	const {
		order,
		orderBy,
		page,
		rowsPerPage,
		visibleRows,
		handleRequestSort,
		handleChangePage,
		handleChangeRowsPerPage,
	} = useTableManager({
		rows: filteredRows,
		initialOrderBy: "messageCount",
	});

	return (
		<Box sx={{ width: "100%" }}>
			<EnhancedTableToolbar
				searchFieldPlaceholder="Search user, name or email"
				tableTitle="User Behavior Overview (double click to inspect details)"
				onSearchChange={setSearchTerm}
			/>
			<TableContainer
				sx={{
					minHeight: 200,
					maxHeight: 550,
				}}
			>
				<Table
					stickyHeader
					sx={{ minWidth: 900 }}
					aria-label="User behavior table"
				>
					<EnhancedTableHead
						order={order}
						orderBy={orderBy}
						headCells={headCells}
						onRequestSort={handleRequestSort}
					/>
					<TableBody>
						{!isClient || tableData.state === "loading" ? (
							<TableRow>
								<TableCell colSpan={headCells.length + 1} align="center">
									<CircularProgress size={25} />
								</TableCell>
							</TableRow>
						) : tableData.state === "hasError" ? (
							<TableRow>
								<TableCell
									colSpan={headCells.length + 1}
									align="center"
									sx={{ color: "error.main" }}
								>
									Error loading data
								</TableCell>
							</TableRow>
						) : filteredRows.length === 0 && searchTerm.length > 0 ? (
							<TableRow>
								<TableCell colSpan={headCells.length + 1} align="center">
									No matching users
								</TableCell>
							</TableRow>
						) : filteredRows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={headCells.length + 1} align="center">
									No user activity in this time range
								</TableCell>
							</TableRow>
						) : (
							visibleRows.map((row) => (
								<TableRow
									key={row.userId}
									hover
									onDoubleClick={() => setSelectedUserId(row.userId)}
									sx={{ cursor: "pointer" }}
								>
									<TableCell />
									<TableCell>
										<Typography variant="body2" fontWeight={600}>
											{row.userName || row.userId}
										</Typography>
										<Typography
											variant="caption"
											sx={{ opacity: 0.75, wordBreak: "break-all" }}
										>
											{row.userId}
										</Typography>
									</TableCell>
									<TableCell sx={{ wordBreak: "break-all" }}>
										{row.email || "N/A"}
									</TableCell>
									<TableCell align="right">
										{row.messageCount.toLocaleString("de-DE")}
									</TableCell>
									<TableCell align="right">
										{row.conversationCount.toLocaleString("de-DE")}
									</TableCell>
									<TableCell align="right">
										{row.mcpToolCallCount.toLocaleString("de-DE")}
									</TableCell>
									<TableCell align="right">
										{row.aiErrorCount.toLocaleString("de-DE")}
									</TableCell>
									<TableCell align="right">{row.lastActivityLabel}</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</TableContainer>
			{isClient && filteredRows.length > 0 && (
				<TablePagination
					rowsPerPageOptions={[5, 10, 25]}
					component="div"
					count={filteredRows.length}
					rowsPerPage={rowsPerPage}
					page={page}
					onPageChange={handleChangePage}
					onRowsPerPageChange={handleChangeRowsPerPage}
				/>
			)}
			<Dialog
				open={Boolean(selectedUserId)}
				onClose={() => setSelectedUserId(null)}
				fullWidth
				maxWidth="lg"
			>
				<DialogTitle>
					{detailData
						? `User Detail: ${detailData.userName || detailData.userId}`
						: selectedUserId}
				</DialogTitle>
				<DialogContent>
					{detailLoading ? (
						<Box sx={{ py: 4, textAlign: "center" }}>
							<CircularProgress size={28} />
						</Box>
					) : detailError ? (
						<Typography color="error.main">{detailError}</Typography>
					) : detailData ? (
						<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
							<Box
								sx={{
									display: "grid",
									gridTemplateColumns: "repeat(4, 1fr)",
									gap: 1.5,
									"@media (max-width: 900px)": {
										gridTemplateColumns: "repeat(2, 1fr)",
									},
								}}
							>
								<Chip
									label={`Email: ${detailData.email || "N/A"}`}
									variant="outlined"
								/>
								<Chip
									label={`Messages: ${detailData.messageCount.toLocaleString("de-DE")}`}
									variant="outlined"
								/>
								<Chip
									label={`Conversations: ${detailData.conversationCount.toLocaleString("de-DE")}`}
									variant="outlined"
								/>
								<Chip
									label={`AI Failures: ${detailData.aiErrorCount.toLocaleString("de-DE")}`}
									color={detailData.aiErrorCount > 0 ? "warning" : "default"}
									variant="outlined"
								/>
								<Chip
									label={`User msgs: ${detailData.userMessageCount.toLocaleString("de-DE")}`}
									variant="outlined"
								/>
								<Chip
									label={`Assistant msgs: ${detailData.assistantMessageCount.toLocaleString("de-DE")}`}
									variant="outlined"
								/>
								<Chip
									label={`MCP calls: ${detailData.mcpToolCallCount.toLocaleString("de-DE")}`}
									variant="outlined"
								/>
								<Chip
									label={`Web searches: ${detailData.webSearchCount.toLocaleString("de-DE")}`}
									variant="outlined"
								/>
							</Box>

							<Divider />

							<Box>
								<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
									MCP usage by tool
								</Typography>
								{detailData.topMcpTools.length === 0 ? (
									<Typography variant="body2" sx={{ opacity: 0.7 }}>
										No MCP tool usage in this period.
									</Typography>
								) : (
									<TableContainer sx={{ maxHeight: 230 }}>
										<Table size="small" stickyHeader>
											<TableBody>
												{detailData.topMcpTools.map((tool) => (
													<TableRow key={`${tool.toolName}-${tool.serverName}`}>
														<TableCell>{tool.toolName}</TableCell>
														<TableCell>{tool.serverName}</TableCell>
														<TableCell align="right">
															{tool.count.toLocaleString("de-DE")}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								)}
							</Box>

							<Divider />

							<Box>
								<Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
									Recent activity and AI failures
								</Typography>
								{detailData.recentActivities.length === 0 ? (
									<Typography variant="body2" sx={{ opacity: 0.7 }}>
										No messages in this period.
									</Typography>
								) : (
									<TableContainer sx={{ maxHeight: 320 }}>
										<Table size="small" stickyHeader>
											<TableBody>
												{detailData.recentActivities.map((activity) => (
													<TableRow
														key={activity.messageId || activity.createdAt}
													>
														<TableCell>
															<Typography variant="caption">
																{new Date(activity.createdAt).toLocaleString()}
															</Typography>
														</TableCell>
														<TableCell>{activity.sender}</TableCell>
														<TableCell>{activity.endpoint}</TableCell>
														<TableCell>{activity.model || "N/A"}</TableCell>
														<TableCell sx={{ maxWidth: 380 }}>
															{activity.textPreview || "(No text preview)"}
														</TableCell>
														<TableCell align="right">
															{activity.hasAiError ? (
																<Chip
																	label="AI failure"
																	color="warning"
																	size="small"
																/>
															) : (
																<Chip
																	label="OK"
																	size="small"
																	variant="outlined"
																/>
															)}
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</TableContainer>
								)}
							</Box>
						</Box>
					) : null}
				</DialogContent>
			</Dialog>
		</Box>
	);
};

export default UserBehaviorStatsTable;
