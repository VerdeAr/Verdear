# VerdeAr - Visão Geral do Produto e Regras de Negócio

> Documentação sincronizada diretamente do Notion oficial do projeto.

> **Tagline:** Do campo à sua mesa — produtos orgânicos e da agricultura familiar, com quem produz de verdade.


---


## Proposta de Valor

O **VerdeAr** é um marketplace digital que conecta **produtores familiares e orgânicos** diretamente a **consumidores conscientes**. A plataforma elimina intermediários, permitindo que quem produz com cuidado e sustentabilidade encontre compradores que valorizam origem, frescor e rastreabilidade.


### Por que o VerdeAr existe?

| Problema identificado | Como o VerdeAr resolve |
| --- | --- |
| Produtores familiares têm dificuldade de alcançar consumidores urbanos | Cada vendedor tem seu próprio espaço de vitrine e catálogo de produtos |
| Consumidores não sabem a origem dos alimentos que compram | Cada produto está vinculado a um produtor identificado (nome e fazenda/chácara) |
| A logística de entrega é um gargalo para pequenos produtores | Cada vendedor configura seu próprio valor de frete, inclusive com opção de retirada no local |
| Dificuldade de escalar vendas sem estrutura de loja física | O VerdeAr oferece gestão de estoque, catálogo e pedidos em um painel único |



---


## Perfis de Usuário

O VerdeAr possui dois perfis distintos de usuário, definidos no momento do cadastro:


### Cliente (Consumidor)

Pessoa que acessa o VerdeAr para descobrir, pesquisar e adquirir produtos orgânicos e da agricultura familiar.

**O que o Cliente pode fazer:**

* Navegar pela vitrine de produtos e categorias
* Pesquisar produtos por nome ou descrição
* Adicionar itens ao carrinho de compras
* Escolher entre **entrega no endereço** ou **retirada no local**
* Selecionar a forma de pagamento preferida
* Acompanhar o histórico de compras com status atualizado
* Cancelar pedidos que ainda não foram processados (status "Em aberto")
* Avaliar pedidos já entregues (nota de 1 a 5 estrelas + comentário)

---


### Vendedor (Produtor / Agricultor Familiar)

Pequeno produtor, fazendeiro familiar ou fornecedor de produtos orgânicos cadastrado como vendedor na plataforma. Tem acesso a todas as funcionalidades de cliente, além de ferramentas de gestão do seu negócio.

**O que o Vendedor pode fazer além do Cliente:**

* Cadastrar, editar e gerenciar seus produtos no catálogo
* Ativar ou desativar produtos sem precisar excluí-los
* Controlar o estoque de cada produto
* Visualizar e gerenciar os pedidos que chegam para os seus produtos
* Atualizar o status de cada pedido (Em aberto → Finalizado → Cancelado)
* Configurar o valor de frete fixo para suas entregas
* Manter um perfil com descrição da fazenda/chácara e CNPJ

---


## Jornada do Usuário


### Jornada do Cliente — Da Descoberta à Entrega

```plain text
1. DESCOBERTA
   │
   └─▶ Cliente acessa o VerdeAr → Visualiza vitrine com produtos em destaque
         │
         └─▶ Navega pelas categorias (Hortifrúti, Laticínios, Grãos, Pães, Temperos…)
               │
               └─▶ Pesquisa produto por nome ou palavra-chave

2. SELEÇÃO
   │
   └─▶ Encontra o produto desejado na vitrine
         │
         └─▶ Clica no produto → Item adicionado ao carrinho
               │
               └─▶ Repete para mais produtos (de um ou múltiplos vendedores)

3. CARRINHO
   │
   └─▶ Acessa o carrinho → Revisa itens, quantidades e subtotal
         │
         └─▶ Ajusta quantidade de cada item (mínimo: 1 unidade)
               │
               └─▶ Remove itens indesejados

4. CHECKOUT
   │
   └─▶ Define o tipo de entrega:
         ├─ ENTREGA → valor de frete é adicionado ao total
         └─ RETIRADA → sem custo de frete

   └─▶ Seleciona a forma de pagamento:
         Cartão | PIX | Dinheiro | Boleto

   └─▶ Revisa resumo final (produtos + frete + total)
         │
         └─▶ Confirma o pedido

5. PÓS-COMPRA
   │
   └─▶ Pedido criado com status "Em aberto"
         │
         ├─▶ Vendedor processa o pedido → Status muda para "Finalizado"
         │
         ├─▶ Cliente acompanha status no histórico de compras
         │
         └─▶ Após finalizado → Cliente avalia o pedido (nota + comentário)
```


