import type { Request, Response } from "express";
import prisma from "../../core/database.ts";
import {
	ErroNaoAutorizado,
	ErroNotFound,
	ErroValidacao,
} from "../../core/errors/erros.ts";

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

function formatHora(data: Date): string {
	return data.toLocaleTimeString("pt-BR", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatDataRelativa(data: Date): string {
	const agora = new Date();
	const diffMs = agora.getTime() - data.getTime();
	const diffDias = Math.floor(diffMs / (24 * 60 * 60 * 1000));

	if (diffDias === 0) return formatHora(data);
	if (diffDias === 1) return "Ontem";
	if (diffDias < 7) {
		return data.toLocaleDateString("pt-BR", { weekday: "short" });
	}
	return data.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
	});
}

function isOnline(ultimoAcesso: Date | null | undefined): boolean {
	if (!ultimoAcesso) return false;
	return Date.now() - ultimoAcesso.getTime() < ONLINE_THRESHOLD_MS;
}

export default {
	async viewInbox(req: Request, res: Response) {
		const userId = req.session.userId;
		if (!userId) throw new ErroNaoAutorizado();

		const chats = await prisma.chat.findMany({
			where: {
				OR: [{ id_cliente: userId }, { id_vendedor: userId }],
			},
			include: {
				pessoa_chat_id_clienteTopessoa: {
					select: {
						id_pessoa: true,
						nome_pessoa: true,
						ultimo_acesso: true,
					},
				},
				pessoa_chat_id_vendedorTopessoa: {
					select: {
						id_pessoa: true,
						nome_pessoa: true,
						ultimo_acesso: true,
					},
				},
				mensagens: {
					orderBy: { data_envio: "desc" },
					take: 1,
				},
			},
			orderBy: [
				{ data_ultima_mensagem: { sort: "desc", nulls: "last" } },
				{ data_inicio: "desc" },
			],
		});

		const chatsFormatados = await Promise.all(
			chats.map(async (chat) => {
				const isCliente = chat.id_cliente === userId;
				const interlocutor = isCliente
					? chat.pessoa_chat_id_vendedorTopessoa
					: chat.pessoa_chat_id_clienteTopessoa;

				const naoLidas = await prisma.mensagem.count({
					where: {
						id_chat: chat.id_chat,
						id_autor: { not: userId },
						lida: false,
					},
				});

				const ultimaMensagem = chat.mensagens[0];

				return {
					id_chat: chat.id_chat,
					nome_interlocutor:
						interlocutor?.nome_pessoa || "Usuário desconhecido",
					id_interlocutor: interlocutor?.id_pessoa || 0,
					online: isOnline(interlocutor?.ultimo_acesso),
					ultima_mensagem: ultimaMensagem
						? ultimaMensagem.conteudo.length > 60
							? `${ultimaMensagem.conteudo.slice(0, 60)}...`
							: ultimaMensagem.conteudo
						: "Conversa iniciada",
					ultima_mensagem_propria: ultimaMensagem?.id_autor === userId,
					data_formatada: ultimaMensagem
						? formatDataRelativa(ultimaMensagem.data_envio)
						: chat.data_inicio
							? formatDataRelativa(chat.data_inicio)
							: "",
					nao_lidas: naoLidas,
				};
			}),
		);

		return res.render("chat/views/inbox", {
			chats: chatsFormatados,
			userName: req.session.userName,
			userRole: req.session.userRole,
		});
	},

	async viewChat(req: Request, res: Response) {
		const userId = req.session.userId;
		if (!userId) throw new ErroNaoAutorizado();

		const idChat = Number(req.params.id);
		if (Number.isNaN(idChat)) throw new ErroValidacao("ID de chat inválido");

		const chat = await prisma.chat.findUnique({
			where: { id_chat: idChat },
			include: {
				pessoa_chat_id_clienteTopessoa: {
					select: {
						id_pessoa: true,
						nome_pessoa: true,
						ultimo_acesso: true,
					},
				},
				pessoa_chat_id_vendedorTopessoa: {
					select: {
						id_pessoa: true,
						nome_pessoa: true,
						ultimo_acesso: true,
					},
				},
			},
		});

		if (!chat) throw new ErroNotFound("Chat não encontrado");

		if (chat.id_cliente !== userId && chat.id_vendedor !== userId) {
			throw new ErroNaoAutorizado("Você não tem acesso a essa conversa");
		}

		const isCliente = chat.id_cliente === userId;
		const interlocutor = isCliente
			? chat.pessoa_chat_id_vendedorTopessoa
			: chat.pessoa_chat_id_clienteTopessoa;

		const mensagens = await prisma.mensagem.findMany({
			where: { id_chat: idChat },
			orderBy: { data_envio: "asc" },
		});

		await prisma.mensagem.updateMany({
			where: {
				id_chat: idChat,
				id_autor: { not: userId },
				lida: false,
			},
			data: { lida: true },
		});

		const mensagensFormatadas = mensagens.map((m) => ({
			id_mensagem: m.id_mensagem,
			conteudo: m.conteudo,
			propria: m.id_autor === userId,
			hora: formatHora(m.data_envio),
			data_envio: m.data_envio.toISOString(),
		}));

		return res.render("chat/views/chat", {
			id_chat: idChat,
			nome_interlocutor: interlocutor?.nome_pessoa || "Usuário",
			id_interlocutor: interlocutor?.id_pessoa || 0,
			online: isOnline(interlocutor?.ultimo_acesso),
			mensagens: mensagensFormatadas,
			userId,
		});
	},

	async iniciarChat(req: Request, res: Response) {
		const userId = req.session.userId;
		const userRole = req.session.userRole;
		if (!userId) throw new ErroNaoAutorizado();

		const { id_produto, id_venda, id_vendedor } = req.body;

		let idVendedorFinal: number | null = null;
		let idClienteFinal: number = userId;

		if (id_vendedor) {
			idVendedorFinal = Number(id_vendedor);
		} else if (id_produto) {
			const produto = await prisma.produto.findUnique({
				where: { id_produto: Number(id_produto) },
				select: { id_vendedor: true },
			});
			if (!produto?.id_vendedor) {
				throw new ErroNotFound("Produto sem vendedor associado");
			}
			idVendedorFinal = produto.id_vendedor;
		} else if (id_venda) {
			const venda = await prisma.venda.findUnique({
				where: { id_venda: Number(id_venda) },
				include: {
					vendaProdutos: {
						include: { produto: true },
						take: 1,
					},
				},
			});
			const vendedorId = venda?.vendaProdutos[0]?.produto?.id_vendedor;
			if (!vendedorId) {
				throw new ErroNotFound(
					"Não foi possível identificar o vendedor dessa venda",
				);
			}
			idVendedorFinal = vendedorId;
			idClienteFinal = venda?.id_cliente ?? userId;
		} else {
			throw new ErroValidacao("Informe id_produto, id_venda ou id_vendedor");
		}

		if (userRole === "VENDEDOR" && !id_venda) {
			throw new ErroValidacao(
				"Vendedores só iniciam chat a partir de uma venda",
			);
		}

		if (idVendedorFinal === userId) {
			throw new ErroValidacao("Você não pode iniciar um chat consigo mesmo");
		}

		const existente = await prisma.chat.findFirst({
			where: {
				id_cliente: idClienteFinal,
				id_vendedor: idVendedorFinal,
				status: "ATIVO",
			},
		});

		if (existente) {
			return res.json({
				success: true,
				id_chat: existente.id_chat,
				redirect: `/chat/${existente.id_chat}`,
			});
		}

		const novoChat = await prisma.chat.create({
			data: {
				id_cliente: idClienteFinal,
				id_vendedor: idVendedorFinal,
				data_inicio: new Date(),
				status: "ATIVO",
			},
		});

		return res.json({
			success: true,
			id_chat: novoChat.id_chat,
			redirect: `/chat/${novoChat.id_chat}`,
		});
	},

	async enviarMensagem(req: Request, res: Response) {
		const userId = req.session.userId;
		if (!userId) throw new ErroNaoAutorizado();

		const idChat = Number(req.params.id);
		const { conteudo } = req.body;

		if (Number.isNaN(idChat)) throw new ErroValidacao("ID inválido");
		if (!conteudo || typeof conteudo !== "string" || !conteudo.trim()) {
			throw new ErroValidacao("Mensagem vazia");
		}
		if (conteudo.length > 2000) {
			throw new ErroValidacao("Mensagem muito longa (máx 2000)");
		}

		const chat = await prisma.chat.findUnique({
			where: { id_chat: idChat },
			select: { id_cliente: true, id_vendedor: true, status: true },
		});

		if (!chat) throw new ErroNotFound("Chat não encontrado");
		if (chat.id_cliente !== userId && chat.id_vendedor !== userId) {
			throw new ErroNaoAutorizado();
		}
		if (chat.status === "FINALIZADO") {
			throw new ErroValidacao("Essa conversa foi finalizada");
		}

		const agora = new Date();

		const [mensagem] = await prisma.$transaction([
			prisma.mensagem.create({
				data: {
					id_chat: idChat,
					id_autor: userId,
					conteudo: conteudo.trim(),
					data_envio: agora,
				},
			}),
			prisma.chat.update({
				where: { id_chat: idChat },
				data: { data_ultima_mensagem: agora },
			}),
		]);

		return res.status(201).json({
			success: true,
			mensagem: {
				id_mensagem: mensagem.id_mensagem,
				conteudo: mensagem.conteudo,
				propria: true,
				hora: formatHora(mensagem.data_envio),
				data_envio: mensagem.data_envio.toISOString(),
			},
		});
	},

	async listarMensagensApos(req: Request, res: Response) {
		const userId = req.session.userId;
		if (!userId) throw new ErroNaoAutorizado();

		const idChat = Number(req.params.id);
		const apos = Number(req.query.apos ?? 0);

		if (Number.isNaN(idChat)) throw new ErroValidacao("ID inválido");

		const chat = await prisma.chat.findUnique({
			where: { id_chat: idChat },
			include: {
				pessoa_chat_id_clienteTopessoa: {
					select: { ultimo_acesso: true, id_pessoa: true },
				},
				pessoa_chat_id_vendedorTopessoa: {
					select: { ultimo_acesso: true, id_pessoa: true },
				},
			},
		});

		if (!chat) throw new ErroNotFound();
		if (chat.id_cliente !== userId && chat.id_vendedor !== userId) {
			throw new ErroNaoAutorizado();
		}

		const isCliente = chat.id_cliente === userId;
		const interlocutor = isCliente
			? chat.pessoa_chat_id_vendedorTopessoa
			: chat.pessoa_chat_id_clienteTopessoa;

		const mensagens = await prisma.mensagem.findMany({
			where: {
				id_chat: idChat,
				id_mensagem: { gt: apos },
			},
			orderBy: { data_envio: "asc" },
		});

		const idsAlheias = mensagens
			.filter((m) => m.id_autor !== userId)
			.map((m) => m.id_mensagem);

		if (idsAlheias.length > 0) {
			await prisma.mensagem.updateMany({
				where: { id_mensagem: { in: idsAlheias }, lida: false },
				data: { lida: true },
			});
		}

		return res.json({
			success: true,
			online: isOnline(interlocutor?.ultimo_acesso),
			mensagens: mensagens.map((m) => ({
				id_mensagem: m.id_mensagem,
				conteudo: m.conteudo,
				propria: m.id_autor === userId,
				hora: formatHora(m.data_envio),
				data_envio: m.data_envio.toISOString(),
			})),
		});
	},

	async contarNaoLidas(req: Request, res: Response) {
		const userId = req.session.userId;
		if (!userId) throw new ErroNaoAutorizado();

		const total = await prisma.mensagem.count({
			where: {
				id_autor: { not: userId },
				lida: false,
				chat: {
					OR: [{ id_cliente: userId }, { id_vendedor: userId }],
				},
			},
		});

		return res.json({ success: true, total });
	},

	async finalizarChat(req: Request, res: Response) {
		const userId = req.session.userId;
		if (!userId) throw new ErroNaoAutorizado();

		const idChat = Number(req.params.id);
		if (Number.isNaN(idChat)) throw new ErroValidacao();

		const chat = await prisma.chat.findUnique({
			where: { id_chat: idChat },
		});

		if (!chat) throw new ErroNotFound();
		if (chat.id_cliente !== userId && chat.id_vendedor !== userId) {
			throw new ErroNaoAutorizado();
		}

		await prisma.chat.update({
			where: { id_chat: idChat },
			data: { status: "FINALIZADO" },
		});

		return res.json({ success: true });
	},
};
