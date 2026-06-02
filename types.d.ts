import "express-session";

declare module "express-session" {
	interface SessionData {
		isAuthenticated?: boolean;
		userId?: number;
		userName?: string;
		userEmail?: string;
		userRole?: string;
	}
}
