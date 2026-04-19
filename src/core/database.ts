import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const { DB_HOST, DB_PORT, DB_PASS, DB_USER, DB_DATABASE } = process.env;
const dbUrl = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?schema=public`;

const prisma = new PrismaClient({
	adapter: new PrismaPg(dbUrl),
});

export default prisma;
