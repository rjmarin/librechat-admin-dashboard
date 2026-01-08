"use client";

import { useMemo, useState } from "react";
import { getComparator } from "@/components/utils/sorting";

type Order = "asc" | "desc";

interface TableManagerOptions<T> {
	rows: T[];
	initialOrderBy: keyof T;
	initialRowsPerPage?: number;
}

const useTableManager = <T extends object>({
	rows,
	initialOrderBy,
	initialRowsPerPage = 25,
}: TableManagerOptions<T>) => {
	const [order, setOrder] = useState<Order>("desc");
	const [orderBy, setOrderBy] = useState<keyof T>(initialOrderBy);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

	const handleRequestSort = (
		_: React.MouseEvent<unknown>,
		property: keyof T,
	) => {
		const isDesc = orderBy === property && order === "desc";
		setOrder(isDesc ? "asc" : "desc");
		setOrderBy(property);
	};

	const handleChangePage = (_: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	const visibleRows = useMemo(
		() =>
			[...rows]
				.sort(getComparator(order, orderBy as keyof T))
				.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
		[rows, order, orderBy, page, rowsPerPage],
	);
	return {
		order,
		orderBy,
		page,
		rowsPerPage,
		visibleRows,
		handleRequestSort,
		handleChangePage,
		handleChangeRowsPerPage,
	};
};
export default useTableManager;
