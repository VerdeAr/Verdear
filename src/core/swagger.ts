import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";

const specPath = join(process.cwd(), "docs", "openapi.yaml");
const openapiSpec = YAML.parse(readFileSync(specPath, "utf-8"));

export function mountSwagger(app: Express, path = "/api-docs"): void {
	app.use(path, swaggerUi.serve, swaggerUi.setup(openapiSpec));
	app.get("/openapi.json", (_, res) => res.json(openapiSpec));
}
