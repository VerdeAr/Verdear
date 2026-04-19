export class ErroGenerico extends Error {
	public readonly statusCode: number;

	constructor(mensagem: string, statusCode: number = 500) {
		super(mensagem);
		this.statusCode = statusCode;
		this.name = this.constructor.name;

		Error.captureStackTrace(this, this.constructor);
	}
}

export class ErroNotFound extends ErroGenerico {
	constructor(mensagem: string = "O recurso solicitado não foi encontrado.") {
		super(mensagem, 404);
	}
}

export class ErroConflito extends ErroGenerico {
	constructor(mensagem: string = "Já existe um registro com esses dados.") {
		super(mensagem, 409);
	}
}

export class ErroValidacao extends ErroGenerico {
	constructor(mensagem: string = "Dados fornecidos são inválidos.") {
		super(mensagem, 400);
	}
}

export class ErroNaoAutorizado extends ErroGenerico {
	constructor(
		mensagem: string = "Você não tem permissão para acessar este recurso.",
	) {
		super(mensagem, 401);
	}
}
