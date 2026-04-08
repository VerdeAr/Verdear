import { Avaliacao } from "../models/index.js"; // Ajuste a importação para o padrão do projeto

export default {
	// POST /avaliacao (Criar nova avaliação)
	async postAvaliacao(req, res) {
		try {
			const { id_venda, nota, comentario } = req.body;
			const id_cliente = req.session.userId;

			if (!id_cliente) {
				return res
					.status(401)
					.json({ success: false, message: "Usuário não autenticado" });
			}

			// Verificar se já existe avaliação para este pedido
			const avaliacaoExistente = await Avaliacao.findOne({
				where: {
					id_venda: id_venda,
					id_cliente: id_cliente,
				},
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

			const novaAvaliacao = await Avaliacao.create({
				id_venda,
				id_cliente,
				nota,
				comentario: comentario || null,
				data_avaliacao: new Date(),
			});

			return res.status(201).json({
				success: true,
				message: "Avaliação registrada com sucesso!",
				avaliacao: novaAvaliacao,
			});
		} catch (error) {
			console.error("Erro ao cadastrar avaliação:", error);
			return res.status(500).json({
				success: false,
				error: "Erro ao cadastrar avaliação",
				details: error.message,
			});
		}
	},
};
