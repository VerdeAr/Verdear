# DER — Verdear

Diagrama Entidade-Relacionamento gerado a partir de `prisma/schema.prisma`.

```mermaid
erDiagram
    pessoa ||--o| vendedor : "possui perfil"
    pessoa ||--o| carrinho : "tem"
    pessoa ||--o{ venda : "compra (cliente)"
    pessoa ||--o{ produto : "vende (vendedor)"
    pessoa ||--o{ avaliacao : "avalia"
    pessoa ||--o{ frete : "define frete"
    pessoa }o--|| bairro : "reside em"
    pessoa ||--o{ chat : "cliente"
    pessoa ||--o{ chat : "vendedor"
    pessoa ||--o{ mensagem : "autor"

    bairro ||--o{ frete : "referencia"

    categoria ||--o{ produto : "classifica"
    unidademedida ||--o{ produto : "mede"

    produto ||--o{ itemcarrinho : "está em"
    produto ||--o{ vendaproduto : "vendido em"

    carrinho ||--o{ itemcarrinho : "contém"

    venda ||--o{ vendaproduto : "possui itens"
    venda ||--o{ pagamento : "recebe"
    venda ||--o{ avaliacao : "recebe avaliação"

    formapagamento ||--o{ pagamento : "define método"

    chat ||--o{ mensagem : "contém"

    pessoa {
        int id_pessoa PK
        string nome_pessoa
        string cpf UK
        string email UK
        string senha
        string endereco
        int id_bairro FK
        string telefone
        enum tipo_usuario
        bool ativo
        decimal frete_fixo
        datetime ultimo_acesso
    }

    vendedor {
        int id_vendedor PK
        int id_pessoa FK,UK
        string descricao
        string cnpj
        string nome_fazenda
    }

    bairro {
        int id_bairro PK
        string nome_bairro
        string cidade
    }

    frete {
        int id_frete PK
        int id_vendedor FK
        int id_bairro FK
        decimal preco
    }

    categoria {
        int id_categoria PK
        string nome_categoria
    }

    unidademedida {
        int id_unidade_medida PK
        string nome_unidade_medida
    }

    produto {
        int id_produto PK
        int id_vendedor FK
        int id_categoria FK
        int id_unidade_medida FK
        string nome_produto
        decimal preco
        bool ativo
        string url_imagem
        decimal estoque
        string descricao
    }

    carrinho {
        int id_carrinho PK
        int id_pessoa FK,UK
        enum tipo_entrega
        string forma_pagamento
        datetime criado_em
        datetime atualizado_em
    }

    itemcarrinho {
        int id_item PK
        int id_carrinho FK
        int id_produto FK
        decimal quantidade
        decimal preco
    }

    venda {
        int id_venda PK
        int id_cliente FK
        datetime data_venda
        enum tipo_entrega
        decimal valor_total
        enum status
    }

    vendaproduto {
        int id_venda_produto PK
        int id_venda FK
        int id_produto FK
        decimal quantidade
        decimal preco_unitario
    }

    formapagamento {
        int id_forma_pagamento PK
        string descricao
    }

    pagamento {
        int id_pagamento PK
        int id_venda FK
        int id_forma_pagamento FK
        decimal valor_pago
    }

    avaliacao {
        int id_avaliacao PK
        int id_venda FK
        int id_cliente FK
        int nota
        string comentario
        datetime data_avaliacao
    }

    chat {
        int id_chat PK
        int id_cliente FK
        int id_vendedor FK
        datetime data_inicio
        datetime data_ultima_mensagem
        enum status
    }

    mensagem {
        int id_mensagem PK
        int id_chat FK
        int id_autor FK
        string conteudo
        datetime data_envio
        bool lida
    }
```

## Legenda

- `PK` chave primária
- `FK` chave estrangeira
- `UK` restrição UNIQUE
- Cardinalidade Mermaid: `||--o{` = um-para-muitos; `||--o|` = um-para-um opcional; `}o--||` = muitos-para-um.

## Enums

- `tipo_usuario_enum`: CLIENTE, VENDEDOR
- `tipo_entrega_enum`: ENTREGA, RETIRADA
- `status_venda_enum`: ABERTA, FINALIZADA, CANCELADA
- `status_chat_enum`: ATIVO, FINALIZADO
