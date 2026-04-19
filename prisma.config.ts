import { defineConfig } from "prisma/config";

const { DB_HOST, DB_PORT, DB_PASS, DB_USER, DB_DATABASE } = process.env;

const dbUrl = `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_DATABASE}?schema=public`;

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: dbUrl,
	},
});
