import express from "express";
import isAuthenticated from "../../middlewares/authMiddleware.ts";
import chatController from "./chat.controller.ts";

const chatRoutes = express.Router();

chatRoutes.use(isAuthenticated);

chatRoutes.get("/", chatController.viewInbox);
chatRoutes.get("/nao-lidas/count", chatController.contarNaoLidas);
chatRoutes.post("/iniciar", chatController.iniciarChat);
chatRoutes.get("/:id", chatController.viewChat);
chatRoutes.post("/:id/mensagem", chatController.enviarMensagem);
chatRoutes.get("/:id/mensagens", chatController.listarMensagensApos);
chatRoutes.post("/:id/finalizar", chatController.finalizarChat);

export default chatRoutes;
