import { atom } from "jotai";
import { TimeArea } from "@/components/models/time-area";

export const dashboardTimeAreaAtom = atom(TimeArea.Month);
