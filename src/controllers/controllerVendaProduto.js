import { VendaProduto } from "../models/index.js"; // Ajuste a importação para o padrão do projeto

export default {
	// GET /vendaproduto (Buscar todos os itens de venda)
	async getVendaProduto(_req, res) {
		try {
			const itensVenda = await VendaProduto.findAll();
			return res.status(200).json(itensVenda);
		} catch (error) {
			return res.status(500).json({
				error: "Erro ao buscar itens de venda",
				details: error.message,
			});
		}
	},

	// POST /vendaproduto (Criar novo item de venda)
	async postVendaProduto(req, res) {
		try {
			const novoItemVenda = await VendaProduto.create(req.body);
			// Retorna status 201 - Created
			return res.status(201).json(novoItemVenda);
		} catch (error) {
			return res.status(500).json({
				error: "Erro ao cadastrar item de venda",
				details: error.message,
			});
		}
	},

	// PUT /vendaproduto/:id (Atualizar item de venda específico)
	async putVendaProduto(req, res) {
		try {
			// Tenta atualizar usando a chave primária 'id_venda_produto'
			const [updated] = await VendaProduto.update(req.body, {
				where: { id_venda_produto: req.params.id },
			});

			if (updated === 0) {
				return res
					.status(404)
					.json({ error: "Item de venda não encontrado para atualização" });
			}

			// Busca o registro atualizado para retorná-lo ao cliente
			const itemVendaAtualizado = await VendaProduto.findByPk(req.params.id);
			return res.status(200).json(itemVendaAtualizado); // Retorna 200 OK
		} catch (error) {
			return res.status(500).json({
				error: "Erro ao atualizar item de venda",
				details: error.message,
			});
		}
	},

	// DELETE /vendaproduto/:id (Deletar item de venda específico)
	async deleteVendaProduto(req, res) {
		try {
			// Deleta o registro usando a chave primária 'id_venda_produto'
			const deletado = await VendaProduto.destroy({
				where: { id_venda_produto: req.params.id },
			});

			if (deletado === 0) {
				return res
					.status(404)
					.json({ error: "Item de venda não encontrado para exclusão" });
			}

			return res
				.status(200)
				.json({ mensagem: "Item de venda deletado com sucesso" });
		} catch (error) {
			return res.status(500).json({
				error: "Erro ao deletar item de venda",
				details: error.message,
			});
		}
	},
};
