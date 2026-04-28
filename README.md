<div align="center">
  <h1>Verdear</h1>
  <h3>Sua vitrine para o campo</h3>
</div>

<br>

Esse projeto está sendo desenvolvido para as disciplinas de **Fábrica de Software I** e **Fábrica de Software II** da **Universidade Tecnológica Federal do Paraná (UTFPR)**.

O principal objetivo do **Verdear** é facilitar a conexão do agricultor familiar com os consumidores, simplificando a venda de sua produção. Assim, o consumidor pode comprar diretamente do produtor, garantindo um produto de melhor qualidade, com menor preço e muito mais saudável.

---

## Tech Stack

- **[Bun][1]** - Motor JavaScript/TypeScript que também implementa funcionalidades para testes e um gerenciador de pacotes, além de ser extremamente rápido em tempo de execução.
- **[TypeScript][2]** - Linguagem de programação baseada no JavaScript, porém fortemente tipada. Isso facilita muito o desenvolvimento, pois reduz os erros relacionados ao uso de variáveis com os tipos incorretos.
- **[Express](https://expressjs.com)** - Framework web para rodar um servidor HTTP, expor as rotas do nosso MVC e utilizar middlewares simples para autenticação e tratamento de erros.
- **[Prisma ORM](https://prisma.io/orm)** - ORM para fazer a geração de modelagem no TypeScript e realizar migrações no banco de dados. Facilita a consistência e sincronização entre o código do projeto e o banco de dados, sem a necessidade de executar comandos SQL manualmente.
- **[EJS](https://ejs.co)** - Linguagem de marcação para fazer os templates das Views do MVC. Estamos em processo de migração para o Handlebars para facilitar o desenvolvimento futuro do projeto (e também porque a logo do Handlebars é melhor que a do EJS).
- **[Handlebars][3]** - Outra linguagem de marcação para templates. Esta suporta componentização nativa com os *partials*, o que permite reutilizar código da interface de uma maneira muito mais simples.
- **[PostgreSQL](https://www.postgresql.org)** - SGBD para o banco de dados relacional, responsável pela persistência dos dados da aplicação.

---

## Documentação

Para informações detalhadas sobre a configuração do ambiente, execução local e padrões do projeto, acesse a nossa **[Pasta de Documentações (docs/)](./docs)**.

---

## Equipe

## Integrantes no primeiro ciclo
- Ana Girelli
- Bruno Teles
- João Rickli
- Julia Goulart
- Tais Carvalho
- Tiago Marques

### Integrantes - Segundo Ciclo
| Nome do integrante | Função no projeto |
| ----------------- | ---------------- |
| Bruno Teles | Desenvolvedor Fullstack |
| Felipe Brostolin Ribeiro | Tech Lead e Desenvolvedor Fullstack |
| Felipe Franzoi Adames | UX/UI Designer |
| Matheus Otávio Holdys Ris | Desenvolvedor Frontend |
| Luiz Henrique Maiolini Machado | Desenvolvedor FullStack |
| João Rickli | Product Manager |
| Julia Goulart | Quality Assurance |
| Tais Carvalho | UX/UI Designer |
| William Pagani | Desenvolvedor FullStack |

[1]: https://bun.sh
[2]: https://typescriptlang.org
[3]: https://handlebarsjs.com
