import type { Request, Response } from "express";
import prisma from "../core/database.ts";

export default {
	async viewHome(_: Request, res: Response) {
		const produtos = await prisma.produto.findMany({
			where: { ativo: true },
			take: 6,
			orderBy: { id_produto: "asc" },
		});

		// Busca todas as categorias
		const categorias = await prisma.categoria.findMany({
			orderBy: { id_categoria: "asc" },
		});

		const categoriasFormatadas = categorias.map((cat) => ({
			id: cat.id_categoria,
			name: cat.nome_categoria,
		}));

		return res.render("home", { produtos, categorias: categoriasFormatadas });
	},

	async viewProdutosPorCategoria(req: Request, res: Response) {
		const id = Number(req.params.id);

		const produtos = await prisma.produto.findMany({
			where: {
				id_categoria: id,
				ativo: true,
			},
			orderBy: { id_produto: "asc" },
		});

		const categorias = await prisma.categoria.findMany({
			orderBy: { id_categoria: "asc" },
		});

		const categoriasFormatadas = categorias.map((cat) => ({
			id: cat.id_categoria,
			name: cat.nome_categoria,
		}));

		return res.render("home", {
			produtos,
			categorias: categoriasFormatadas,
		});
	},

	async searchProducts(req: Request, res: Response) {
		const q = (req.query.q || req.query.query || "") as string;

		if (!q || q.trim() === "") {
			const produtos = await prisma.produto.findMany({
				where: { ativo: true },
				take: 6,
				orderBy: { id_produto: "asc" },
			});

			const categorias = await prisma.categoria.findMany({
				orderBy: { id_categoria: "asc" },
			});

			return res.render("home", {
				produtos,
				categorias: categorias.map((cat) => ({
					id: cat.id_categoria,
					name: cat.nome_categoria,
				})),
				categoriaAtual: null,
			});
		}

		// Busca no Prisma usando 'contains' com 'mode: insensitive' (substitui o iLike)
		const produtos = await prisma.produto.findMany({
			where: {
				ativo: true,
				OR: [
					{
						nome_produto: {
							contains: q,
							mode: "insensitive",
						},
					},
					{
						descricao: {
							contains: q,
							mode: "insensitive",
						},
					},
				],
			},
			orderBy: { id_produto: "asc" },
		});

		const categorias = await prisma.categoria.findMany({
			orderBy: { id_categoria: "asc" },
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
	},
};
