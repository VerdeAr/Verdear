import type { Request, Response } from "express";
import prisma from "../../core/database.ts";

// Helper: busca ou cria o carrinho do usuário logado
async function getOrCreateCarrinho(id_pessoa: number) {
	return prisma.carrinho.upsert({
		where: { id_pessoa },
		update: {},
		create: { id_pessoa },
		include: {
			itens: {
				include: { produto: true },
			},
		},
	});
}

export default {
	async viewCarrinho(req: Request, res: Response) {
		const id_pessoa = req.session.userId as number;
		const carrinho = await getOrCreateCarrinho(id_pessoa);

		const itens = carrinho.itens.map((item) => ({
			id_item: item.id_item,
			id_produto: item.id_produto,
			nome: item.produto.nome_produto,
			quantidade: Number(item.quantidade),
			preco: Number(item.preco),
			imagem: item.produto.url_imagem,
		}));

		const total = itens.reduce(
			(sum, item) => sum + item.preco * item.quantidade,
			0,
		);

		return res.render("carrinho/views/carrinho", { itens, total });
	},

	async addItem(req: Request, res: Response) {
		const { id_produto, quantidade } = req.body;
		const id_pessoa = req.session.userId as number;

		const produto = await prisma.produto.findFirst({
			where: { id_produto: Number(id_produto), ativo: true },
		});

		if (!produto) {
			return res.json({ success: false, message: "Produto não encontrado" });
		}

		const carrinho = await getOrCreateCarrinho(id_pessoa);

		const itemExistente = carrinho.itens.find(
			(item) => item.id_produto === Number(id_produto),
		);

		if (itemExistente) {
			await prisma.itemCarrinho.update({
				where: { id_item: itemExistente.id_item },
				data: {
					quantidade: Number(itemExistente.quantidade) + Number(quantidade),
				},
			});
		} else {
			await prisma.itemCarrinho.create({
				data: {
					id_carrinho: carrinho.id_carrinho,
					id_produto: produto.id_produto,
					quantidade: Number(quantidade),
					preco: Number(produto.preco),
				},
			});
		}

		return res.json({ success: true, message: "Item adicionado ao carrinho" });
	},

	async removeItem(req: Request, res: Response) {
		const id_item = Number(req.params.id);

		await prisma.itemCarrinho.delete({
			where: { id_item },
		});

		return res.json({ success: true });
	},

	async updateQtd(req: Request, res: Response) {
		const id_item = Number(req.params.id);
		const { quantidade } = req.body;

		const item = await prisma.itemCarrinho.findUnique({
			where: { id_item },
		});

		if (!item) return res.json({ success: false });

		const novaQtd = Math.max(1, Number(item.quantidade) + Number(quantidade));

		await prisma.itemCarrinho.update({
			where: { id_item },
			data: { quantidade: novaQtd },
		});

		return res.json({ success: true });
	},

	async saveEntrega(req: Request, res: Response) {
		const { tipo } = req.body;
		const id_pessoa = req.session.userId as number;

		const carrinho = await getOrCreateCarrinho(id_pessoa);

		await prisma.carrinho.update({
			where: { id_carrinho: carrinho.id_carrinho },
			data: { tipo_entrega: tipo },
		});

		return res.json({ success: true });
	},

	async savePagamento(req: Request, res: Response) {
		const { forma } = req.body;
		const id_pessoa = req.session.userId as number;
		const carrinho = await getOrCreateCarrinho(id_pessoa);
		await prisma.carrinho.update({
			where: { id_carrinho: carrinho.id_carrinho },
			data: { forma_pagamento: String(forma) },
		});
		return res.json({ success: true });
	},
};
