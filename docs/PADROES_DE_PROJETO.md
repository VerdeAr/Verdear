# Guia de Arquitetura e Padrões de Desenvolvimento

Este documento define a arquitetura padrão do projeto construído com Bun, Express, TypeScript, Prisma ORM e Handlebars. Utilizamos o modelo Package by Feature (Agrupamento por Funcionalidade) para garantir escalabilidade e fácil manutenção.

---

## 1. Visão Geral da Arquitetura

Nossa base de código está dividida em três grandes áreas:
1. **`prisma/`**: Contém o `schema.prisma` (a fonte da verdade do banco de dados).
2. **`src/`**: O coração do backend (Controllers, Rotas, Views e Client do Prisma). Nunca exposto à internet.
3. **`public/`**: Assets estáticos (CSS, JS do cliente, Imagens). Exposto à internet.

### Árvore de Diretórios
```text
raiz_do_projeto/
├── prisma/
│   └── schema.prisma                # Modelagem do banco de dados
├── src/
│   ├── core/                        # Configurações globais
│   │   ├── database.ts              # PrismaClient com lógica de Auto-Retry
│   │   └── views/
│   │       ├── layouts/
│   │       │   └── main.handlebars  # Esqueleto HTML principal
│   │       └── partials/
│   │           └── navbar.handlebars # Componentes globais reutilizáveis
│   └── features/                    # Módulos por domínio de negócio
│       ├── produtos/
│       │   ├── produtos.controller.ts
│       │   ├── produtos.routes.ts
│       │   └── views/
│       │       └── index.handlebars # View específica da feature
│       └── vendas/
│           ├── vendas.controller.ts
│           └── ...
└── public/                          # Assets estáticos (Espelho da Feature)
    ├── core/
    │   └── css/global.css           # Estilos globais
    └── features/
        └── produtos/
            ├── produtos.css         # CSS específico da tela de produtos
            └── produtos.js          # Scripts específicos da tela de produtos
```

---

## 2. A Regra do "Package by Feature"

Tudo que muda junto, mora junto. Se você está criando a funcionalidade de "Vendas", você criará uma pasta `src/features/vendas/` e colocará o Controller, as Rotas e as Views referentes a vendas exclusivamente lá dentro.

Nota: Não criamos arquivos de model separados, pois o Prisma gera os tipos automaticamente a partir do `schema.prisma`.

---

## 3. Views e Handlebars (Injeção de Código e Semântica)

Não escreva as tags `<html>`, `<head>`, ou `<body>` nos arquivos de tela.

### O Layout Principal (`main.handlebars`)
Localizado em `src/core/views/layouts/main.handlebars`, ele gerencia o esqueleto da página. O conteúdo de cada tela é injetado automaticamente na tag `{{{body}}}`. Para manter o HTML semântico e a performance, utilizamos seções customizadas para injetar CSS no `<head>` e JavaScript no final do `<body>`.

Exemplo da estrutura do layout principal:
```handlebars
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Verdear | Sua vitrine para o campo</title>
    <link rel="stylesheet" href="/core/css/global.css">
    
    {{{_sections.head}}}
</head>
<body>
    {{> navbar }}

    <main>
        {{{body}}}
    </main>

    {{{_sections.scripts}}}
</body>
</html>
```

### Criando uma View Local
Na pasta da sua feature (ex: `src/features/produtos/views/index.handlebars`), utilize os blocos de seção para alocar seus assets nos locais corretos e escreva o HTML da página livremente. É obrigatório o uso de `type="module"` na importação de scripts.

```handlebars
{{#section 'head'}}
    <link rel="stylesheet" href="/features/produtos/produtos.css">
{{/section}}

<div class="lista-produtos">
    <h1>Nossos Produtos</h1>
    {{#each produtos}}
        <div class="card">
            <h3>{{this.nome_produto}}</h3>
            <p>{{this.precoFormatado}}</p>
        </div>
    {{/each}}
</div>

{{#section 'scripts'}}
    <script type="module" src="/features/produtos/produtos.js"></script>
{{/section}}
```

---

## 4. O Espelho da Pasta `public`

Os caminhos de arquivos estáticos no HTML devem sempre partir da raiz da pasta `public/`:
* Certo: `<link href="/features/produtos/produtos.css">`
* Errado: `<link href="../../../public/features/produtos/produtos.css">`

---

## 5. A Regra de Ouro da Controller

O Handlebars é uma engine de visualização burra. Ele não deve processar dados.

Obrigações da Controller:
- Buscar os dados no Prisma.
- Resolver tipagens e converter `Decimal` (Prisma) para `Number`.
- Formatar datas e moedas para o padrão de exibição utilizando as APIs nativas do JavaScript (ex: BRL).
- Enviar objetos com strings prontas para a View.

Exemplo de Controller (TypeScript):
```typescript
import { Request, Response } from 'express';
import prisma from '../../core/database';

export const listarProdutos = async (req: Request, res: Response) => {
    const produtosBanco = await prisma.produto.findMany({
        where: { ativo: true }
    });
    
    const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    const produtosFormatados = produtosBanco.map(produto => ({
        ...produto,
        precoFormatado: formatadorMoeda.format(Number(produto.preco))
    }));

    res.render('produtos/views/index', { produtos: produtosFormatados });
};
```

---

## 6. Checklist: Criando uma nova funcionalidade

1. Prisma: Atualize o `schema.prisma` e rode `bunx --bun prisma generate`.
2. Backend: Crie a pasta em `src/features/nome-da-feature/`.
3. Controller/Routes: Crie os arquivos `.ts` dentro da pasta da feature.
4. View: Crie a pasta `views/` dentro da feature e o arquivo `.handlebars`.
5. Assets: Crie a pasta correspondente em `public/features/nome-da-feature/` para CSS e JS.
6. Registro: Importe as novas rotas no arquivo principal do servidor.
