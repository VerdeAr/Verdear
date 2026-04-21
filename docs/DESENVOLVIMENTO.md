# Como desenvolver o projeto

### Desenvolver o projeto
1. É necessário instalar o motor de Javascript [Bun][1] para usar esse projeto.
2. Também, é preciso instalar o [Docker][2] para subir um banco de dados local.
3. Execute o commando ```bun install``` para baixar as dependências.
4. Crie um arquivo ``.env`` na raíz do projeto, nele preencha as variáveis de ambiente, conforme especificado no ```exemplo.env```. Sem a ``.env`` não é posível conectar ao banco.
5. Depois execute o commando ```bunx --bun prisma generate```, com isso o Prisma ORM gera toda a modelagem do projeto a partir do esquema encontrado em: ``prisma/schema.prisma``.
6. Execute ```docker compose up banco -d``` para iniciar o banco de dados.
7. Para migrar a modelagem para o banco use ```bunx --bun migrate dev```, assim toda as tabelas necessárias serão automáticamente criadas no seu banco local.
8. Use o comando ```bun run dev``` para rodar o projeto no modo de desenvolvimento, no qual ao salvar suas alterações no código ele automaticamente reinicia o servidor, facilitando o teste de novas funcionalidades.

### Executar projeto localmente
Também é possível executar o projeto localmente para testes sem precisar configurar todo o ambiente de desenvolvimento. Isso é útil para testar a aplicação simulando um ambiente de produção.

1. Instale o [Docker][2], tem uma documentação mais completa sobre em ``docs/DOCKER.md``
2. Execute o comando ``docker compose up --build -d``, esse comando sobe o banco de dados e o projeto MVC.


### E se eu fazer uma alteração na modelagem?
Caso fizer uma alteração de modelagem, você altera o esquema no ``prisma/schema.prisma`` e depois faz o comando ``bunx --bun prisma generate`` para atualizar seu projeto com a nova modelagem. 
Depois disso, execute o commando ``bunx --bun prisma migrate dev``, isso vai gerar um novo script sql de migração para depois ser executado na base de testes e produção.

[1]: https://bun.com
[2]: https//docs.docker.com/get-started
