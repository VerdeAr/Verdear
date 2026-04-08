const isAuthenticated = (req, res, next) => {
	// 1. Verifica se o usuário está autenticado na sessão
	if (req.session?.isAuthenticated) {
		// Se estiver logado, continua para a próxima função da rota
		return next();
	}

	// 2. Se não estiver logado, redireciona para a página de login
	res.redirect("/");
};

export default isAuthenticated;
