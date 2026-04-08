import { Op } from "sequelize";
import { Pessoa } from "../models/index.js";

export default {
	async authenticate(req, res) {
		try {
			const { email, senha } = req.body; // Captura dados do formulário

			if (!email || !senha) {
				return res.render("login", {
					error: "Por favor, preencha todos os campos",
				});
			}

			const pessoa = await Pessoa.findOne({ where: { email } }); // Busca usuário pelo e-mail

			// Verifica se o usuário existe e se a senha está correta
			if (!pessoa || pessoa.senha !== senha) {
				return res.render("login", { error: "E-mail ou senha inválidos" });
			}

			// Verifica se a sessão está disponível
			if (!req.session) {
				console.error("Sessão não disponível");
				return res.render("login", {
					error: "Erro de sessão. Tente novamente.",
				});
			}

			// Salva na sessão
			req.session.isAuthenticated = true;
			req.session.userId = pessoa.id_pessoa;
			req.session.userName = pessoa.nome_pessoa;
			req.session.userEmail = pessoa.email;
			req.session.userRole = pessoa.tipo_usuario;

			return res.redirect("/home"); //Direciona para a home após login bem-sucedido
		} catch (error) {
			console.error("Erro de autenticação:", error);
			console.error("Stack trace:", error.stack);
			return res.render("login", { error: "Erro interno do servidor." });
		}
	},

	// ATUALIZAR NOME + EMAIL DO USUÁRIO LOGADO
	async putCadastro(req, res) {
		const userId = req.session.userId; //Assume o ID da sessão

		if (!userId) {
			return res
				.status(401)
				.json({ success: false, message: "Usuário não autenticado." });
		}

		try {
			const { nome_pessoa, email } = req.body;
			//Tenta realizar o update
			const [updated] = await Pessoa.update(
				{ nome_pessoa, email },
				{ where: { id_pessoa: userId } },
			);
			// Se nenhum registro foi encontrado/atualizado
			if (updated === 0) {
				return res
					.status(404)
					.json({ success: false, message: "Cadastro não encontrado." });
			}
			// Atualiza os dados na sessão
			req.session.userName = nome_pessoa;
			req.session.userEmail = email;

			return res.json({
				success: true,
				message: "Cadastro atualizado com sucesso!",
			});
		} catch (error) {
			console.error("Erro ao atualizar cadastro:", error);
			return res.status(500).json({
				success: false,
				message: "Erro interno ao atualizar cadastro.",
				details: error.message,
			});
		}
	},

	// ATUALIZAR SENHA
	async putSenha(req, res) {
		const userId = req.session.userId; //Assume o ID da sessão

		if (!userId) {
			return res
				.status(401)
				.json({ success: false, message: "Usuário não autenticado." });
		}

		try {
			const { senhaAtual, novaSenha, confirmarSenha } = req.body;

			const pessoa = await Pessoa.findByPk(userId);
			//Validações antes de atualizar no banco
			if (!pessoa) {
				return res
					.status(404)
					.json({ success: false, message: "Usuário não encontrado." });
			}

			if (pessoa.senha !== senhaAtual) {
				return res
					.status(400)
					.json({ success: false, message: "Senha atual incorreta." });
			}

			if (novaSenha !== confirmarSenha) {
				return res.status(400).json({
					success: false,
					message: "A nova senha e a confirmação não coincidem.",
				});
			}

			// Atualiza a senha no banco de dados
			const [updated] = await Pessoa.update(
				{ senha: novaSenha },
				{ where: { id_pessoa: userId } },
			);
			// Se nenhum registro foi encontrado/atualizado
			if (updated === 0) {
				return res
					.status(404)
					.json({ success: false, message: "Senha não atualizada." });
			}

			return res.json({
				success: true,
				message: "Senha redefinida com sucesso!",
			});
		} catch (error) {
			console.error("Erro ao atualizar senha:", error);
			return res.status(500).json({
				success: false,
				message: "Erro interno ao redefinir senha.",
				details: error.message,
			});
		}
	},

	// POST /cadastrar - registra e redireciona para login
	async registerFromForm(req, res) {
		try {
			const { nome_pessoa, cpf, email, senha, tipo_usuario } = req.body;

			// Validação dos campos obrigatórios
			if (!nome_pessoa || !cpf || !email || !senha || !tipo_usuario) {
				return res.render("cadastro", {
					error: "Por favor, preencha todos os campos obrigatórios.",
				});
			}

			// Validação do CPF (deve ter 11 dígitos numéricos)
			const cpfLimpo = cpf.replace(/\D/g, ""); // Remove caracteres não numéricos
			if (cpfLimpo.length !== 11) {
				return res.render("cadastro", {
					error: "CPF deve conter exatamente 11 dígitos numéricos.",
				});
			}

			// Verifica se já existe um usuário com o mesmo CPF ou email
			const pessoaExistente = await Pessoa.findOne({
				where: {
					[Op.or]: [{ cpf: cpfLimpo }, { email: email }],
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

			// Cria a pessoa com os dados validados
			await Pessoa.create({
				nome_pessoa,
				cpf: cpfLimpo,
				email,
				senha,
				tipo_usuario,
				frete_fixo: tipo_usuario === "VENDEDOR" ? 0.0 : null,
			});

			return res.redirect("/");
		} catch (error) {
			console.error("Erro no cadastro via formulário:", error);
			return res.render("cadastro", { error: errorMessage });
		}
	},

	// ATUALIZAR FRETE FIXO (para vendedores)
	async putFrete(req, res) {
		const userId = req.session.userId;

		if (!userId) {
			return res
				.status(401)
				.json({ success: false, message: "Usuário não autenticado." });
		}

		try {
			const { frete_fixo } = req.body;

			const pessoa = await Pessoa.findByPk(userId);
			if (!pessoa) {
				return res
					.status(404)
					.json({ success: false, message: "Usuário não encontrado." });
			}

			// Apenas vendedores podem configurar frete
			if (pessoa.tipo_usuario !== "VENDEDOR") {
				return res.status(403).json({
					success: false,
					message: "Apenas vendedores podem configurar frete.",
				});
			}

			const [updated] = await Pessoa.update(
				{ frete_fixo: frete_fixo || 0 },
				{ where: { id_pessoa: userId } },
			);

			if (updated === 0) {
				return res.status(400).json({
					success: false,
					message: "Não foi possível atualizar o frete.",
				});
			}

			return res.json({
				success: true,
				message: "Frete atualizado com sucesso!",
			});
		} catch (error) {
			console.error("Erro ao atualizar frete:", error);
			return res
				.status(500)
				.json({ success: false, message: "Erro interno ao atualizar frete." });
		}
	},

	// Função para recuperar o frete do usuário
	async getFrete(userId) {
		try {
			const pessoa = await Pessoa.findByPk(userId);
			return pessoa ? pessoa.frete_fixo : null;
		} catch (error) {
			console.error("Erro ao obter frete do usuário:", error);
			return null;
		}
	},
};
