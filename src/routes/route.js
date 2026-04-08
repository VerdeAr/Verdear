import express from "express";
import controllerAvaliacao from "../controllers/controllerAvaliacao.js";
import controllerCarrinho from "../controllers/controllerCarrinho.js";
import controllerHome from "../controllers/controllerHome.js";
import controllerPessoa from "../controllers/controllerPessoa.js";
import controllerProduto from "../controllers/controllerProduto.js";
import controllerVenda from "../controllers/controllerVenda.js";
import isAuthenticated from "../middlewares/authMiddleware.js";

const route = express.Router();

//Conecta-se ao banco de dados, deleta todas as tabelas dos modelos e as recria, perdendo todos os dados existentes
// database.sequelize.sync({force: true}).then(() => {
//     console.log('{ force: true }');
// });

// Rota para exibir a página de login
route.get("/", (req, res) => {
	// Adiciona o redirecionamento se o usuário já estiver logado
	if (req.session?.isAuthenticated) {
		return res.redirect("/home"); // Redireciona para a home
	}
	// Renderiza a view 'login'
	return res.render("login", { error: null });
});
// Rota para processar o login (POST /login)
route.post("/login", controllerPessoa.authenticate);

// Rota para exibir a página de cadastro
route.get("/cadastrar", (_req, res) => {
	res.render("cadastro", { error: null });
});

// Rota para processar o cadastro via formulário (redireciona para login)
route.post("/cadastrar", controllerPessoa.registerFromForm);

// Rota para a home
route.get("/home", isAuthenticated, controllerHome.viewHome);

// Rota para produtos por categoria
route.get(
	"/itens_categoria/:id",
	isAuthenticated,
	controllerHome.viewProdutosPorCategoria,
);

// Rota para logout
route.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.log("Erro ao encerrar sessão:", err);
			return res.redirect("/gestao-cadastro");
		}

		res.clearCookie("connect.sid"); // limpa o cookie da sessão
		res.redirect("/"); // volta ao login corretamente
	});
});

// Rota para gestão de cadastro
route.get("/gestao-cadastro", isAuthenticated, async (req, res) => {
	const userId = req.session.userId;
	const role = req.session.userRole;

	let catalogo = [];
	const pedidos = [];

	// Buscar pedidos para ambos VENDEDOR e CLIENTE
	const { Venda, VendaProduto, Produto, Avaliacao } = await import(
		"../models/index.js"
	);
	const vendas = await Venda.findAll({
		where: { id_cliente: userId },
		order: [["data_venda", "DESC"]],
	});

	// Buscar itens de cada venda e verificar se já foi avaliado
	for (const venda of vendas) {
		const itens = await VendaProduto.findAll({
			where: { id_venda: venda.id_venda },
		});

		// Buscar informações dos produtos
		const itensComProdutos = await Promise.all(
			itens.map(async (item) => {
				const produto = await Produto.findByPk(item.id_produto);
				return {
					...item.dataValues,
					produto: produto ? produto.dataValues : null,
				};
			}),
		);

		// Verificar se já existe avaliação para este pedido
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

// Busca de produtos por texto (nome ou descrição)
route.get("/produtos/busca", isAuthenticated, controllerHome.searchProducts);

// Rotas do Carrinho
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

// Controller Pessoa
route.put("/pessoa/cadastro", isAuthenticated, controllerPessoa.putCadastro);
route.put("/pessoa/senha", isAuthenticated, controllerPessoa.putSenha);
route.put("/pessoa/frete", isAuthenticated, controllerPessoa.putFrete);

// Controller Avaliacao
route.post("/avaliacao", isAuthenticated, controllerAvaliacao.postAvaliacao);

// Controller Produto
route.get("/vendedor/produtos", controllerProduto.getProdutosVendedor);
route.post("/vendedor/produtos", controllerProduto.postProduto);
route.put("/vendedor/produtos/:id", controllerProduto.putProduto);

// Controller Venda
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