---


### Jornada do Vendedor — Da Configuração à Gestão

```plain text
1. CADASTRO
   │
   └─▶ Vendedor se registra na plataforma escolhendo o perfil "Vendedor"
         │
         └─▶ Preenche: nome, CPF, e-mail, senha (+ futuramente: CNPJ, nome da fazenda)

2. CONFIGURAÇÃO INICIAL
   │
   └─▶ Acessa o painel "Minha Conta"
         │
         └─▶ Define o valor de frete fixo que será cobrado nas entregas

3. CRIAÇÃO DO CATÁLOGO
   │
   └─▶ Cadastra seus produtos com:
         Nome | Descrição | Preço | Estoque | Categoria | Unidade de medida | Foto

4. GESTÃO CONTÍNUA
   │
   ├─▶ Ativa/desativa produtos conforme disponibilidade de estoque
   │
   ├─▶ Edita preços, descrições e quantidades em estoque
   │
   └─▶ Monitora os pedidos recebidos no "Controle de pedidos":
         ├─ Atualiza status do pedido (Em aberto → Finalizado)
         ├─ Cancela pedidos quando necessário
         └─ Exclui pedidos que ainda não foram processados
```


---


## 🏪 Telas Disponíveis na Plataforma

| Tela | Quem acessa | Finalidade |
| --- | --- | --- |
| **Login** | Todos | Autenticação na plataforma |
| **Cadastro** | Novos usuários | Criação de conta (Cliente ou Vendedor) |
| **Vitrine (Home)** | Clientes e Vendedores | Catálogo geral de produtos com banners e categorias |
| **Carrinho** | Clientes e Vendedores | Revisão dos itens antes da compra |
| **Finalizar Pedido** | Clientes e Vendedores | Confirmação de entrega, pagamento e total |
| **Minha Conta** | Todos (logados) | Hub de gestão pessoal e comercial |
| ↳ Alterar Cadastro | Todos | Editar nome e e-mail |
| ↳ Redefinir Senha | Todos | Alteração de senha |
| ↳ Histórico de Compras | Todos | Ver pedidos feitos, status e avaliar |
| ↳ Cadastrar Produtos | Vendedores | Adicionar novos produtos ao catálogo |
| ↳ Catálogo de Produtos | Vendedores | Gerenciar produtos cadastrados |
| ↳ Controle de Pedidos | Vendedores | Gerenciar pedidos recebidos |
| ↳ Configurar Frete | Vendedores | Definir valor de frete fixo |



### 📄 Regras de Negócio & Glossário (ID: 3e1c2369-9182-8027-a4f3-c49cc28c4f97)


---


## Glossário de Termos do Domínio


### Atores

| Termo | Definição |
| --- | --- |
| **Cliente** | Usuário cadastrado na plataforma com perfil de comprador. Pode navegar, adicionar ao carrinho e fazer pedidos. |
| **Vendedor** | Produtor rural, agricultor familiar ou fornecedor orgânico cadastrado com perfil de venda. Gerencia catálogo e pedidos. |
| **Pessoa** | Entidade base que representa qualquer usuário da plataforma, independente do perfil. Todo Vendedor também é uma Pessoa. |



---


### Catálogo

| Termo | Definição |
| --- | --- |
| **Produto** | Item disponibilizado por um Vendedor para compra. Possui nome, descrição, preço, estoque, categoria, unidade de medida e foto. |
| **Categoria** | Agrupamento temático de produtos. Exemplos no VerdeAr: Hortifrúti, Laticínios, Grãos, Pães e Massas, Temperos, Bebidas, Doces, Carnes e Ovos. |
| **Unidade de Medida** | Define como o produto é comercializado. Valores possíveis: Kg, Grama, Litro, Mililitro, Unidade, Dúzia, Pacote, Caixa. |
| **Estoque** | Quantidade disponível de um produto. Controlada pelo Vendedor. Aceita valores decimais (ex: 0,5 kg). |
| **Produto Ativo** | Produto visível na vitrine e disponível para compra. |
| **Produto Inativo** | Produto retirado temporariamente da vitrine pelo Vendedor, sem ser excluído do catálogo. |
| **Vitrine** | Página inicial pública onde os Clientes visualizam os produtos ativos de todos os vendedores. |
| **Catálogo do Vendedor** | Visão privada do Vendedor com todos os seus produtos (ativos e inativos). |



