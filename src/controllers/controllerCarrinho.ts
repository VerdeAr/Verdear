import type { Request, Response } from "express";
import prisma from "../core/database.ts"; // Importando a conexão do Prisma
import { ErroNotFound } from "../core/errors/erros.ts";

export default {
	async viewCarrinho(req: Request, res: Response) {
		const itens = req.session.carrinho || [];
		const total = itens.reduce(
			(sum: number, item: any) => sum + item.preco * item.quantidade,
			0,
		);

		return res.render("carrinho", { itens, total });
	},

	async addItem(req: Request, res: Response) {
		const { id_produto, quantidade } = req.body;

		const produto = await prisma.produto.findFirst({
			where: {
				id_produto: Number(id_produto),
				ativo: true,
			},
		});

		if (!produto) {
			return res.json({ success: false, message: "Produto não encontrado" });
		}

		if (!req.session.carrinho) req.session.carrinho = [];

		// Garante a tipagem e converte para Number para não ter bug na comparação
		const existing = req.session.carrinho.find(
			(p: any) => p.id_produto === Number(id_produto),
		);

		if (existing) {
			existing.quantidade += Number(quantidade);
		} else {
			req.session.carrinho.push({
				id_produto: produto.id_produto,
				nome: produto.nome_produto,
				quantidade: Number(quantidade),
				preco: Number(produto.preco), // Converte o Decimal do Prisma para Number
				imagem: produto.url_imagem,
			});
		}

		return res.json({
			success: true,
			message: "Item adicionado ao carrinho",
		});
	},

	async removeItem(req: Request, res: Response) {
		const id = Number(req.params.id); // Converte para número

		if (!req.session.carrinho) {
			throw new ErroNotFound("Carrinho vazio");
		}

		req.session.carrinho = req.session.carrinho.filter(
			(item: any) => item.id_produto !== id,
		);

		return res.json({ success: true });
	},

	async updateQtd(req: Request, res: Response) {
		const id = Number(req.params.id); // Converte para número
		const { quantidade } = req.body;

		if (!req.session.carrinho) return res.json({ success: false });

		req.session.carrinho = req.session.carrinho.map((item: any) => {
			if (item.id_produto === id) {
				item.quantidade += Number(quantidade);
				if (item.quantidade < 1) item.quantidade = 1;
			}
			return item;
		});

		res.json({ success: true });
	},

	async saveEntrega(req: Request, res: Response) {
		const { tipo } = req.body;
		req.session.tipoEntrega = tipo;
		return res.json({ success: true });
	},

	async savePagamento(req: Request, res: Response) {
		const { forma } = req.body;
		req.session.formaPagamento = forma;
		return res.json({ success: true });
	},
};
