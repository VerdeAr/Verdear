import type { Request, Response } from "express";
import prisma from "../core/database";

export default {
	async postAvaliacao(req: Request, res: Response) {
		const { id_venda, nota, comentario } = req.body;
		const id_cliente = req.session.userId;

		if (!id_cliente) {
			return res
				.status(401)
				.json({ success: false, message: "Usuário não autenticado" });
		}

		const avaliacaoExistente = await prisma.avaliacao.findFirst({
			where: { id_venda: id_venda, id_cliente: id_cliente },
		});

		if (avaliacaoExistente) {
			return res.status(400).json({
				success: false,
				message: "Este pedido já foi avaliado",
			});
		}

		// Validar nota (deve ser entre 1 e 5)
		if (!nota || nota < 1 || nota > 5) {
			return res.status(400).json({
				success: false,
				message: "A nota deve ser entre 1 e 5",
			});
		}

		const novaAvaliacao = await prisma.avaliacao.create({
			data: {
				id_venda,
				id_cliente,
				nota,
				comentario: comentario || null,
				data_avaliacao: new Date(),
			},
		});

		return res.status(201).json({
			success: true,
			message: "Avaliação registrada com sucesso!",
			avaliacao: novaAvaliacao,
		});
	},
};
