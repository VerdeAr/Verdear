#!/bin/sh

echo "Executando migrações"
bunx --bun prisma migrate deploy

echo "Iniciando server"
bun src/app.ts
