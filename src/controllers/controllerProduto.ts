import type { Request, Response } from "express";
import prisma from "../core/database";

export default {
	// Busca produtos do vendedor (Função auxiliar)
	async fetchProdutosVendedor(id_vendedor: number | string) {
		try {
			return await prisma.produto.findMany({
				where: { id_vendedor: Number(id_vendedor) },
				orderBy: { id_produto: "desc" },
			});
		} catch (error) {
			console.error("Erro ao carregar catálogo:", error);
			return [];
		}
	},

	// Busca categorias (Função auxiliar)
	async fetchCategorias() {
		try {
			return await prisma.categoria.findMany();
		} catch (error) {
			console.error("Erro ao buscar categorias:", error);
			return [];
		}
	},

	// Busca unidades de medida (Função auxiliar)
	async fetchUnidades() {
		try {
			// Obs: Verifique se no seu schema o model gerou como 'unidade_medida' ou 'unidadeMedida'
			return await prisma.unidadeMedida.findMany({
				orderBy: { nome_unidade_medida: "asc" },
			});
		} catch (error) {
			console.error("Erro ao buscar unidades:", error);
			return [];
		}
	},

	// GET /vendedor/produtos
	async getProdutosVendedor(req: Request, res: Response) {
		const id_vendedor = req.session.userId;

		if (!req.session.isAuthenticated || req.session.userRole !== "VENDEDOR") {
			return res
				.status(401)
				.json({ success: false, message: "Não autorizado." });
		}

		try {
			const produtos = await prisma.produto.findMany({
				where: { id_vendedor: Number(id_vendedor) },
				orderBy: { id_produto: "desc" },
			});

			return res.json({ success: true, produtos });
		} catch (error) {
			console.error("Erro ao buscar produtos:", error);
			return res.status(500).json({ success: false, message: "Erro interno." });
		}
	},

	// POST /vendedor/produtos
	async postProduto(req: Request, res: Response) {
		const id_vendedor = req.session.userId;

		if (!req.session.isAuthenticated || req.session.userRole !== "VENDEDOR") {
			return res
				.status(401)
				.json({ success: false, message: "Não autorizado." });
		}

		try {
			const {
				nome_produto,
				descricao,
				preco,
				estoque,
				id_categoria,
				id_unidade_medida,
				url_imagem,
			} = req.body;

			if (!nome_produto || !preco || !id_unidade_medida) {
				return res.status(400).json({
					success: false,
					message: "Preencha todos os campos obrigatórios.",
				});
			}

			if (Number(estoque) < 0) {
				return res.status(400).json({
					success: false,
					message: "Estoque não pode ser negativo.",
				});
			}

			// O create no Prisma exige a chave 'data'
			const novoProduto = await prisma.produto.create({
				data: {
					nome_produto,
					descricao,
					preco: Number(preco),
					estoque: estoque ? Number(estoque) : 0,
					id_categoria: id_categoria ? Number(id_categoria) : null,
					id_unidade_medida: Number(id_unidade_medida),
					url_imagem: url_imagem || null,
					id_vendedor: Number(id_vendedor),
					ativo: true,
				},
			});

			return res.status(201).json({
				success: true,
				message: "Produto cadastrado com sucesso!",
				produto: novoProduto,
			});
		} catch (error) {
			console.error("Erro ao cadastrar produto:", error);
			return res.status(500).json({
				success: false,
				message: "Erro interno ao cadastrar produto.",
			});
		}
	},

	// PUT /api/vendedor/produtos/:id
	async putProduto(req: Request, res: Response) {
		const id_vendedor = req.session.userId;
		const { id } = req.params;

		if (!req.session.isAuthenticated || req.session.userRole !== "VENDEDOR") {
			return res
				.status(401)
				.json({ success: false, message: "Não autorizado." });
		}

		try {
			// 1. Validar se o produto existe e pertence ao vendedor
			const produto = await prisma.produto.findFirst({
				where: {
					id_produto: Number(id),
					id_vendedor: Number(id_vendedor),
				},
			});

			if (!produto) {
				return res.status(404).json({
					success: false,
					message: "Produto não encontrado.",
				});
			}

			const {
				nome_produto,
				descricao,
				preco,
				estoque,
				id_categoria,
				id_unidade_medida,
				url_imagem,
				ativo,
			} = req.body;

			// Se apenas atualizando 'ativo', permite atualização parcial
			if (!nome_produto && typeof ativo === "undefined") {
				return res.status(400).json({
					success: false,
					message: "Preencha todos os campos obrigatórios.",
				});
			}

			if (nome_produto && (!preco || !id_unidade_medida)) {
				return res.status(400).json({
					success: false,
					message: "Preencha todos os campos obrigatórios.",
				});
			}

			if (typeof estoque !== "undefined" && Number(estoque) < 0) {
				return res.status(400).json({
					success: false,
					message: "Estoque não pode ser negativo.",
				});
			}

			const produtoAtualizado = await prisma.produto.update({
				where: { id_produto: Number(id) },
				data: {
					nome_produto,
					descricao,
					preco,
					estoque,
					id_categoria,
					id_unidade_medida,
					url_imagem,
					ativo,
				},
			});

			return res.json({
				success: true,
				message: "Produto atualizado com sucesso!",
				produto: produtoAtualizado,
			});
		} catch (error) {
			console.error("Erro ao atualizar produto:", error);
			return res.status(500).json({
				success: false,
				message: "Erro interno ao atualizar produto.",
			});
		}
	},
};
