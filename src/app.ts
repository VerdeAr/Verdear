import { join } from "node:path";
import express from "express";
import session from "express-session";
import prisma from "./core/database.js";
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
app.set("views", "src/views");
app.use(express.static(join(import.meta.dir, "public")));

// Middlewares
app.use(express.json()); //interpreta JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })); // Utilizado para interpretar dados de formulário (POST)
app.use("/", route); //Usa as rotas do MVC (as definidas em mvc/routes/route.js)

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