---


### Carrinho e Pedido

| Termo | Definição |
| --- | --- |
| **Carrinho** | Lista temporária de produtos que o Cliente selecionou mas ainda não comprou. O carrinho não é persistido entre sessões. |
| **Item do Carrinho** | Combinação de produto + quantidade selecionada pelo Cliente. |
| **Pedido / Venda** | Registro formal de uma compra concluída. Contém: cliente, data, itens, forma de pagamento, tipo de entrega e valor total. |
| **Item do Pedido** | Cada produto dentro de um pedido, com quantidade e preço unitário no momento da compra. |
| **Subtotal** | Soma dos valores (preço × quantidade) de todos os itens do carrinho, sem considerar o frete. |
| **Total** | Subtotal + Frete. Valor final que o Cliente paga. |
| **Valor Total do Pedido** | Valor registrado permanentemente no pedido no momento da confirmação. |



---


### Entrega e Frete

| Termo | Definição |
| --- | --- |
| **Tipo de Entrega** | Modalidade escolhida pelo Cliente no checkout. Pode ser **Entrega** (produto vai ao endereço do cliente) ou **Retirada** (cliente busca no local do vendedor). |
| **Entrega** | Modalidade em que o Vendedor (ou parceiro logístico) leva o produto até o Cliente. Gera cobrança de frete. |
| **Retirada** | Modalidade em que o Cliente vai buscar o produto diretamente com o Vendedor. Sem cobrança de frete. |
| **Frete** | Custo adicional cobrado para cobrir a entrega do produto. |
| **Frete Fixo** | Valor de frete definido pelo próprio Vendedor e aplicado uniformemente a todos os seus pedidos com entrega. |
| **Bairro** | Localização geográfica usada para cálculo e configuração de frete por zona. |



---


### Pagamento

| Termo | Definição |
| --- | --- |
| **Forma de Pagamento** | Método escolhido pelo Cliente para pagar o pedido. Opções disponíveis: Cartão, PIX, Dinheiro, Boleto. |
| **Pagamento** | Registro que vincula um pedido a uma forma de pagamento e ao valor pago. |



---


### Status e Ciclo de Vida

| Termo | Definição |
| --- | --- |
| **Status do Pedido** | Estado atual de um pedido dentro do seu ciclo de vida. |
| **Em Aberto (ABERTA)** | Pedido recém-criado, aguardando processamento pelo Vendedor. |
| **Finalizado (FINALIZADA)** | Pedido entregue ou retirado com sucesso. Estado terminal positivo. |
| **Cancelado (CANCELADA)** | Pedido que não será concluído. Estado terminal negativo. |
| **Status do Chat** | Estado da conversa entre Cliente e Vendedor: **Ativo** (em andamento) ou **Finalizado** (encerrado). |



---


### Avaliação

| Termo | Definição |
| --- | --- |
| **Avaliação** | Feedback dado pelo Cliente após a conclusão de um pedido. Contém nota (1 a 5 estrelas) e comentário opcional. |
| **Nota** | Pontuação inteira de 1 (pior) a 5 (melhor) atribuída pelo Cliente ao pedido finalizado. |
| **Comentário** | Texto livre e opcional que o Cliente pode adicionar junto à nota de avaliação. |



---


### Comunicação

| Termo | Definição |
| --- | --- |
| **Chat** | Canal de comunicação direta entre um Cliente e um Vendedor dentro da plataforma. |



---


## Regras de Negócio por Entidade


---


### Pessoa (Usuário)

| # | Regra |
| --- | --- |
| RN-01 | Todo usuário deve fornecer CPF, e-mail e senha no cadastro. CPF e e-mail devem ser únicos na plataforma. |
| RN-02 | CPF deve conter exatamente 11 dígitos numéricos. |
| RN-03 | O perfil do usuário (Cliente ou Vendedor) é definido no cadastro e não pode ser alterado posteriormente. |
| RN-04 | Não é permitido cadastrar dois usuários com o mesmo CPF, mesmo que os e-mails sejam diferentes. |
| RN-05 | Não é permitido cadastrar dois usuários com o mesmo e-mail, mesmo que os CPFs sejam diferentes. |
| RN-06 | Um usuário pode atualizar seu nome e e-mail a qualquer momento, desde que o novo e-mail não pertença a outra conta. |
| RN-07 | Para redefinir a senha, o usuário deve informar a senha atual correta e confirmar a nova senha com duas entradas idênticas. |
| RN-08 | Um Vendedor é também uma Pessoa — todo Vendedor pode navegar, comprar e avaliar normalmente como Cliente. |



