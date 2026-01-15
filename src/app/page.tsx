import { redirect } from "next/navigation";

export default function RootPage() {
	// Redirect to the dashboard page
	// Next.js router automatically applies basePath, so "/dashboard" becomes:
	// - "/dashboard" when no basePath is set (local dev)
	// - "/dashboard/dashboard" when basePath="/dashboard" (Docker/production)
	redirect("/dashboard");
}
