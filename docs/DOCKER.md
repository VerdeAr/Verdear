# Guia de Setup com Docker - Projeto Verdear

Este guia contém as instruções para instalar o Docker e rodar o projeto utilizando o ambiente de containers com **Bun** e **Prisma**.

---

## 1. Instalação do Docker

Para rodar este projeto, você precisa do Docker e do Docker Compose V2 instalados.

### Windows / Mac
1. Baixe o [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Certifique-se de que o **WSL2** esteja ativado no Windows.
3. Reinicie o computador após a instalação.

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install docker.io docker-compose-plugin
sudo systemctl enable --now docker
# Opcional: rodar sem sudo
sudo usermod -aG docker $USER
```

---

## 2. Como Rodar o Projeto

O nosso ambiente utiliza **Multi-Stage Build** para manter a imagem final contendo apenas o necessário para a execução.

1. **Abra o terminal** na raiz do projeto.
2. **Suba os containers:**
   ```bash
   docker compose up --build
   ```
   *O comando `--build` garante que o `bun install` e o `prisma generate` sejam executados dentro do container.*

3. **Acesse a aplicação:**
   Acesse: [http://localhost:3000](http://localhost:3000)

4. **Encerrar execução:**
   `Ctrl + C` no terminal ou:
   ```bash
   docker compose down
   ```

---

## 3. Detalhes do Ambiente (Dockerfile e Execução)

O projeto utiliza a seguinte estratégia de build:

* **Runtime:** [Bun](https://bun.sh/) (oven/bun:alpine).
* **`.dockerignore`:** A pasta `node_modules` local é ignorada para evitar conflito de binários (como os do Prisma) entre a sua máquina e o container. O Docker fará a instalação do zero no ambiente Linux.
* **Stage 1 (Build):** Instala as dependências via `bun install --frozen-lockfile` e gera o cliente do Prisma (`prisma generate`).
* **Stage 2 (Run):** Copia do estágio de build apenas os arquivos necessários (`node_modules`, `src`, `prisma`, `package.json`, `tsconfig.json` e `prisma.config.ts`).
* **Execução (`start.sh`):** O container delega a inicialização para o script `start.sh`, que realiza duas etapas:
  1. Roda as migrações pendentes no banco (`bunx --bun prisma migrate deploy`).
  2. Inicia o servidor (`bun src/app.ts`) somente após a conclusão da migração.

---

## Notas Importantes

* **Prisma Client:** Sempre que você alterar o arquivo `schema.prisma` ou instalar uma nova dependência, você **deve** rodar o comando com `--build` para atualizar as configurações dentro do container.
* **Variáveis de Ambiente:** O projeto constrói a string de conexão de forma dinâmica. Certifique-se de que o seu `.env` possua as seguintes variáveis:
  * `DB_HOST`
  * `DB_PORT`
  * `DB_USER`
  * `DB_PASS`
  * `DB_DATABASE`
* **Persistência:** O banco de dados Postgres utiliza o volume `pgdata` configurado no docker-compose para garantir que seus dados não sejam apagados ao desligar ou remover os containers.
* **Migrações Automáticas:** Você não precisa rodar migrações manualmente após o container subir. O `start.sh` garante que o banco de dados esteja sempre sincronizado com o Prisma antes do backend iniciar.