---


### Vendedor (Perfil de Produtor)

| # | Regra |
| --- | --- |
| RN-09 | Apenas usuários com perfil "Vendedor" podem cadastrar, editar, ativar ou desativar produtos. |
| RN-10 | Apenas Vendedores podem configurar o valor de frete fixo. |
| RN-11 | O frete fixo inicial de um Vendedor recém-cadastrado é R$ 0,00. |
| RN-12 | Apenas Vendedores têm acesso ao painel "Controle de pedidos" e ao "Catálogo de produtos". |
| RN-13 | Um Vendedor só pode gerenciar (editar, ativar/desativar) produtos que ele mesmo cadastrou. |
| RN-14 | Um Vendedor visualiza apenas os pedidos em que seus produtos estão incluídos, não os pedidos de outros vendedores. |



---


### Produto (Catálogo)

| # | Regra |
| --- | --- |
| RN-15 | Todo produto deve ter obrigatoriamente: nome, preço, unidade de medida e estoque. |
| RN-16 | O estoque de um produto não pode ser negativo. O valor mínimo é zero. |
| RN-17 | Produtos com `ativo = false` não aparecem na vitrine pública nem podem ser adicionados ao carrinho. |
| RN-18 | A exclusão de um produto é lógica (soft delete): o produto é desativado, não removido do banco de dados, preservando o histórico de pedidos. |
| RN-19 | Um produto pode ser encontrado na busca tanto pelo nome quanto pela sua descrição (busca parcial e sem distinção de maiúsculas/minúsculas). |
| RN-20 | O preço de um produto é registrado no momento da compra, protegendo o Cliente de variações de preço após o pedido confirmado. |



---


### Carrinho de Compras

| # | Regra |
| --- | --- |
| RN-21 | O carrinho é vinculado à sessão do usuário logado. Ao encerrar a sessão, o carrinho é perdido. |
| RN-22 | A quantidade mínima de qualquer item no carrinho é 1. Não é permitido adicionar quantidade zero ou negativa. |
| RN-23 | O Cliente pode ajustar a quantidade de cada item no carrinho antes de finalizar. |
| RN-24 | O carrinho pode conter produtos de diferentes vendedores simultaneamente. |
| RN-25 | O frete só é calculado e adicionado ao total quando o tipo de entrega for "Entrega". Para "Retirada", o frete é R$ 0,00. |



---


### Pedido (Venda)

| # | Regra |
| --- | --- |
| RN-26 | Um pedido só pode ser criado se o carrinho tiver pelo menos 1 item. Carrinho vazio bloqueia o checkout. |
| RN-27 | Todo pedido é criado automaticamente com o status **"Em aberto"**. |
| RN-28 | O valor total do pedido é calculado e travado no momento da confirmação (subtotal + frete). |
| RN-29 | Ao confirmar o pedido, o carrinho é zerado imediatamente. |
| RN-30 | Um pedido registra: data e hora da compra, tipo de entrega, forma de pagamento, lista de itens, preço unitário de cada item e valor total. |
| RN-31 | Somente pedidos com status **"Em aberto"** podem ser excluídos. Pedidos Finalizados ou Cancelados são permanentes. |
| RN-32 | O Cliente pode excluir apenas seus próprios pedidos. |
| RN-33 | O Vendedor pode excluir pedidos que contenham seus produtos, desde que o status seja "Em aberto". |
| RN-34 | Um pedido pode conter produtos de diferentes vendedores. Cada vendedor vê apenas os seus produtos dentro do pedido. |



---


### Transições de Status do Pedido

```plain text
                 ┌──────────────────────────────────────────┐
                 │          CICLO DE VIDA DO PEDIDO          │
                 └──────────────────────────────────────────┘

  [Carrinho confirmado]
          │
          ▼
     ┌─────────┐
     │ ABERTA  │ ◀── Status inicial. Cliente e Vendedor podem excluir.
     └────┬────┘
          │
     ┌────┴──────────────────────────────────┐
     │                                       │
     ▼                                       ▼
┌───────────┐                          ┌──────────┐
│ FINALIZADA│                          │ CANCELADA│
│           │                          │          │
│ ✔ Pode    │                          │ ✘ Pedido │
│   avaliar │                          │  encerrado│
└───────────┘                          └──────────┘

  Quem pode mudar o status: apenas o VENDEDOR
  Quem pode excluir: CLIENTE (dono) ou VENDEDOR (dos produtos) — somente status ABERTA
```

