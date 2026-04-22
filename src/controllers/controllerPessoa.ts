import type { Categoria, Produto, UnidadeMedida } from "@prisma/client";
import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import prisma from "../core/database";
import {
	ErroNaoAutorizado,
	ErroNotFound,
	ErroValidacao,
} from "../core/errors/erros";

const BCRYPT_ROUNDS = 10;

export default {
	async authenticate(req: Request, res: Response) {
		const { email, senha } = req.body;

		if (!email || !senha) {
			return res.render("login", {
				error: "Por favor, preencha todos os campos",
			});
		}

		const pessoa = await prisma.pessoa.findFirst({
			where: { email },
		});

		if (!pessoa || !pessoa.senha) {
			return res.render("login", { error: "E-mail ou senha inválidos" });
		}

		const senhaValida = await bcrypt.compare(senha, pessoa.senha);
		if (!senhaValida) {
			return res.render("login", { error: "E-mail ou senha inválidos" });
		}

		if (!req.session) {
			console.error("Sessão não disponível");
			return res.render("login", {
				error: "Erro de sessão. Tente novamente.",
			});
		}

		req.session.isAuthenticated = true;
		req.session.userId = pessoa.id_pessoa;
		req.session.userName = pessoa.nome_pessoa || "";
		req.session.userEmail = pessoa.email;
		req.session.userRole = pessoa.tipo_usuario || "";

		return res.redirect("/home");
	},

	async putCadastro(req: Request, res: Response) {
		const userId = req.session.userId;

		if (!userId) {
			throw new ErroNaoAutorizado();
		}

		const { nome_pessoa, email } = req.body;

		const updated = await prisma.pessoa.updateMany({
			where: { id_pessoa: Number(userId) },
			data: { nome_pessoa, email },
		});

		if (updated.count === 0) {
			throw new ErroNotFound();
		}

		req.session.userName = nome_pessoa;
		req.session.userEmail = email;

		return res.json({
			success: true,
			message: "Cadastro atualizado com sucesso!",
		});
	},

	async putSenha(req: Request, res: Response) {
		const userId = req.session.userId;

		if (!userId) {
			throw new ErroNaoAutorizado();
		}

		const { senhaAtual, novaSenha, confirmarSenha } = req.body;

		const pessoa = await prisma.pessoa.findUnique({
			where: { id_pessoa: Number(userId) },
		});

		if (!pessoa) {
			throw new ErroNotFound("Usuário não encontrado");
		}

		if (!pessoa.senha) {
			throw new ErroValidacao("Usuário sem senha cadastrada");
		}

		const senhaAtualValida = await bcrypt.compare(senhaAtual, pessoa.senha);
		if (!senhaAtualValida) {
			throw new ErroValidacao("As senhas não conferem");
		}

		if (novaSenha !== confirmarSenha) {
			throw new ErroValidacao("A nova senha e a confirmação não coincidem");
		}

		const novaSenhaHash = await bcrypt.hash(novaSenha, BCRYPT_ROUNDS);

		await prisma.pessoa.update({
			where: { id_pessoa: Number(userId) },
			data: { senha: novaSenhaHash },
		});

		return res.json({
			success: true,
			message: "Senha redefinida com sucesso!",
		});
	},

	async registerFromForm(req: Request, res: Response) {
		const { nome_pessoa, cpf, email, senha, tipo_usuario } = req.body;

		if (!nome_pessoa || !cpf || !email || !senha || !tipo_usuario) {
			return res.render("cadastro", {
				error: "Por favor, preencha todos os campos obrigatórios.",
			});
		}

		const cpfLimpo = cpf.replace(/\D/g, "");
		if (cpfLimpo.length !== 11) {
			return res.render("cadastro", {
				error: "CPF deve conter exatamente 11 dígitos numéricos.",
			});
		}

		const pessoaExistente = await prisma.pessoa.findFirst({
			where: {
				OR: [{ cpf: cpfLimpo }, { email: email }],
			},
		});

		if (pessoaExistente) {
			if (pessoaExistente.cpf === cpfLimpo) {
				return res.render("cadastro", {
					error: "CPF já cadastrado. Use outro CPF ou faça login.",
				});
			}
			if (pessoaExistente.email === email) {
				return res.render("cadastro", {
					error: "E-mail já cadastrado. Use outro e-mail ou faça login.",
				});
			}
		}

		const senhaHash = await bcrypt.hash(senha, BCRYPT_ROUNDS);

		await prisma.pessoa.create({
			data: {
				nome_pessoa,
				cpf: cpfLimpo,
				email,
				senha: senhaHash,
				tipo_usuario,
				frete_fixo: tipo_usuario === "VENDEDOR" ? 0.0 : null,
			},
		});

		return res.redirect("/");
	},

	async putFrete(req: Request, res: Response) {
		const userId = req.session.userId;

		const { frete_fixo } = req.body;

		const pessoa = await prisma.pessoa.findUnique({
			where: { id_pessoa: Number(userId) },
		});

		if (!pessoa) {
			return res
				.status(404)
				.json({ success: false, message: "Usuário não encontrado." });
		}

		if (pessoa.tipo_usuario !== "VENDEDOR") {
			return res.status(403).json({
				success: false,
				message: "Apenas vendedores podem configurar frete.",
			});
		}

		await prisma.pessoa.update({
			where: { id_pessoa: Number(userId) },
			data: { frete_fixo: frete_fixo ? Number(frete_fixo) : 0.0 },
		});

		return res.json({
			success: true,
			message: "Frete atualizado com sucesso!",
		});
	},

	async getFrete(userId: string | number) {
		const pessoa = await prisma.pessoa.findUnique({
			where: { id_pessoa: Number(userId) },
			select: { frete_fixo: true },
		});
		return pessoa ? pessoa.frete_fixo : null;
	},

	async viewGestaoPessoa(req: Request, res: Response) {
		const userId = Number(req.session.userId);
		const role = req.session.userRole;

		let catalogo: (Produto & {
			categoria: Categoria | null;
			unidadeMedida: UnidadeMedida | null;
		})[] = [];

		// Para vendedor: busca vendas que contenham algum produto seu.
		// Para cliente: busca vendas em que ele é o comprador.
		const whereVendas =
			role === "VENDEDOR"
				? {
						vendaProdutos: {
							some: { produto: { id_vendedor: userId } },
						},
					}
				: { id_cliente: userId };

		const vendas = await prisma.venda.findMany({
			where: whereVendas,
			orderBy: { data_venda: "desc" },
			include: {
				vendaProdutos: {
					include: {
						produto: true,
					},
				},
				avaliacoes:
					role === "VENDEDOR"
						? true
						: {
								where: {
									id_cliente: userId,
								},
							},
				cliente: {
					select: {
						id_pessoa: true,
						nome_pessoa: true,
					},
				},
			},
		});

		// Mapeamos para manter a estrutura que sua View (EJS/HBS) provavelmente espera
		const pedidos = vendas.map((venda) => ({
			...venda,
			itens: venda.vendaProdutos.map((item) => ({
				...item,
				produto: item.produto,
			})),
			avaliacao: venda.avaliacoes.length > 0 ? venda.avaliacoes[0] : null,
		}));

		if (role === "VENDEDOR") {
			// Usando Prisma diretamente (se preferir, pode voltar para sua função de controllerProduto)
			catalogo = await prisma.produto.findMany({
				where: { id_vendedor: userId },
				include: {
					categoria: true,
					unidadeMedida: true,
				},
			});
		}

		const pessoaInfo = await prisma.pessoa.findUnique({
			where: { id_pessoa: userId },
			select: { frete_fixo: true },
		});
		const frete_fixo = pessoaInfo ? pessoaInfo.frete_fixo : null;

		// Usando Prisma diretamente para categorias e unidades (ou chame seu controller se tiver lógicas complexas neles)
		const categorias = await prisma.categoria.findMany();
		const unidades = await prisma.unidadeMedida.findMany();

		res.render("gestao_cadastro", {
			name: req.session.userName,
			email: req.session.userEmail,
			role: role,
			id: userId,
			catalogo,
			categorias,
			unidades,
			pedidos,
			frete_fixo,
		});
	},
};
