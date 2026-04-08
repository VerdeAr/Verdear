import { Op } from "sequelize";
import {
	Avaliacao,
	Pessoa,
	Produto,
	Venda,
	VendaProduto,
} from "../models/index.js";

const getCheckoutData = async (req) => {
	const itens = req.session.carrinho || [];
	const subtotal = itens.reduce(
		(sum, item) => sum + item.preco * item.quantidade,
		0,
	);

	const tipoEntrega = req.session.tipoEntrega || "RETIRADA";
	const formaPagamento = req.session.formaPagamento || "CARTÃO";
	const custoFrete = tipoEntrega === "ENTREGA" ? 15.0 : 0.0;
	const total = subtotal + custoFrete;

	// Buscar email dos vendedores dos produtos
	const vendedoresEmails = new Set();
	for (const item of itens) {
		const produto = await Produto.findByPk(item.id_produto);
		if (produto?.id_vendedor) {
			const vendedor = await Pessoa.findByPk(produto.id_vendedor);
			if (vendedor?.email) {
				vendedoresEmails.add(vendedor.email);
			}
		}
	}

	return {
		itens,
		subtotal,
		custoFrete,
		total,
		tipoEntrega,
		formaPagamento,
		vendedoresEmails: Array.from(vendedoresEmails),
	};
};

