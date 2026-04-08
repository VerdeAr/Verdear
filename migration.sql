-- Cria os tipos ENUM antes das tabelas
CREATE TYPE tipo_usuario_enum AS ENUM ('CLIENTE', 'VENDEDOR');
CREATE TYPE tipo_entrega_enum AS ENUM ('ENTREGA', 'RETIRADA');
CREATE TYPE status_venda_enum AS ENUM ('ABERTA', 'FINALIZADA', 'CANCELADA');
CREATE TYPE status_chat_enum AS ENUM ('ATIVO', 'FINALIZADO');

---

-- Tabela de Pessoas
CREATE TABLE pessoa (
    id_pessoa SERIAL PRIMARY KEY,
    nome_pessoa VARCHAR(100),
    cpf CHAR(11) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(50),
    endereco VARCHAR(255),
    id_bairro INT,
    telefone VARCHAR(20),
    tipo_usuario tipo_usuario_enum,
    ativo BOOLEAN
);

-- Tabela de Produtos
CREATE TABLE produto (
    id_produto SERIAL PRIMARY KEY,
    id_vendedor INT,
    id_categoria INT,
    nome_produto VARCHAR(255),
    preco DECIMAL(10,2),
    id_unidade_medida INT,
    ativo BOOLEAN,
    url_imagem VARCHAR(255)
);

-- Tabela de Bairros
CREATE TABLE bairro (
    id_bairro SERIAL PRIMARY KEY,
    nome_bairro VARCHAR(50),
    cidade VARCHAR(50)
);

-- Tabela de Frete
CREATE TABLE frete (
    id_frete SERIAL PRIMARY KEY,
    id_vendedor INT,
    id_bairro INT,
    preco DECIMAL(10,2)
);

-- Tabela de Vendas
CREATE TABLE venda (
    id_venda SERIAL PRIMARY KEY,
    id_cliente INT,
    data_venda TIMESTAMP,
    tipo_entrega tipo_entrega_enum,
    valor_total DECIMAL(10,2),
    status status_venda_enum
);

-- Tabela de Itens de Venda
CREATE TABLE vendaproduto (
    id_venda_produto SERIAL PRIMARY KEY,
    id_venda INT,
    id_produto INT,
    quantidade DECIMAL(10,2),
    preco_unitario DECIMAL(10,2)
);

-- Tabela de Formas de Pagamento
CREATE TABLE formapagamento (
    id_forma_pagamento SERIAL PRIMARY KEY,
    descricao VARCHAR(50)
);

-- Tabela de Pagamentos
CREATE TABLE pagamento (
    id_pagamento SERIAL PRIMARY KEY,
    id_venda INT,
    id_forma_pagamento INT,
    valor_pago DECIMAL(10,2)
);

-- Tabela de Categorias
CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nome_categoria VARCHAR(50)
);

-- Tabela de Avaliações
CREATE TABLE avaliacao (
    id_avaliacao SERIAL PRIMARY KEY,
    id_venda INT,
    id_cliente INT,
    nota INT,
    comentario VARCHAR(255),
    data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Chats
CREATE TABLE chat (
    id_chat SERIAL PRIMARY KEY,
    id_cliente INT,
    id_vendedor INT,
    data_inicio TIMESTAMP,
    status status_chat_enum
);

-- Tabela de Unidades de Medida
CREATE TABLE unidademedida (
    id_unidade_medida SERIAL PRIMARY KEY,
    nome_unidade_medida VARCHAR(50)
);

---

-- Chaves Estrangeiras (FK)
ALTER TABLE pessoa ADD FOREIGN KEY (id_bairro) REFERENCES bairro (id_bairro);
ALTER TABLE produto ADD FOREIGN KEY (id_vendedor) REFERENCES pessoa (id_pessoa);
ALTER TABLE produto ADD FOREIGN KEY (id_categoria) REFERENCES categoria (id_categoria);
ALTER TABLE produto ADD FOREIGN KEY (id_unidade_medida) REFERENCES unidademedida (id_unidade_medida);
ALTER TABLE frete ADD FOREIGN KEY (id_vendedor) REFERENCES pessoa (id_pessoa);
ALTER TABLE frete ADD FOREIGN KEY (id_bairro) REFERENCES bairro (id_bairro);
ALTER TABLE venda ADD FOREIGN KEY (id_cliente) REFERENCES pessoa (id_pessoa);
ALTER TABLE vendaproduto ADD FOREIGN KEY (id_venda) REFERENCES venda (id_venda);
ALTER TABLE vendaproduto ADD FOREIGN KEY (id_produto) REFERENCES produto (id_produto);
ALTER TABLE pagamento ADD FOREIGN KEY (id_venda) REFERENCES venda (id_venda);
ALTER TABLE pagamento ADD FOREIGN KEY (id_forma_pagamento) REFERENCES formapagamento (id_forma_pagamento);
ALTER TABLE avaliacao ADD FOREIGN KEY (id_venda) REFERENCES venda (id_venda);
ALTER TABLE avaliacao ADD FOREIGN KEY (id_cliente) REFERENCES pessoa (id_pessoa);
ALTER TABLE chat ADD FOREIGN KEY (id_cliente) REFERENCES pessoa (id_pessoa);
ALTER TABLE chat ADD FOREIGN KEY (id_vendedor) REFERENCES pessoa (id_pessoa);

---

-- Índices (para otimização de consultas)
CREATE INDEX idx_pessoa_bairro ON pessoa (id_bairro);
CREATE INDEX idx_produto_vendedor ON produto (id_vendedor);
CREATE INDEX idx_produto_categoria ON produto (id_categoria);
CREATE INDEX idx_produto_unidade ON produto (id_unidade_medida);
CREATE INDEX idx_frete_vendedor ON frete (id_vendedor);
CREATE INDEX idx_venda_cliente ON venda (id_cliente);
CREATE INDEX idx_venda_data ON venda (data_venda);
CREATE INDEX idx_vendaproduto_produto ON vendaproduto (id_produto);
CREATE INDEX idx_pagamento_forma_pagamento ON pagamento (id_forma_pagamento);
CREATE INDEX idx_chat_cliente ON chat (id_cliente);
CREATE INDEX idx_chat_vendedor ON chat (id_vendedor);

-- Adicionado uma coluna vendedor para gerenciamento de usuário
CREATE TABLE vendedor (
  id_vendedor SERIAL PRIMARY KEY,
  id_pessoa INT UNIQUE REFERENCES pessoa(id_pessoa),
  descricao TEXT,
  cnpj VARCHAR(14),
  nome_fazenda VARCHAR(100)
);

-- Adicionar informação de estoque
ALTER TABLE produto ADD COLUMN estoque DECIMAL(10,3) DEFAULT 0;

-- Adicionar coluna de frete fixo em pessoa
ALTER TABLE pessoa ADD COLUMN IF NOT EXISTS frete_fixo DECIMAL(10,2) DEFAULT 0.00;

-- Adicionar coluna de descrição em produto
ALTER TABLE produto ADD COLUMN IF NOT EXISTS descricao VARCHAR(255) DEFAULT 0;