| Transição | Quem pode executar | Observação |
| --- | --- | --- |
| Criação → ABERTA | Sistema (automático) | Ocorre ao confirmar o pedido |
| ABERTA → FINALIZADA | Vendedor | Indica que o produto foi entregue/retirado |
| ABERTA → CANCELADA | Vendedor | Indica que o pedido não será atendido |
| FINALIZADA → qualquer | Ninguém | Estado terminal — imutável |
| CANCELADA → qualquer | Ninguém | Estado terminal — imutável |



---


### Avaliação

| # | Regra |
| --- | --- |
| RN-35 | Somente pedidos com status **"Finalizado"** podem ser avaliados. |
| RN-36 | Cada pedido pode receber no máximo **uma** avaliação por Cliente. |
| RN-37 | A avaliação é vinculada ao Cliente que realizou a compra. |
| RN-38 | A nota deve ser um número inteiro entre 1 e 5 (inclusive). |
| RN-39 | O comentário é opcional. A avaliação é válida apenas com a nota. |
| RN-40 | Uma avaliação registrada **não pode ser editada nem excluída** pelo Cliente. |
| RN-41 | Ao excluir um pedido (quando permitido), todas as avaliações vinculadas são excluídas junto. |



---


### Frete e Entrega

| # | Regra |
| --- | --- |
| RN-42 | O tipo de entrega é escolhido pelo Cliente no checkout: **Entrega** ou **Retirada**. |
| RN-43 | Para a modalidade **Entrega**, o valor do frete configurado pelo Vendedor é somado ao subtotal. |
| RN-44 | Para a modalidade **Retirada**, o frete é R$ 0,00 (sem custo adicional). |
| RN-45 | O Vendedor define um único valor de **frete fixo** que se aplica a todos os seus pedidos com entrega. |
| RN-46 | O frete é registrado no pedido no momento da confirmação e não muda retroativamente. |



---


### Chat (Comunicação)

| # | Regra |
| --- | --- |
| RN-47 | O chat é exclusivo entre um Cliente e um Vendedor. |
| RN-48 | Um chat pode estar em dois estados: **Ativo** (em andamento) ou **Finalizado** (encerrado). |



---


### Controle de Acesso

| # | Regra |
| --- | --- |
| RN-49 | Todas as páginas (exceto Login e Cadastro) exigem autenticação. Usuários não logados são redirecionados para o Login. |
| RN-50 | Funcionalidades exclusivas de Vendedor (cadastrar produto, controle de pedidos, configurar frete) são bloqueadas para Clientes. |
| RN-51 | Um usuário só pode visualizar e editar seus próprios dados pessoais. |
| RN-52 | Um Cliente só acessa o histórico dos seus próprios pedidos. |
| RN-53 | Um Vendedor acessa apenas os pedidos que contêm produtos seus. |



---


## Mapa de Entidades e Relacionamentos (Visão de Negócio)

```plain text
PESSOA
  ├── pode ser CLIENTE → faz PEDIDOS
  └── pode ser VENDEDOR → possui PRODUTOS, define FRETE, gerencia PEDIDOS

PRODUTO
  ├── pertence a um VENDEDOR
  ├── está em uma CATEGORIA
  └── tem uma UNIDADE DE MEDIDA

PEDIDO (Venda)
  ├── feito por um CLIENTE
  ├── contém múltiplos ITENS DE PEDIDO (cada item = produto + quantidade + preço)
  ├── tem um TIPO DE ENTREGA (Entrega ou Retirada)
  ├── tem uma FORMA DE PAGAMENTO
  ├── possui um STATUS (Em Aberto / Finalizado / Cancelado)
  └── pode ter uma AVALIAÇÃO (após Finalizado)

CHAT
  ├── vincula um CLIENTE
  └── vincula um VENDEDOR
```


### 📄 Decisões de Arquitetura (ADRs) (ID: 3e1c2369-9182-8032-956b-cc0b879ef0ff)




### 📄 Guias da Equipe (Dev & QA) - VerdeAr (ID: 3e1c2369-9182-80df-8803-f1bf13a3dd35)

  Central de processos operacionais para desenvolvedores e analistas de qualidade (QA) na disciplina de Fábrica de Software.


