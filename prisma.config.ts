import { defineConfig } from "prisma/config";

const dbUrl = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?schema=public`;

console.log("Connecting to:", dbUrl); // remova depois de testar

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		url: dbUrl,
	},
});
