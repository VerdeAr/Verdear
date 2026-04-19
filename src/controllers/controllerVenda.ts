import type { Produto, Venda, VendaProduto } from "@prisma/client";
import { tipo_entrega_enum } from "@prisma/client";
import type { Request, Response } from "express";
import prisma from "../core/database";

const getCheckoutData = async (req: Request) => {
	const itens = req.session.carrinho || [];

	const subtotal = itens.reduce(
		(sum: number, item: Produto & { quantidade: number }) =>
			sum + Number(item.preco || 0) * Number(item.quantidade || 1),
		0,
	);

	let tipoEntrega: tipo_entrega_enum;
	if (req.session.tipoEntrega === "ENTREGA") {
		tipoEntrega = tipo_entrega_enum.ENTREGA;
	} else {
		tipoEntrega = tipo_entrega_enum.RETIRADA;
	}

	const formaPagamento = req.session.formaPagamento || "CARTÃO";
	const custoFrete = tipoEntrega === "ENTREGA" ? 15.0 : 0.0;
	const total = subtotal + custoFrete;

	const vendedoresEmails = new Set<string>();

	for (const item of itens) {
		const produto = await prisma.produto.findUnique({
			where: { id_produto: Number(item.id_produto) },
			select: { id_vendedor: true },
		});

		if (produto?.id_vendedor) {
			const vendedor = await prisma.pessoa.findUnique({
				where: { id_pessoa: produto.id_vendedor },
				select: { email: true },
			});

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
	async viewCheckout(req: Request, res: Response) {
		if (!req.session.carrinho || req.session.carrinho.length === 0) {
			return res.redirect("/carrinho");
		}

		const data = await getCheckoutData(req);
		return res.render("finalizarVenda", data);
	},

	async confirmarVenda(req: Request, res: Response) {
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

		const novaVenda = await prisma.venda.create({
			data: {
				id_cliente: Number(req.session.userId),
				data_venda: new Date(),
				tipo_entrega: tipoEntrega,
				valor_total: total,
				status: "ABERTA",
			},
		});

		const itensVendaData = itens.map(
			(item: Produto & { quantidade: number }) => ({
				id_venda: novaVenda.id_venda,
				id_produto: Number(item.id_produto),
				quantidade: Number(item.quantidade),
				preco_unitario: Number(item.preco),
			}),
		);

		await prisma.vendaProduto.createMany({
			data: itensVendaData,
		});

		req.session.carrinho = [];
		req.session.tipoEntrega = undefined;
		req.session.formaPagamento = undefined;

		return res.json({
			success: true,
			message: "Venda finalizada com sucesso!",
			id_venda: novaVenda.id_venda,
		});
	},

	async getVenda(_: Request, res: Response) {
		const vendas = await prisma.venda.findMany();
		return res.status(200).json(vendas);
	},

	async postVenda(req: Request, res: Response) {
		const novaVenda = await prisma.venda.create({
			data: req.body,
		});
		return res.status(201).json(novaVenda);
	},

	async putVenda(req: Request, res: Response) {
		const { id } = req.params;

		const vendaExiste = await prisma.venda.findUnique({
			where: { id_venda: Number(id) },
		});

		if (!vendaExiste) {
			return res
				.status(404)
				.json({ error: "Venda não encontrada para atualização" });
		}

		const vendaAtualizada = await prisma.venda.update({
			where: { id_venda: Number(id) },
			data: req.body,
		});

		return res.status(200).json(vendaAtualizada);
	},

	async deleteVenda(req: Request, res: Response) {
		const idVenda = Number(req.params.id);
		const userId = Number(req.session.userId);
		const userRole = req.session.userRole;

		if (!userId) {
			return res
				.status(401)
				.json({ success: false, message: "Usuário não autenticado." });
		}

		const venda = await prisma.venda.findUnique({
			where: { id_venda: idVenda },
		});

		if (!venda) {
			return res
				.status(404)
				.json({ success: false, message: "Venda não encontrada." });
		}

		if (venda.status !== "ABERTA") {
			return res.status(400).json({
				success: false,
				message: "Apenas pedidos com status ABERTA podem ser excluídos.",
			});
		}

		let temPermissao = false;

		if (venda.id_cliente === userId) {
			temPermissao = true;
		} else if (userRole === "VENDEDOR") {
			const itensVenda = await prisma.vendaProduto.findMany({
				where: { id_venda: idVenda },
				include: { produto: true },
			});

			temPermissao = itensVenda.some(
				(item: VendaProduto & { produto: Produto | null }) =>
					item.produto?.id_vendedor === userId,
			);
		}

		if (!temPermissao) {
			return res.status(403).json({
				success: false,
				message: "Você não tem permissão para excluir este pedido.",
			});
		}

		await prisma.$transaction([
			prisma.avaliacao.deleteMany({ where: { id_venda: idVenda } }),
			prisma.vendaProduto.deleteMany({ where: { id_venda: idVenda } }),
			prisma.venda.delete({ where: { id_venda: idVenda } }),
		]);

		return res.json({
			success: true,
			message: "Pedido excluído com sucesso!",
		});
	},

	async getPedidosVendedor(req: Request, res: Response) {
		const userId = Number(req.session.userId);
		const userRole = req.session.userRole;

		if (!userId || userRole !== "VENDEDOR") {
			return res
				.status(401)
				.json({ success: false, message: "Não autorizado." });
		}

		const produtosVendedor = await prisma.produto.findMany({
			where: { id_vendedor: userId },
			select: { id_produto: true },
		});

		const idsProdutos = produtosVendedor.map(
			(p: { id_produto: number }) => p.id_produto,
		);

		if (idsProdutos.length === 0) {
			return res.json({ success: true, pedidos: [] });
		}

		const itensVenda = await prisma.vendaProduto.findMany({
			where: { id_produto: { in: idsProdutos } },
			select: { id_venda: true },
		});

		const idsVendas = [
			...new Set(
				itensVenda
					.map((item: { id_venda: number | null }) => item.id_venda)
					.filter((id): id is number => id !== null),
			),
		];

		if (idsVendas.length === 0) {
			return res.json({ success: true, pedidos: [] });
		}

		const vendas = await prisma.venda.findMany({
			where: { id_venda: { in: idsVendas } },
			orderBy: { data_venda: "desc" },
		});

		const pedidos = await Promise.all(
			vendas.map(async (venda: Venda) => {
				const itens = await prisma.vendaProduto.findMany({
					where: {
						id_venda: venda.id_venda,
						id_produto: { in: idsProdutos },
					},
					include: { produto: true },
				});

				const cliente = venda.id_cliente
					? await prisma.pessoa.findUnique({
							where: { id_pessoa: venda.id_cliente },
							select: { nome_pessoa: true, email: true },
						})
					: null;

				return {
					...venda,
					itens,
					cliente: cliente
						? { nome: cliente.nome_pessoa, email: cliente.email }
						: null,
				};
			}),
		);

		return res.json({ success: true, pedidos });
	},
};
