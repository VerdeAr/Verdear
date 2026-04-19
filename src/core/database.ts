import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

const { DB_HOST, DB_PORT, DB_PASS, DB_USER, DB_DATABASE } = process.env;
const dbUrl = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?schema=public&connect_timeout=30&pool_timeout=30`;

const prisma = new PrismaClient({
	adapter: new PrismaPg(dbUrl),
}).$extends({
	query: {
		async $allOperations({ args, query }) {
			let retries = 3;
			const delay = 3000;

			while (retries > 0) {
				try {
					return await query(args);
				} catch (error: unknown) {
					let isNetworkError = false;

					if (error instanceof Prisma.PrismaClientKnownRequestError) {
						isNetworkError =
							error.code === "ETIMEDOUT" || error.message.includes("ETIMEDOUT");
					} else if (error instanceof Prisma.PrismaClientInitializationError) {
						isNetworkError = error.message.includes("ETIMEDOUT");
					} else if (error instanceof Error) {
						isNetworkError =
							error.message.includes("ETIMEDOUT") ||
							("code" in error &&
								(error as { code?: string }).code === "ETIMEDOUT");
					}

					if (!isNetworkError) {
						throw error;
					}

					retries--;

					if (retries === 0) {
						console.error(
							`[Prisma] Banco de dados não acordou após várias tentativas.`,
						);
						throw error;
					}

					console.warn(
						`[Prisma] Banco dormindo (ETIMEDOUT). Aguardando ${delay}ms para tentar novamente... (${retries} tentativas restantes)`,
					);

					await new Promise((resolve) => setTimeout(resolve, delay));
				}
			}
		},
	},
});

export default prisma;
