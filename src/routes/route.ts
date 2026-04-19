import express from "express";
import controllerAvaliacao from "../controllers/controllerAvaliacao.js";
import controllerCarrinho from "../controllers/controllerCarrinho.js";
import controllerHome from "../controllers/controllerHome.js";
import controllerPessoa from "../controllers/controllerPessoa.js";
import controllerProduto from "../controllers/controllerProduto.js";
import controllerVenda from "../controllers/controllerVenda.js";
import isAuthenticated from "../middlewares/authMiddleware.js";

const route = express.Router();

route.get("/", (req, res) => {
	if (req.session?.isAuthenticated) {
		return res.redirect("/home");
	}
	return res.render("login", { error: null });
});

route.post("/login", controllerPessoa.authenticate);

route.get("/cadastrar", (_req, res) => {
	res.render("cadastro", { error: null });
});

route.post("/cadastrar", controllerPessoa.registerFromForm);

route.get("/home", isAuthenticated, controllerHome.viewHome);

route.get(
	"/itens_categoria/:id",
	isAuthenticated,
	controllerHome.viewProdutosPorCategoria,
);

route.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log("Erro ao encerrar sessão:", err);
			return res.redirect("/gestao-cadastro");
		}

		res.clearCookie("connect.sid");
		res.redirect("/");
	});
});

route.get("/gestao-cadastro", isAuthenticated, async (req, res) => {
	const userId = req.session.userId;
	const role = req.session.userRole;

	let catalogo = [];
	const pedidos = [];

	const { Venda, VendaProduto, Produto, Avaliacao } = await import(
		"../models/index.js"
	);
	const vendas = await Venda.findAll({
		where: { id_cliente: userId },
		order: [["data_venda", "DESC"]],
	});

	for (const venda of vendas) {
		const itens = await VendaProduto.findAll({
			where: { id_venda: venda.id_venda },
		});

		const itensComProdutos = await Promise.all(
			itens.map(async (item) => {
				const produto = await Produto.findByPk(item.id_produto);
				return {
					...item.dataValues,
					produto: produto ? produto.dataValues : null,
				};
			}),
		);

		const avaliacao = await Avaliacao.findOne({
			where: {
				id_venda: venda.id_venda,
				id_cliente: userId,
			},
		});

		pedidos.push({
			...venda.dataValues,
			itens: itensComProdutos,
			avaliacao: avaliacao ? avaliacao.dataValues : null,
		});
	}

	if (role === "VENDEDOR") {
		catalogo = await controllerProduto.fetchProdutosVendedor(userId);
	}

	const frete_fixo = await controllerPessoa.getFrete(userId);

	const categorias = await controllerProduto.fetchCategorias();
	const unidades = await controllerProduto.fetchUnidades();

	res.render("gestao_cadastro", {
		name: req.session.userName,
		email: req.session.userEmail,
		role: role,
		id: userId,
		catalogo,
		categorias,
		unidades,
		pedidos,
		frete_fixo,
	});
});

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