## 1. Guia do Desenvolvedor (Dev)


### Antes de Iniciar

  1. **Identifique a Tarefa:** Localize a subtarefa atribuída a você no Jira (ex: `VER-105`).
  1. **Localize a Tarefa Pai (História):** Toda branch de funcionalidade deve derivar do ID da Tarefa Pai (ex: `VER-100`).
  1. **Criação da Branch:**
```plain text
git checkout -b feature/VER-<ID_PAI>-<resumo-curto>
# Exemplo: git checkout -b feature/VER-100-fluxo-checkout
```

  1. **Alinhamento com a IA:** Peça para o assistente (Antigravity/Claude) ler o card no Jira via MCP e aguarde a proposta de alteração antes de aprovar a escrita do código.

### Durante o Desenvolvimento

  * **Foco no Escopo:** Atenda estritamente aos critérios de aceite descritos no Jira. Não refatore códigos não relacionados.
  * **Consultas de Negócio:** Se houver dúvidas sobre regras de plantas, estoque ou frete, consulte a página **Regras de Negócio e Glossário** no Notion.
  * **Segurança:** Nunca comite tokens, senhas ou URLs fixas. Use sempre variáveis do `.env`.

### Ao Concluir o Código

  1. **Revisão Manual:** Inspecione o que mudou no terminal com `git status` e `git diff`.
  1. **Commit Padronizado:** A IA não commita por você. Execute o comando manualmente apontando para o ID da sua **subtarefa**:
```plain text
git add <arquivos-alterados>
git commit -m "feat(modulo): [VER-105] descricao concisa da alteracao"
```

  1. **Mover Card:** Suba a branch (`git push`) e mova a subtarefa no Jira para **Em Teste / Code Review**.

## 2. Guia do Analista de Testes (QA)


### Entrada de Tarefa para Teste

  * A validação começa assim que a subtarefa de Dev correspondente for concluída e a branch estiver atualizada.
  * O QA atua associado à subtarefa de testes daquela entrega (ex: `VER-106`).

### Roteiro de Validação

  1. **Critérios de Aceite:** Conferir item por item o que foi especificado na Tarefa Pai do Jira.
  1. **Regras de Negócio do E-commerce:**
    * Quantidade de itens e cálculo de frete para plantas.
    * Decremento de estoque após a simulação de compra.
    * Tratamento de campos obrigatórios (nome, endereço, dados de pagamento).
  1. **Caminho Triste (Exceções):**
    * Envio de formulários vazios ou com formatos inválidos.
    * Tentativa de compra com produto esgotado.

### Fechamento do Ciclo

  * **Aprovado:** Anexe o print ou evidência de teste na subtarefa do Jira e mova para **Concluído**.
  * **Reprovado (Bug Encontrado):**
    * Descreva o passo a passo exato para reproduzir o problema.
    * Devolva a subtarefa de Dev com os apontamentos no Jira.
  * **Testes Automatizados (se aplicável):**
```plain text
git commit -m "test(modulo): [VER-106] adiciona testes de regressao para checkout"
```


## 3. Padrão Oficial de Commits

| Prefixo | Quando Usar | Exemplo |
| --- | --- | --- |
| `feat` | Nova funcionalidade ou regra de negócio | `feat(catalogo): [VER-105] adiciona filtro por tipo de planta` |
| `fix` | Correção de erro ou falha | `fix(carrinho): [VER-105] corrige calculo de total com frete` |
| `test` | Criação ou ajuste de testes automatizados | `test(checkout): [VER-106] adiciona testes de validacao de cpf` |
| `refactor` | Alteração estrutural sem alterar comportamento | `refactor(api): [VER-105] simplifica servico de estoque` |
| `docs` | Alterações exclusivas de documentação | `docs(readme): [VER-108] atualiza instrucoes de setup` |



## 4. Definição de Pronto (Definition of Done - DoD)

  Uma entrega só é considerada concluída quando:

  - [ ] Todos os critérios de aceite do Jira foram atendidos.
  - [ ] Commits realizados manualmente no padrão `tipo(escopo): [ID_SUBTAREFA]`.
  - [ ] Código revisado sem credenciais expostas ou pacotes desnecessários.
  - [ ] Subtarefa de testes validada pelo QA com evidências registradas.
  - [ ] Subtarefas de Dev e QA movimentadas para **Concluído** no Jira.
  - [ ] Pull Request revisado e aprovado.

