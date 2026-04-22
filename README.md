<div>
    <h3>Verdear</h3>
    <h4>Sua vitrine para o campo</h4>
</div>


Esse projeto está sendo desenvolvido para a máteria de **Fábrica de Software I** e **Fábrica de Software de Software II** da **Universidade Tecnológica Federal do Paraná (UTFPR)**.

O principal objetivo do **Verdear** é facilitar a conexão do agricultor familiar com consumidores, dessa forma facilitando a venda de sua produção. Assim, o consumidor pode comprar algo diretamente do produtor garantindo um produto de melhor qualidade, menor preço e até mais saudável.

## Tech Stack

- **[Bun][1]** -  é um motor de Javascript/Typescript que também implementa funcionalidades para testes e um gerenciador de pacotes, além de ser extremamente rápido em tempo de execução. 

- **[Typescript][2]** - linguagem de programação baseada no Javascript, porém é fortemente tipada isso facilita muito o desenvolvimento, pois reduz os erros relacionados ao uso de variáveis com os tipos incorretos.

- **[Express](https://expressjs.com)** - framework web para rodar um servidor HTTP e expor as rotas do nosso MVC e ter middlewares simples para autenticação e tratamento de erros.

- **[Prisma ORM](https://prisma.io/orm)** - ORM para fazer a geração de modelagem no **[Typescript][2]** e também realizar migrações no banco de dados, dessa forma facilitando a consistência e sincronização entre o código do projeto e o banco de dados, sem a necessidade de executar comandos SQL manualmente.

- **[EJS](https://ejs.co)** - Consiste em uma linguagem de marcação para fazer os templates das Views do MVC. Estamos trocando ele pelo [Handlebars][3] para facilitar o desenvolvimento futuro do projeto (também porque a logo do [Handlebars][3] é melhor que a logo do EJS).

- **[Handlebars][3]** - Outras linguagem de marcação para os templates, porém esta suporta fazer componentização com os partials, o que permite reutilizar código de uma maneira simples.

- **[PostgreSQL](https:www.postgresql.org)** - SGDB para o banco de dados, com ele fazemos a persistência dos dados da aplicação.

Para mais informações sobre o projeto sugiro fazer a leitura dos arquivos na pasta docs

## Integrantes no primeiro ciclo
- Ana Girelli
- Bruno Teles
- João Rickli
- Julia Goulart
- Tais Carvalho
- Tiago Marques

## Integrantes no segundo ciclo
| Nome do integrante | Função no projeto |
| ------------------ | ----------------- |
|Bruno Teles|Desenvolvedor Fullstack|
|Felipe Brostolin Ribeiro|Tech Lead e  Desenvolvedor Fullstack |
|Felipe Franzoi Adames| UX/UI Designer  |
|Matheus Otávio Holdys Ris| Desenvolvedor Frontend |
|Luiz Henrique Maiolini Machado| Desenvolvedor FullStack |
|João Rickli| Product Manager |
|Julia Goulart| Quality Assurance |
|Tais Carvalho| UX/UI Designer |
|William Pagani| Desenvolvedor FullStack |

[1]: https://bun.com
[2]: https://typescriptlang.org
[3]: https://handlebarsjs.com
