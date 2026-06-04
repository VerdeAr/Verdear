import express from "express";
import isAuthenticated from "../../middlewares/authMiddleware.ts";
import controllerCarrinho from "./controllerCarrinho.ts";

const router = express.Router();

router.get("/carrinho", isAuthenticated, controllerCarrinho.viewCarrinho);
router.post("/carrinho/add", isAuthenticated, controllerCarrinho.addItem);
router.delete(
	"/carrinho/remove/:id",
	isAuthenticated,
	controllerCarrinho.removeItem,
);
router.put(
	"/carrinho/update/:id",
	isAuthenticated,
	controllerCarrinho.updateQtd,
);
router.post(
	"/carrinho/entrega",
	isAuthenticated,
	controllerCarrinho.saveEntrega,
);
router.post(
	"/carrinho/pagamento",
	isAuthenticated,
	controllerCarrinho.savePagamento,
);

export default router;
