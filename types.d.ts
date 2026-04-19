import "express-session";

declare module "express-session" {
	interface SessionData {
		carrinho?: Produto[];
		isAuthenticated?: boolean;
		userId?: number;
		userName?: string;
		userEmail?: string;
		userRole?: string;
		tipoEntrega?: string;
		formaPagamento?: string;
	}
}
