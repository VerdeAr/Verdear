# Como desenvolver o projeto

### Desenvolver o projeto

1. É necessário instalar o motor JavaScript [Bun][1] para usar esse projeto.
2. Também é preciso instalar o [Docker][2] para subir um banco de dados local.
3. Execute o comando `bun install` para baixar as dependências.
4. Crie um arquivo `.env` na raiz do projeto e preencha as variáveis de ambiente, conforme especificado no arquivo `exemplo.env`. Sem o `.env` não é possível conectar ao banco.
5. Execute o comando `bunx --bun prisma generate`. Com isso, o Prisma ORM gera toda a modelagem do projeto a partir do esquema encontrado em: `prisma/schema.prisma`.
6. Use o comando `bun run dev`. Esse comando faz tudo automaticamente: ele inicia o banco de dados via Docker, aplica as migrações necessárias e roda o projeto em modo de desenvolvimento (reiniciando sozinho a cada nova alteração no código).


### Executar projeto localmente
Também é possível executar o projeto localmente para testes sem precisar configurar todo o ambiente de desenvolvimento. Isso é útil para testar a aplicação simulando um ambiente de produção.

1. Instale o [Docker][2]. Temos uma documentação mais completa sobre isso em `docs/DOCKER.md`.
2. Execute o comando `docker compose up --build -d`. Esse comando sobe o banco de dados e o projeto MVC prontos para uso.

### E se eu fizer uma alteração na modelagem?
Caso precise alterar a modelagem, modifique o esquema no arquivo `prisma/schema.prisma` e depois execute o comando `bunx --bun prisma generate` para atualizar as tipagens no projeto. 
Depois disso, execute o comando `bunx --bun prisma migrate dev`. Isso vai gerar um novo script SQL de migração e aplicá-lo ao seu banco local (para depois ser executado na base de testes e produção).

[1]: https://bun.sh
[2]: https://docs.docker.com/get-started
