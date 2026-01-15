import { atom } from "jotai";
import type { TotalUsers } from "@/components/models/total-users";
import { API_BASE } from "@/lib/utils/api-base";

export const totalUsersAtom = atom(async () => {
	const res = await fetch(`${API_BASE}/all-user`);
	const data: TotalUsers[] = await res.json();
	return data;
});
