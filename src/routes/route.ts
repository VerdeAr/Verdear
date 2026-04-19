import type { Request, Response } from "express";
import express from "express";
import controllerAvaliacao from "../controllers/controllerAvaliacao.ts";
import controllerCarrinho from "../controllers/controllerCarrinho.ts";
import controllerHome from "../controllers/controllerHome.ts";
import controllerPessoa from "../controllers/controllerPessoa.ts";
import controllerProduto from "../controllers/controllerProduto.ts";
import controllerVenda from "../controllers/controllerVenda.ts";
import isAuthenticated from "../middlewares/authMiddleware.ts";
import { errorHandler } from "../middlewares/errorMiddleware.ts";

const route = express.Router();

route.use(errorHandler);

route.get("/", (req: Request, res: Response) => {
	if (req.session?.isAuthenticated) {
		return res.redirect("/home");
	}
	return res.render("login", { error: null });
});

route.post("/login", controllerPessoa.authenticate);

route.get("/cadastrar", (_: Request, res: Response) => {
	res.render("cadastro", { error: null });
});

route.post("/cadastrar", controllerPessoa.registerFromForm);

route.get("/home", isAuthenticated, controllerHome.viewHome);

route.get(
	"/itens_categoria/:id",
	isAuthenticated,
	controllerHome.viewProdutosPorCategoria,
);

route.get("/logout", (req: Request, res: Response) => {
	req.session.destroy((err) => {
		if (err) {
			console.log("Erro ao encerrar sessão:", err);
			return res.redirect("/gestao-cadastro");
		}

		res.clearCookie("connect.sid");
		res.redirect("/");
	});
});

route.get(
	"/gestao-cadastro",
	isAuthenticated,
	controllerPessoa.viewGestaoPessoa,
);

route.get("/produtos/busca", isAuthenticated, controllerHome.searchProducts);

route.get("/carrinho", isAuthenticated, controllerCarrinho.viewCarrinho);
route.post("/carrinho/add", isAuthenticated, controllerCarrinho.addItem);
route.delete(
	"/carrinho/remove/:id",
	isAuthenticated,
	controllerCarrinho.removeItem,
);
route.put(
	"/carrinho/update/:id",
	isAuthenticated,
	controllerCarrinho.updateQtd,
);
route.post(
	"/carrinho/entrega",
	isAuthenticated,
	controllerCarrinho.saveEntrega,
);
route.post(
	"/carrinho/pagamento",
	isAuthenticated,
	controllerCarrinho.savePagamento,
);

route.put("/pessoa/cadastro", isAuthenticated, controllerPessoa.putCadastro);
route.put("/pessoa/senha", isAuthenticated, controllerPessoa.putSenha);
route.put("/pessoa/frete", isAuthenticated, controllerPessoa.putFrete);

route.post("/avaliacao", isAuthenticated, controllerAvaliacao.postAvaliacao);

route.get("/vendedor/produtos", controllerProduto.getProdutosVendedor);
route.post("/vendedor/produtos", controllerProduto.postProduto);
route.put("/vendedor/produtos/:id", controllerProduto.putProduto);

route.get("/finalizar-venda", isAuthenticated, controllerVenda.viewCheckout);
route.post("/finalizar-venda", isAuthenticated, controllerVenda.confirmarVenda);
route.put("/venda/:id", controllerVenda.putVenda);
route.delete("/venda/:id", isAuthenticated, controllerVenda.deleteVenda);
route.get(
	"/vendedor/pedidos",
	isAuthenticated,
	controllerVenda.getPedidosVendedor,
);

export default route;
