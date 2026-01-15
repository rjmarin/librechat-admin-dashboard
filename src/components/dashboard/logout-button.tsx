"use client";

import { Logout } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useCallback, useState } from "react";
import { API_BASE, getAbsolutePath } from "@/lib/utils/api-base";

export default function LogoutButton() {
	const [isLoading, setIsLoading] = useState(false);

	const handleLogout = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await fetch(`${API_BASE}/auth/logout`, {
				method: "POST",
				credentials: "include",
			});

			if (response.ok) {
				// Force reload to clear all state and redirect to login
				window.location.href = getAbsolutePath("/login");
			}
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	return (
		<Tooltip title="Logout">
			<IconButton
				onClick={handleLogout}
				disabled={isLoading}
				size="small"
				sx={{
					color: "text.secondary",
					"&:hover": {
						color: "error.main",
						backgroundColor: "rgba(211, 47, 47, 0.08)",
					},
				}}
			>
				<Logout fontSize="small" />
			</IconButton>
		</Tooltip>
	);
}
