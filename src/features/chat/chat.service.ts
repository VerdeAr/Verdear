import prisma from "../../core/database.ts";
import {
	ErroNaoAutorizado,
	ErroNotFound,
	ErroValidacao,
} from "../../core/errors/erros.ts";

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;
const TIMEZONE = "America/Sao_Paulo";

export function formatHora(data: Date): string {
	return data.toLocaleTimeString("pt-BR", {
		hour: "2-digit",
		minute: "2-digit",
		timeZone: TIMEZONE,
	});
}

export function formatDataRelativa(data: Date): string {
	const agora = new Date();
	const diffMs = agora.getTime() - data.getTime();
	const diffDias = Math.floor(diffMs / (24 * 60 * 60 * 1000));

	if (diffDias === 0) return formatHora(data);
	if (diffDias === 1) return "Ontem";
	if (diffDias < 7) {
		return data.toLocaleDateString("pt-BR", {
			weekday: "short",
			timeZone: TIMEZONE,
		});
	}
	return data.toLocaleDateString("pt-BR", {
		day: "2-digit",
		month: "2-digit",
		timeZone: TIMEZONE,
	});
}

export function isOnline(ultimoAcesso: Date | null | undefined): boolean {
	if (!ultimoAcesso) return false;
	return Date.now() - ultimoAcesso.getTime() < ONLINE_THRESHOLD_MS;
}

export interface IniciarChatParams {
	userId: number;
	userRole?: string;
	id_vendedor?: number | string;
	id_produto?: number | string;
	id_venda?: number | string;
}

interface ChatItemRaw {
	id_chat: number;
	status: string | null;
	id_cliente: number | null;
	id_vendedor: number | null;
	data_inicio: Date | null;
	pessoa_chat_id_clienteTopessoa: {
		id_pessoa: number;
		nome_pessoa: string | null;
		ultimo_acesso: Date | null;
	} | null;
	pessoa_chat_id_vendedorTopessoa: {
		id_pessoa: number;
		nome_pessoa: string | null;
		ultimo_acesso: Date | null;
	} | null;
	mensagens: Array<{
		id_mensagem: number;
		conteudo: string;
		id_autor: number;
		data_envio: Date;
	}>;
}

interface MensagemItemRaw {
	id_mensagem: number;
	id_chat: number;
	id_autor: number;
	conteudo: string;
	lida: boolean;
	data_envio: Date;
}

