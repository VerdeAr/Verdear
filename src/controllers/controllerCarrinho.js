import { Produto } from "../models/index.js";

export default {
	async viewCarrinho(req, res) {
		try {
			const itens = req.session.carrinho || [];
			const total = itens.reduce(
				(sum, item) => sum + item.preco * item.quantidade,
				0,
			);

			return res.render("carrinho", { itens, total });
		} catch (error) {
			console.error("Erro ao carregar carrinho:", error);
			return res.status(500).send("Erro ao carregar carrinho");
		}
	},

	async addItem(req, res) {
		try {
			const { id_produto, quantidade } = req.body;
			const produto = await Produto.findOne({
				where: { id_produto: id_produto, ativo: true },
			});

			if (!produto) {
				return res.json({ success: false, message: "Produto não encontrado" });
			}

			if (!req.session.carrinho) req.session.carrinho = [];

			const existing = req.session.carrinho.find(
				(p) => p.id_produto === id_produto,
			);
			if (existing) {
				existing.quantidade += Number(quantidade);
			} else {
				req.session.carrinho.push({
					id_produto: produto.id_produto,
					nome: produto.nome_produto,
					quantidade: Number(quantidade),
					preco: parseFloat(produto.preco),
					imagem: produto.url_imagem,
				});
			}

			return res.json({
				success: true,
				message: "Item adicionado ao carrinho",
			});
		} catch (error) {
			console.error("Erro ao adicionar item:", error);
			return res.json({ success: false, message: "Erro ao adicionar item" });
		}
	},

	async removeItem(req, res) {
		const id = req.params.id;
		if (!req.session.carrinho) {
			return res.json({ success: false, message: "Carrinho vazio" });
		}
		req.session.carrinho = req.session.carrinho.filter(
			(item) => item.id_produto !== id,
		);
		return res.json({ success: true });
	},

	async updateQtd(req, res) {
		const { id } = req.params;
		const { quantidade } = req.body;
		if (!req.session.carrinho) return res.json({ success: false });

		req.session.carrinho = req.session.carrinho.map((item) => {
			if (item.id_produto === id) {
				item.quantidade += Number(quantidade);
				if (item.quantidade < 1) item.quantidade = 1;
			}
			return item;
		});

		res.json({ success: true });
	},

	async saveEntrega(req, res) {
		try {
			const { tipo } = req.body;
			req.session.tipoEntrega = tipo;
			return res.json({ success: true });
		} catch (_error) {
			return res.json({
				success: false,
				message: "Erro ao salvar tipo de entrega",
			});
		}
	},

	async savePagamento(req, res) {
		try {
			const { forma } = req.body;
			req.session.formaPagamento = forma;
			return res.json({ success: true });
		} catch (_error) {
			return res.json({
				success: false,
				message: "Erro ao salvar forma de pagamento",
			});
		}
	},
};
