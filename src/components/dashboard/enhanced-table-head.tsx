"use client";

import {
	Box,
	TableCell,
	TableHead,
	TableRow,
	TableSortLabel,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import type React from "react";

type Order = "asc" | "desc";

export interface HeadCell<T> {
	id: keyof T;
	label: string;
	numeric: boolean;
}

interface EnhancedTableHeadProps<T> {
	order: Order;
	orderBy: keyof T;
	headCells: readonly HeadCell<T>[];
	onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
}

const EnhancedTableHead = <T extends object>({
	order,
	orderBy,
	headCells,
	onRequestSort,
}: EnhancedTableHeadProps<T>) => {
	const createSortHandler =
		(property: keyof T) => (event: React.MouseEvent<unknown>) => {
			onRequestSort(event, property);
		};

	return (
		<TableHead>
			<TableRow>
				<TableCell sx={{ backgroundColor: "background.paper" }} />
				{headCells.map((headCell) => (
					<TableCell
						sx={{ backgroundColor: "background.paper" }}
						key={headCell.id as string}
						align={headCell.numeric ? "right" : "left"}
						sortDirection={orderBy === headCell.id ? order : false}
					>
						<TableSortLabel
							active={orderBy === headCell.id}
							direction={orderBy === headCell.id ? order : "desc"}
							onClick={createSortHandler(headCell.id)}
						>
							{headCell.label}
							{orderBy === headCell.id ? (
								<Box component="span" sx={visuallyHidden}>
									{order === "desc" ? "sorted descending" : "sorted ascending"}
								</Box>
							) : null}
						</TableSortLabel>
					</TableCell>
				))}
			</TableRow>
		</TableHead>
	);
};
export default EnhancedTableHead;
