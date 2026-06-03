import { join } from "node:path";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import session from "express-session";
import prisma from "./core/database.ts";
import chatRoutes from "./features/chat/chat.routes.ts";
import { errorHandler } from "./middlewares/errorMiddleware.ts";
import route from "./routes/route.ts";

//Instanciar o aplicativo express
const app = express();
const port = 3000;

//Uso de seções de usuário
app.use(
	session({
		secret: "textosecreto",
		resave: false, // Boa prática: evita salvar se não houver modificação
		saveUninitialized: false, // Boa prática: evita criar sessão para quem não logou
		cookie: { maxAge: 30 * 60 * 1000 },
	}),
); // Armazena a sessão por 30 minutos

// Define o EJS como motor de view padrão
app.set("view engine", "ejs");
// Suporta tanto views globais quanto views por feature (ex: "chat/views/inbox")
app.set("views", ["src/views", "src/features"]);
app.use(express.static(join(import.meta.dir, "public")));

// Middlewares
app.use(express.json()); //interpreta JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })); // Utilizado para interpretar dados de formulário (POST)

// Middleware de rastreamento de último acesso (para status online do chat).
// Atualiza no máximo a cada 60s para evitar escrita excessiva no banco.
const ULTIMO_ACESSO_THROTTLE_MS = 60 * 1000;
const ultimoUpdate = new Map<number, number>();

app.use(async (req: Request, res: Response, next: NextFunction) => {
	const userId = req.session?.userId;
	res.locals.userRole = req.session?.userRole ?? null;
	res.locals.userId = userId ?? null;
	res.locals.userName = req.session?.userName ?? null;

	if (userId) {
		const agora = Date.now();
		const ultima = ultimoUpdate.get(userId) ?? 0;
		if (agora - ultima > ULTIMO_ACESSO_THROTTLE_MS) {
			ultimoUpdate.set(userId, agora);
			prisma.pessoa
				.update({
					where: { id_pessoa: userId },
					data: { ultimo_acesso: new Date() },
				})
				.catch(() => {
					/* best-effort, não interrompe o request */
				});
		}
	}
	next();
});

app.use("/chat", chatRoutes);
app.use("/", route); //Usa as rotas do MVC (as definidas em mvc/routes/route.js)

app.use(errorHandler);

//Testar a conexão com o banco de dados
(async () => {
	try {
		await prisma.$queryRaw`select 1`;
		console.log("✅ Conexão com o banco bem-sucedida");
	} catch (error) {
		console.error("❌ Erro ao conectar com o banco:", error);
		process.exit(1);
	}
})();

app.listen(port, () => {
	console.log(`Servidor em execução no endereço http://localhost:${port}`);
});
