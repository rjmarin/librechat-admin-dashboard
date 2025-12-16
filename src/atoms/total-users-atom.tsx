import { atom } from "jotai";
import type { TotalUsers } from "@/components/models/total-users";

const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND_BASE_URL_NODE || "/api";

export const totalUsersAtom = atom(async () => {
	const res = await fetch(`${API_BASE}/all-user`);
	const data: TotalUsers[] = await res.json();
	return data;
});
