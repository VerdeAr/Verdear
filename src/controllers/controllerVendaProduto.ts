import type { Request, Response } from "express";
import prisma from "../core/database";
import { ErroNotFound } from "../core/errors/erros";

export default {
	async getVendaProduto(_req: Request, res: Response) {
		const itensVenda = await prisma.vendaProduto.findMany();
		return res.status(200).json(itensVenda);
	},

	async postVendaProduto(req: Request, res: Response) {
		const novoItemVenda = await prisma.vendaProduto.create({
			data: req.body,
		});

		return res.status(201).json(novoItemVenda);
	},

	async putVendaProduto(req: Request, res: Response) {
		const id = Number(req.params.id);

		const itemExiste = await prisma.vendaProduto.findUnique({
			where: { id_venda_produto: id },
		});

		if (!itemExiste) {
			throw new ErroNotFound("Produto não encontrado!");
		}

		const itemVendaAtualizado = await prisma.vendaProduto.update({
			where: { id_venda_produto: id },
			data: req.body,
		});

		return res.status(200).json(itemVendaAtualizado);
	},

	async deleteVendaProduto(req: Request, res: Response) {
		const id = Number(req.params.id);

		const itemExiste = await prisma.vendaProduto.findUnique({
			where: { id_venda_produto: id },
		});

		if (!itemExiste) {
			throw new ErroNotFound("Produto não encontrado");
		}

		await prisma.vendaProduto.delete({
			where: { id_venda_produto: id },
		});

		return res
			.status(200)
			.json({ mensagem: "Item de venda deletado com sucesso" });
	},
};
