import type { Request, Response } from "express";
import { ErroNaoAutorizado, ErroValidacao } from "../../core/errors/erros.ts";
import { getIO } from "../../websocket/socket.server.ts";
import chatService from "./chat.service.ts";

export default {
	async viewInbox(req: Request, res: Response) {
		const userId = req.session.userId;
		if (!userId) throw new ErroNaoAutorizado();

		const chatsFormatados = await chatService.listarChatsUsuario(userId);

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

		const { interlocutor, mensagens, online } =
			await chatService.buscarChatPorId(idChat, userId);

		return res.render("chat/views/chat", {
			id_chat: idChat,
			nome_interlocutor: interlocutor?.nome_pessoa || "Usuário",
			id_interlocutor: interlocutor?.id_pessoa || 0,
			online,
			mensagens,
			userId,
		});
	},

	async iniciarChat(req: Request, res: Response) {
		const userId = req.session.userId;
		const userRole = req.session.userRole;
		if (!userId) throw new ErroNaoAutorizado();

		const { id_produto, id_venda, id_vendedor } = req.body;

		const chat = await chatService.iniciarChat({
			userId,
			userRole,
			id_vendedor,
			id_produto,
			id_venda,
		});

		return res.json({
			success: true,
			id_chat: chat.id_chat,
			redirect: `/chat/${chat.id_chat}`,
		});
	},

	async enviarMensagem(req: Request, res: Response) {
		const userId = req.session.userId;
		if (!userId) throw new ErroNaoAutorizado();

		const idChat = Number(req.params.id);
		const { conteudo } = req.body;

		if (Number.isNaN(idChat)) throw new ErroValidacao("ID inválido");

		const mensagem = await chatService.salvarMensagem(idChat, userId, conteudo);

		const payload = {
			...mensagem,
			propria: true,
			nome_autor: req.session.userName || "Usuário",
		};

		// Notifica via WebSocket para os participantes da sala em tempo real
		try {
			getIO().to(`chat:${idChat}`).emit("new_message", payload);
		} catch (_err) {
			// Se o socket ainda não estiver ativo/conectado, o fluxo REST segue normalmente
		}

		return res.status(201).json({
			success: true,
			mensagem: payload,
		});
	},

	async listarMensagensApos(req: Request, res: Response) {
		const userId = req.session.userId;
		if (!userId) throw new ErroNaoAutorizado();

		const idChat = Number(req.params.id);
		const apos = Number(req.query.apos ?? 0);

		if (Number.isNaN(idChat)) throw new ErroValidacao("ID inválido");

		const mensagens = await chatService.listarMensagensApos(
			idChat,
			userId,
			apos,
		);

		return res.json({
			success: true,
			mensagens,
		});
	},

	async contarNaoLidas(req: Request, res: Response) {
		const userId = req.session.userId;
		if (!userId) throw new ErroNaoAutorizado();

		const total = await chatService.contarNaoLidasTotal(userId);

		return res.json({ success: true, total });
	},

	async finalizarChat(req: Request, res: Response) {
		const userId = req.session.userId;
		if (!userId) throw new ErroNaoAutorizado();

		const idChat = Number(req.params.id);
		if (Number.isNaN(idChat)) throw new ErroValidacao("ID inválido");

		await chatService.finalizarChat(idChat, userId);

		try {
			getIO().to(`chat:${idChat}`).emit("chat_finalized", {
				id_chat: idChat,
				finalizadoPor: userId,
			});
		} catch (_err) {
			// Ignora falha de broadcast
		}

		return res.json({ success: true });
	},
};