export default {
	// GET /finalizar-venda
	async viewCheckout(req, res) {
		try {
			if (!req.session.carrinho || req.session.carrinho.length === 0) {
				return res.redirect("/carrinho");
			}

			const data = await getCheckoutData(req);

			return res.render("finalizarVenda", data);
		} catch (error) {
			console.error("Erro ao carregar checkout:", error);
			return res
				.status(500)
				.send("Erro interno ao carregar tela de finalização.");
		}
	},

	// POST /finalizar-venda
	async confirmarVenda(req, res) {
		try {
			const { itens, total, tipoEntrega } = await getCheckoutData(req);

			if (!itens || itens.length === 0) {
				return res
					.status(400)
					.json({ success: false, message: "Carrinho vazio." });
			}

			if (!req.session.userId) {
				return res
					.status(401)
					.json({ success: false, message: "Usuário não autenticado." });
			}

			// 1. Criar o registro da Venda
			const novaVenda = await Venda.create({
				id_cliente: req.session.userId,
				data_venda: new Date(),
				tipo_entrega: tipoEntrega,
				valor_total: total,
				status: "ABERTA",
			});

			// 2. Criar os registros de VendaProduto
			for (const item of itens) {
				await VendaProduto.create({
					id_venda: novaVenda.id_venda,
					id_produto: item.id_produto,
					quantidade: item.quantidade,
					preco_unitario: item.preco,
				});
			}

			// 3. Limpar o carrinho (sessão)
			req.session.carrinho = [];
			req.session.tipoEntrega = null;
			req.session.formaPagamento = null;

			return res.json({
				success: true,
				message: "Venda finalizada com sucesso!",
				id_venda: novaVenda.id_venda,
			});
		} catch (error) {
			console.error("Erro ao finalizar a venda:", error);
			return res.status(500).json({
				success: false,
				message: "Erro interno ao processar a venda.",
			});
		}
	},

	// GET /venda
	async getVenda(_req, res) {
		try {
			const vendas = await Venda.findAll();
			return res.status(200).json(vendas);
		} catch (error) {
			return res
				.status(500)
				.json({ error: "Erro ao buscar vendas", details: error.message });
		}
	},

	// POST /venda
	async postVenda(req, res) {
		try {
			const novaVenda = await Venda.create(req.body);
			return res.status(201).json(novaVenda);
		} catch (error) {
			return res
				.status(500)
				.json({ error: "Erro ao cadastrar venda", details: error.message });
		}
	},

	// PUT /venda/:id
	async putVenda(req, res) {
		try {
			const [updated] = await Venda.update(req.body, {
				where: { id_venda: req.params.id },
			});

			if (updated === 0) {
				return res
					.status(404)
					.json({ error: "Venda não encontrada para atualização" });
			}

			const vendaAtualizada = await Venda.findByPk(req.params.id);
			return res.status(200).json(vendaAtualizada);
		} catch (error) {
			return res
				.status(500)
				.json({ error: "Erro ao atualizar venda", details: error.message });
		}
	},

	// DELETE /venda/:id - Exclui venda e seus itens (exclusão em cascata)
	async deleteVenda(req, res) {
		try {
			const { id } = req.params;
			const userId = req.session.userId;
			const userRole = req.session.userRole;

			if (!userId) {
				return res
					.status(401)
					.json({ success: false, message: "Usuário não autenticado." });
			}

			// Buscar a venda
			const venda = await Venda.findOne({
				where: { id_venda: id },
			});

			if (!venda) {
				return res.status(404).json({
					success: false,
					message: "Venda não encontrada.",
				});
			}

			// Verificar se o status é ABERTA
			if (venda.status !== "ABERTA") {
				return res.status(400).json({
					success: false,
					message: "Apenas pedidos com status ABERTA podem ser excluídos.",
				});
			}

			// Verificar permissão: usuário deve ser o cliente OU vendedor dos produtos
			let temPermissao = false;

			// Se é o cliente da venda, tem permissão
			if (venda.id_cliente === userId) {
				temPermissao = true;
			} else if (userRole === "VENDEDOR") {
				// Se é vendedor, verificar se tem produtos nesta venda
				const itensVenda = await VendaProduto.findAll({
					where: { id_venda: id },
				});

				// Verificar se algum produto pertence ao vendedor
				for (const item of itensVenda) {
					const produto = await Produto.findByPk(item.id_produto);
					if (produto && produto.id_vendedor === userId) {
						temPermissao = true;
						break;
					}
				}
			}

			if (!temPermissao) {
				return res.status(403).json({
					success: false,
					message: "Você não tem permissão para excluir este pedido.",
				});
			}

			// Excluir avaliações relacionadas primeiro
			await Avaliacao.destroy({
				where: { id_venda: id },
			});

			// Excluir os itens da venda (VendaProduto) - exclusão em cascata
			await VendaProduto.destroy({
				where: { id_venda: id },
			});

			// Depois excluir a venda
			await Venda.destroy({
				where: { id_venda: id },
			});

			return res.json({
				success: true,
				message: "Pedido excluído com sucesso!",
			});
		} catch (error) {
			console.error("Erro ao excluir venda:", error);
			return res.status(500).json({
				success: false,
				message: "Erro interno ao excluir pedido.",
				details: error.message,
			});
		}
	},

	// GET /vendedor/pedidos - Buscar pedidos onde o vendedor é vendedor dos produtos
	async getPedidosVendedor(req, res) {
		try {
			const userId = req.session.userId;
			const userRole = req.session.userRole;

			if (!userId || userRole !== "VENDEDOR") {
				return res
					.status(401)
					.json({ success: false, message: "Não autorizado." });
			}

			// Buscar todas as vendas que contêm produtos deste vendedor
			const { Venda, VendaProduto, Produto, Pessoa } = await import(
				"../models/index.js"
			);

			// Buscar todos os produtos do vendedor
			const produtosVendedor = await Produto.findAll({
				where: { id_vendedor: userId },
				attributes: ["id_produto"],
			});

			const idsProdutos = produtosVendedor.map((p) => p.id_produto);

			if (idsProdutos.length === 0) {
				return res.json({ success: true, pedidos: [] });
			}

			// Buscar vendas que contêm produtos deste vendedor
			const itensVenda = await VendaProduto.findAll({
				where: { id_produto: { [Op.in]: idsProdutos } },
				attributes: ["id_venda"],
				group: ["id_venda"],
			});

			const idsVendas = [...new Set(itensVenda.map((item) => item.id_venda))];

			if (idsVendas.length === 0) {
				return res.json({ success: true, pedidos: [] });
			}

			// Buscar as vendas completas
			const vendas = await Venda.findAll({
				where: { id_venda: { [Op.in]: idsVendas } },
				order: [["data_venda", "DESC"]],
			});

			// Montar os pedidos com informações completas
			const pedidos = await Promise.all(
				vendas.map(async (venda) => {
					const itens = await VendaProduto.findAll({
						where: {
							id_venda: venda.id_venda,
							id_produto: { [Op.in]: idsProdutos },
						},
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

					// Buscar informações do cliente
					const cliente = await Pessoa.findByPk(venda.id_cliente);

					return {
						...venda.dataValues,
						itens: itensComProdutos,
						cliente: cliente
							? {
									nome: cliente.nome_pessoa,
									email: cliente.email,
								}
							: null,
					};
				}),
			);

			return res.json({ success: true, pedidos });
		} catch (error) {
			console.error("Erro ao buscar pedidos do vendedor:", error);
			return res.status(500).json({
				success: false,
				message: "Erro ao buscar pedidos.",
				details: error.message,
			});
		}
	},
};