export const chatService = {
	async iniciarChat({
		userId,
		userRole,
		id_vendedor,
		id_produto,
		id_venda,
	}: IniciarChatParams) {
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

		// RN-47: O chat é exclusivo entre um Cliente e um Vendedor (não consigo mesmo)
		if (idVendedorFinal === userId) {
			throw new ErroValidacao("Você não pode iniciar um chat consigo mesmo");
		}

		// Valida se o vendedor existe e tem perfil de vendedor
		const vendedor = await prisma.pessoa.findUnique({
			where: { id_pessoa: idVendedorFinal },
			select: { id_pessoa: true, tipo_usuario: true },
		});

		if (vendedor?.tipo_usuario !== "VENDEDOR") {
			throw new ErroValidacao(
				"O destinatário informado não possui perfil de vendedor",
			);
		}

		// Verifica se já existe um chat ATIVO entre o cliente e vendedor
		const existente = await prisma.chat.findFirst({
			where: {
				id_cliente: idClienteFinal,
				id_vendedor: idVendedorFinal,
				status: "ATIVO",
			},
		});

		if (existente) {
			return existente;
		}

		// RN-48: Novo chat criado com status ATIVO
		const novoChat = await prisma.chat.create({
			data: {
				id_cliente: idClienteFinal,
				id_vendedor: idVendedorFinal,
				data_inicio: new Date(),
				status: "ATIVO",
			},
		});

		return novoChat;
	},

	async listarChatsUsuario(userId: number) {
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

		return Promise.all(
			(chats as unknown as ChatItemRaw[]).map(async (chat) => {
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
					status: chat.status,
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
	},

	async buscarChatPorId(idChat: number, userId: number) {
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

		// RN-49 a RN-53: Validação estrita de participante
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

		// Marca mensagens recebidas como lidas
		await prisma.mensagem.updateMany({
			where: {
				id_chat: idChat,
				id_autor: { not: userId },
				lida: false,
			},
			data: { lida: true },
		});

		const mensagensFormatadas = (mensagens as unknown as MensagemItemRaw[]).map(
			(m) => ({
				id_mensagem: m.id_mensagem,
				id_chat: m.id_chat,
				id_autor: m.id_autor,
				conteudo: m.conteudo,
				lida: m.lida,
				propria: m.id_autor === userId,
				hora: formatHora(m.data_envio),
				data_envio: m.data_envio.toISOString(),
			}),
		);

		return {
			chat,
			interlocutor,
			mensagens: mensagensFormatadas,
			online: isOnline(interlocutor?.ultimo_acesso),
		};
	},

	async validarParticipante(idChat: number, userId: number) {
		const chat = await prisma.chat.findUnique({
			where: { id_chat: idChat },
			select: {
				id_chat: true,
				id_cliente: true,
				id_vendedor: true,
				status: true,
			},
		});

		if (!chat) {
			throw new ErroNotFound("Chat não encontrado");
		}

		if (chat.id_cliente !== userId && chat.id_vendedor !== userId) {
			throw new ErroNaoAutorizado(
				"Acesso negado: você não é participante deste chat",
			);
		}

		return chat;
	},

	async salvarMensagem(idChat: number, idAutor: number, conteudo: string) {
		if (!conteudo || typeof conteudo !== "string" || !conteudo.trim()) {
			throw new ErroValidacao("A mensagem não pode ser vazia");
		}
		if (conteudo.length > 2000) {
			throw new ErroValidacao("Mensagem excede o limite de 2000 caracteres");
		}

		const chat = await this.validarParticipante(idChat, idAutor);

		// RN-48: Mensagens proibidas em chats finalizados
		if (chat.status === "FINALIZADO") {
			throw new ErroValidacao(
				"Essa conversa foi finalizada e não aceita novas mensagens",
			);
		}

		const agora = new Date();

		const [mensagem] = await prisma.$transaction([
			prisma.mensagem.create({
				data: {
					id_chat: idChat,
					id_autor: idAutor,
					conteudo: conteudo.trim(),
					data_envio: agora,
					lida: false,
				},
			}),
			prisma.chat.update({
				where: { id_chat: idChat },
				data: { data_ultima_mensagem: agora },
			}),
		]);

		return {
			id_mensagem: mensagem.id_mensagem,
			id_chat: mensagem.id_chat,
			id_autor: mensagem.id_autor,
			conteudo: mensagem.conteudo,
			lida: mensagem.lida,
			hora: formatHora(mensagem.data_envio),
			data_envio: mensagem.data_envio.toISOString(),
		};
	},

	async listarMensagensApos(idChat: number, userId: number, aposId: number) {
		await this.validarParticipante(idChat, userId);

		const mensagens = await prisma.mensagem.findMany({
			where: {
				id_chat: idChat,
				id_mensagem: { gt: aposId },
			},
			orderBy: { data_envio: "asc" },
		});

		const typedMensagens = mensagens as unknown as MensagemItemRaw[];
		const idsAlheias = typedMensagens
			.filter((m) => m.id_autor !== userId)
			.map((m) => m.id_mensagem);

		if (idsAlheias.length > 0) {
			await prisma.mensagem.updateMany({
				where: { id_mensagem: { in: idsAlheias }, lida: false },
				data: { lida: true },
			});
		}

		return typedMensagens.map((m) => ({
			id_mensagem: m.id_mensagem,
			id_chat: m.id_chat,
			id_autor: m.id_autor,
			conteudo: m.conteudo,
			propria: m.id_autor === userId,
			lida: m.lida,
			hora: formatHora(m.data_envio),
			data_envio: m.data_envio.toISOString(),
		}));
	},

	async marcarMensagensLidas(idChat: number, userId: number) {
		await this.validarParticipante(idChat, userId);

		const result = await prisma.mensagem.updateMany({
			where: {
				id_chat: idChat,
				id_autor: { not: userId },
				lida: false,
			},
			data: { lida: true },
		});

		return result.count;
	},

	async contarNaoLidasTotal(userId: number) {
		return prisma.mensagem.count({
			where: {
				id_autor: { not: userId },
				lida: false,
				chat: {
					OR: [{ id_cliente: userId }, { id_vendedor: userId }],
				},
			},
		});
	},

	async finalizarChat(idChat: number, userId: number) {
		await this.validarParticipante(idChat, userId);

		return prisma.chat.update({
			where: { id_chat: idChat },
			data: { status: "FINALIZADO" },
		});
	},
};

export default chatService;
