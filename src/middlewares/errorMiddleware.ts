import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ErroGenerico } from "../core/errors/erros";

export const errorHandler = (
	err: unknown,
	_: Request,
	res: Response,
	__: NextFunction,
) => {
	if (err instanceof ErroGenerico) {
		return res.status(err.statusCode).json({
			sucesso: false,
			mensagem: err.message,
		});
	}

	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		console.error(err);
		return res.status(400).json({
			sucesso: false,
			mensagem: "Oops ocorreu um erro",
		});
	}

	console.error("[ERRO INTERNO]:", err);
	return res.status(500).json({
		sucesso: false,
		mensagem: "Ocorreu um erro interno no servidor.",
	});
};
