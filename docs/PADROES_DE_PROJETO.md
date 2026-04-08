# 🏗️ Guia de Arquitetura e Padrões de Desenvolvimento

Este documento define a arquitetura padrão do nosso projeto Node.js com Express e Handlebars. Estamos migrando do modelo tradicional (Package by Layer) para o modelo **Package by Feature** (Agrupamento por Funcionalidade).

O objetivo desta mudança é aumentar a coesão, reduzir conflitos de merge (Merge Hell), facilitar a manutenção e preparar o sistema para um crescimento seguro e escalável.

---

## 1. Visão Geral da Nova Arquitetura

Nossa base de código agora está dividida em dois grandes pilares que se espelham:
1. **`src/`**: O coração do backend (Controllers, Models, Views, Regras de Negócio). **Nunca exposto à internet.**
2. **`public/`**: O repositório de assets estáticos (CSS, JS do cliente, Imagens). **Exposto à internet.**

Tudo no sistema é dividido entre **Core** (Global/Compartilhado) e **Features** (Módulos isolados por domínio de negócio).

### Árvore de Diretórios Padrão
```text
raiz_do_projeto/
├── src/
│   ├── core/                        # Coisas globais do servidor e views
│   │   └── views/
│   │       ├── layouts/
│   │       │   └── main.hbs         # Esqueleto HTML principal (html, head, body)
│   │       └── partials/
│   │           ├── navbar.hbs       # Componente global
│   │           └── footer.hbs       # Componente global
│   │
│   └── features/                    # As funcionalidades do sistema
│       ├── usuario/
│       │   ├── usuario.controller.js
│       │   ├── usuario.model.js
│       │   ├── usuario.routes.js
│       │   └── views/
│       │       └── index.hbs        # View específica de usuário
│       │
│       └── carrinho/
│           ├── carrinho.controller.js
│           └── views/
│               └── index.hbs
│
└── public/                          # ESPELHO PARA ASSETS ESTÁTICOS
    ├── core/
    │   ├── css/global.css           # CSS global (reset, cores, tipografia)
    │   └── js/utils.js              # Funções JS globais
    │
    └── features/
        └── carrinho/
            ├── carrinho.css         # CSS específico da view do carrinho
            └── carrinho.js          # Scripts específicos do carrinho
```

---

## 2. A Regra do "Package by Feature"

**Tudo que muda junto, mora junto.** Se você está criando um novo recurso chamado "Relatórios", você não deve espalhar os arquivos pelo sistema. Você criará uma pasta `src/features/relatorios/` e colocará o Controller, a Model, as Rotas e as Views (telas) referentes a relatórios **exclusivamente** lá dentro.

---

## 3. Views e Handlebars (Sem repetição de HTML)

A abordagem de Views mudou radicalmente. **Não escreva mais `<html>`, `<head>`, ou `<body>` nos arquivos das telas.**

### O Layout Principal (`main.hbs`)
O arquivo `src/core/views/layouts/main.hbs` gerencia o esqueleto de todas as páginas. Ele já faz o import do CSS global e dos componentes de navegação. Todo o conteúdo da sua tela será injetado automaticamente na variável `{{{body}}}`.

### Criando a sua Tela (View Local)
Na pasta da sua feature (ex: `src/features/carrinho/views/index.hbs`), importe apenas o CSS e o JS específicos da sua tela e escreva o HTML diretamente:

```handlebars
<link rel="stylesheet" href="/features/carrinho/carrinho.css">

<div class="meu-carrinho">
    <h1>Carrinho de Compras</h1>
    {{> navbar }} 
</div>

<script src="/features/carrinho/carrinho.js"></script>
```

---

## 4. O Espelho da Pasta `public` (CSS e Scripts do Cliente)

Para manter a segurança do backend e organizar nossos estilos e scripts de tela, utilizamos o padrão de espelhamento na pasta `public/`.

* O arquivo `app.js` expõe a raiz da pasta pública uma única vez: `app.use(express.static('public'));`
* **NÃO** adicione novas rotas estáticas no `app.js`.
* O roteamento no HTML (`href` e `src`) deve seguir o caminho a partir de dentro da pasta public:
  * ❌ Errado: `<link href="../../../public/features/carrinho/carrinho.css">`
  * ✅ Certo: `<link href="/features/carrinho/carrinho.css">`

---

## 5. A Regra de Ouro da Controller

O Handlebars é uma engine de visualização "burra" por design. Ele serve apenas para exibir dados, não para processá-los. 

**Proibições na View:**
* Fazer cálculos matemáticos (ex: `preco * quantidade`).
* Formatar datas.
* Formatar moedas (ex: `.toFixed(2).replace('.', ',')`).
* Fazer lógica complexa de `if/else` baseada em regras de negócio.

**Obrigações da Controller:**
A Controller é o "garçom". Ela deve buscar os dados no banco, fazer toda a matemática, formatar os textos para o padrão brasileiro e enviar *strings prontas* para a View.

**Exemplo de Controller Correta:**
```javascript
const carregarCarrinho = async (req, res) => {
    const itensBanco = await Item.findAll();
    
    // A Controller faz o trabalho sujo
    const itensFormatados = itensBanco.map(item => ({
        ...item,
        subtotalFormatado: `R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`
    }));

    // Envia os dados mastigados para a View
    res.render('carrinho/views/index', { itens: itensFormatados });
};
```

---

## 6. Guia Rápido: Como criar uma nova funcionalidade (Ex: "Faturas")

Siga este checklist sempre que pegar uma nova task de criação de tela/funcionalidade:

- [ ] **1. Crie a pasta da Feature no Backend:** Crie `src/features/faturas/`.
- [ ] **2. Crie a pasta de Views da Feature:** Crie `src/features/faturas/views/`.
- [ ] **3. Crie a pasta da Feature no Frontend:** Crie `public/features/faturas/`.
- [ ] **4. Crie os arquivos de backend:** Dentro da pasta de backend, crie `faturas.controller.js`, `faturas.model.js` e `faturas.routes.js`.
- [ ] **5. Crie a View:** Dentro da pasta de views, crie `index.hbs` (lembre-se: sem a tag `<html>`).
- [ ] **6. Crie os Estilos e Scripts:** Dentro da pasta public, crie `faturas.css` e `faturas.js`. Importe-os dentro do seu `index.hbs`.
- [ ] **7. Registre as rotas:** Vá no arquivo principal de rotas do sistema e importe o seu `faturas.routes.js`.
- [ ] **8. Mastigue os dados:** Garanta que sua Controller calcule tudo antes de mandar para o `res.render`.
