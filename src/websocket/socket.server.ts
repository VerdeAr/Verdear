import type http from "node:http";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { type Socket, Server as SocketIOServer } from "socket.io";
import chatService from "../features/chat/chat.service.ts";

export interface AuthenticatedUser {
	userId: number;
	userName: string;
	userEmail: string;
	userRole: string;
}

export interface CustomSocket extends Socket {
	data: {
		user?: AuthenticatedUser;
	};
}

export const JWT_SECRET = process.env.JWT_SECRET || "verdear-secret-key-2026";

export function signUserToken(payload: AuthenticatedUser): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyUserToken(token: string): AuthenticatedUser | null {
	try {
		return jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
	} catch {
		return null;
	}
}

function getErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof Error) return error.message;
	return fallback;
}

let ioInstance: SocketIOServer | null = null;

export function initSocketServer(httpServer: http.Server): SocketIOServer {
	const io = new SocketIOServer(httpServer, {
		cors: {
			origin: true,
			credentials: true,
		},
	});

	// Middleware de Handshake com autenticação JWT via cookie
	io.use((socket: CustomSocket, next) => {
		let token: string | undefined;

		// 1. Extração do cookie HTTP enviado pelo cliente
		const rawCookie = socket.handshake.headers.cookie;
		if (rawCookie) {
			const parsedCookies = cookie.parse(rawCookie);
			token = parsedCookies.auth_token || parsedCookies.token;
		}

		// 2. Fallback: payload de autenticação manual (socket = io({ auth: { token } }))
		if (!token && socket.handshake.auth?.token) {
			token = String(socket.handshake.auth.token);
		}

		// 3. Fallback: Header Authorization Bearer
		if (!token && socket.handshake.headers.authorization) {
			const parts = socket.handshake.headers.authorization.split(" ");
			if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
				token = parts[1];
			}
		}

		if (!token) {
			return next(new Error("Não autorizado: token JWT ausente"));
		}

		const decoded = verifyUserToken(token);
		if (!decoded) {
			return next(new Error("Não autorizado: token JWT inválido ou expirado"));
		}

		socket.data.user = decoded;
		return next();
	});

	io.on("connection", (socket: CustomSocket) => {
		const user = socket.data.user;
		if (!user) {
			socket.disconnect(true);
			return;
		}

		// Ingressa em uma sala privada com o id do próprio usuário para notificações
		socket.join(`user:${user.userId}`);

		// Evento: Entrar na sala do chat (validação de participante)
		socket.on(
			"join_chat",
			async (
				data: { id_chat: number },
				callback?: (res: {
					success: boolean;
					error?: string;
					room?: string;
				}) => void,
			) => {
				try {
					const idChat = Number(data?.id_chat);
					if (!idChat || Number.isNaN(idChat)) {
						callback?.({ success: false, error: "ID de chat inválido" });
						return;
					}

					await chatService.validarParticipante(idChat, user.userId);
					const room = `chat:${idChat}`;
					socket.join(room);
					callback?.({ success: true, room });
				} catch (error: unknown) {
					callback?.({
						success: false,
						error: getErrorMessage(error, "Erro ao entrar na sala do chat"),
					});
				}
			},
		);

		// Evento: Sair da sala do chat
		socket.on("leave_chat", (data: { id_chat: number }) => {
			const idChat = Number(data?.id_chat);
			if (idChat) {
				socket.leave(`chat:${idChat}`);
			}
		});

		// Evento: Enviar mensagem em tempo real com persistência no banco
		socket.on(
			"send_message",
			async (
				data: { id_chat: number; conteudo: string },
				callback?: (res: {
					success: boolean;
					error?: string;
					mensagem?: unknown;
				}) => void,
			) => {
				try {
					const idChat = Number(data?.id_chat);
					const conteudo = data?.conteudo;

					if (!idChat || Number.isNaN(idChat)) {
						callback?.({ success: false, error: "ID de chat inválido" });
						return;
					}

					// Salva no banco via Prisma (validando RN-47 e RN-48)
					const mensagemSalva = await chatService.salvarMensagem(
						idChat,
						user.userId,
						conteudo,
					);

					const payload = {
						id_mensagem: mensagemSalva.id_mensagem,
						id_chat: mensagemSalva.id_chat,
						id_autor: mensagemSalva.id_autor,
						nome_autor: user.userName,
						conteudo: mensagemSalva.conteudo,
						hora: mensagemSalva.hora,
						data_envio: mensagemSalva.data_envio,
						lida: mensagemSalva.lida,
					};

					// Broadcast para todos os membros conectados na sala do chat
					io.to(`chat:${idChat}`).emit("new_message", payload);

					callback?.({ success: true, mensagem: payload });
				} catch (error: unknown) {
					callback?.({
						success: false,
						error: getErrorMessage(error, "Erro ao processar mensagem"),
					});
				}
			},
		);

		// Evento: Indicador de digitação (typing indicator)
		socket.on(
			"typing_indicator",
			(data: { id_chat: number; is_typing: boolean }) => {
				const idChat = Number(data?.id_chat);
				if (idChat) {
					socket.to(`chat:${idChat}`).emit("user_typing", {
						id_chat: idChat,
						userId: user.userId,
						userName: user.userName,
						is_typing: Boolean(data.is_typing),
					});
				}
			},
		);

		// Evento: Marcação de mensagens como lidas
		socket.on(
			"message_read",
			async (
				data: { id_chat: number },
				callback?: (res: {
					success: boolean;
					count?: number;
					error?: string;
				}) => void,
			) => {
				try {
					const idChat = Number(data?.id_chat);
					if (idChat) {
						const count = await chatService.marcarMensagensLidas(
							idChat,
							user.userId,
						);
						socket.to(`chat:${idChat}`).emit("messages_read", {
							id_chat: idChat,
							readBy: user.userId,
							count,
						});
						callback?.({ success: true, count });
					}
				} catch (error: unknown) {
					callback?.({
						success: false,
						error: getErrorMessage(error, "Erro ao marcar como lida"),
					});
				}
			},
		);
	});

	ioInstance = io;
	return io;
}

export function getIO(): SocketIOServer {
	if (!ioInstance) {
		throw new Error("Socket.IO não foi inicializado ainda");
	}
	return ioInstance;
}

export default {
	initSocketServer,
	getIO,
	signUserToken,
	verifyUserToken,
	JWT_SECRET,
};
