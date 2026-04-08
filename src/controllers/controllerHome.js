// controllers/controllerHome.js

import { Op } from "sequelize";
import { Categoria, Produto } from "../models/index.js";

export default {
	async viewHome(_req, res) {
		try {
			const produtos = await Produto.findAll({
				where: { ativo: true },
				limit: 6,
				order: [["id_produto", "ASC"]],
			});

			const categorias = await Categoria.findAll({
				order: [["id_categoria", "ASC"]],
			});
			const categoriasFormatadas = categorias.map((cat) => ({
				id: cat.id_categoria,
				name: cat.nome_categoria,
			}));

			return res.render("home", { produtos, categorias: categoriasFormatadas });
		} catch (error) {
			console.error("Erro ao carregar home:", error);
			return res.status(500).send("Erro ao carregar página inicial");
		}
	},

	async viewProdutosPorCategoria(req, res) {
		try {
			const { id } = req.params;

			const produtos = await Produto.findAll({
				where: {
					id_categoria: id,
					ativo: true,
				},
				order: [["id_produto", "ASC"]],
			});

			const categorias = await Categoria.findAll({
				order: [["id_categoria", "ASC"]],
			});
			const categoriasFormatadas = categorias.map((cat) => ({
				id: cat.id_categoria,
				name: cat.nome_categoria,
			}));

			return res.render("home", {
				produtos,
				categorias: categoriasFormatadas,
			});
		} catch (error) {
			console.error("Erro ao carregar produtos por categoria:", error);
			return res.status(500).send("Erro ao carregar produtos");
		}
	},

	async searchProducts(req, res) {
		try {
			const q = req.query.q || req.query.query || "";

			if (!q || q.trim() === "") {
				// Se não há termo de busca, retornar produtos padrão
				const produtos = await Produto.findAll({
					where: { ativo: true },
					limit: 6,
					order: [["id_produto", "ASC"]],
				});
				const categorias = await Categoria.findAll({
					order: [["id_categoria", "ASC"]],
				});
				const categoriasFormatadas = categorias.map((cat) => ({
					id: cat.id_categoria,
					name: cat.nome_categoria,
				}));
				return res.render("home", {
					produtos,
					categorias: categoriasFormatadas,
					categoriaAtual: null,
				});
			}

			// Busca case-insensitive e parcial tanto no nome quanto na descrição
			// Usando iLike para PostgreSQL (case-insensitive)
			const produtos = await Produto.findAll({
				where: {
					ativo: true,
					[Op.or]: [
						{
							nome_produto: {
								[Op.iLike]: `%${q}%`,
							},
						},
						{
							descricao: {
								[Op.and]: [
									{ [Op.ne]: null },
									{ [Op.ne]: "" },
									{ [Op.iLike]: `%${q}%` },
								],
							},
						},
					],
				},
				order: [["id_produto", "ASC"]],
			});

			const categorias = await Categoria.findAll({
				order: [["id_categoria", "ASC"]],
			});
			const categoriasFormatadas = categorias.map((cat) => ({
				id: cat.id_categoria,
				name: cat.nome_categoria,
			}));

			return res.render("home", {
				produtos,
				categorias: categoriasFormatadas,
				categoriaAtual: null,
			});
		} catch (error) {
			console.error("Erro ao buscar produtos:", error);
			return res.status(500).send("Erro na busca");
		}
	},
};
