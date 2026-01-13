import { redirect } from "next/navigation";

export default function RootPage() {
	// When basePath is set to /dashboard, this page will be at /dashboard
	// Redirect to /dashboard/dashboard for consistency, but next.config.ts
	// already handles / -> /dashboard redirect
	redirect("/dashboard");
}
