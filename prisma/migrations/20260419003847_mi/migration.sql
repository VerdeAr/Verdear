-- CreateEnum
CREATE TYPE "status_chat_enum" AS ENUM ('ATIVO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "status_venda_enum" AS ENUM ('ABERTA', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "tipo_entrega_enum" AS ENUM ('ENTREGA', 'RETIRADA');

-- CreateEnum
CREATE TYPE "tipo_usuario_enum" AS ENUM ('CLIENTE', 'VENDEDOR');

-- CreateTable
CREATE TABLE "pessoa" (
    "id_pessoa" SERIAL NOT NULL,
    "nome_pessoa" VARCHAR(100),
    "cpf" CHAR(11) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(50),
    "endereco" VARCHAR(255),
    "id_bairro" INTEGER,
    "telefone" VARCHAR(20),
    "tipo_usuario" "tipo_usuario_enum",
    "ativo" BOOLEAN,
    "frete_fixo" DECIMAL(10,2) DEFAULT 0.00,

    CONSTRAINT "pessoa_pkey" PRIMARY KEY ("id_pessoa")
);

-- CreateTable
CREATE TABLE "categoria" (
    "id_categoria" SERIAL NOT NULL,
    "nome_categoria" VARCHAR(50),

    CONSTRAINT "categoria_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "unidademedida" (
    "id_unidade_medida" SERIAL NOT NULL,
    "nome_unidade_medida" VARCHAR(50),

    CONSTRAINT "unidademedida_pkey" PRIMARY KEY ("id_unidade_medida")
);

-- CreateTable
CREATE TABLE "produto" (
    "id_produto" SERIAL NOT NULL,
    "id_vendedor" INTEGER,
    "id_categoria" INTEGER,
    "nome_produto" VARCHAR(255),
    "preco" DECIMAL(10,2),
    "id_unidade_medida" INTEGER,
    "ativo" BOOLEAN,
    "url_imagem" VARCHAR(255),
    "estoque" DECIMAL(10,3) DEFAULT 0,
    "descricao" VARCHAR(255) DEFAULT 0,

    CONSTRAINT "produto_pkey" PRIMARY KEY ("id_produto")
);

-- CreateTable
CREATE TABLE "venda" (
    "id_venda" SERIAL NOT NULL,
    "id_cliente" INTEGER,
    "data_venda" TIMESTAMP(6),
    "tipo_entrega" "tipo_entrega_enum",
    "valor_total" DECIMAL(10,2),
    "status" "status_venda_enum",

    CONSTRAINT "venda_pkey" PRIMARY KEY ("id_venda")
);

-- CreateTable
CREATE TABLE "vendaproduto" (
    "id_venda_produto" SERIAL NOT NULL,
    "id_venda" INTEGER,
    "id_produto" INTEGER,
    "quantidade" DECIMAL(10,2),
    "preco_unitario" DECIMAL(10,2),

    CONSTRAINT "vendaproduto_pkey" PRIMARY KEY ("id_venda_produto")
);

-- CreateTable
CREATE TABLE "avaliacao" (
    "id_avaliacao" SERIAL NOT NULL,
    "id_venda" INTEGER,
    "id_cliente" INTEGER,
    "nota" INTEGER,
    "comentario" VARCHAR(255),
    "data_avaliacao" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacao_pkey" PRIMARY KEY ("id_avaliacao")
);

-- CreateTable
CREATE TABLE "bairro" (
    "id_bairro" SERIAL NOT NULL,
    "nome_bairro" VARCHAR(50),
    "cidade" VARCHAR(50),

    CONSTRAINT "bairro_pkey" PRIMARY KEY ("id_bairro")
);

-- CreateTable
CREATE TABLE "chat" (
    "id_chat" SERIAL NOT NULL,
    "id_cliente" INTEGER,
    "id_vendedor" INTEGER,
    "data_inicio" TIMESTAMP(6),
    "status" "status_chat_enum",

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id_chat")
);

-- CreateTable
CREATE TABLE "formapagamento" (
    "id_forma_pagamento" SERIAL NOT NULL,
    "descricao" VARCHAR(50),

    CONSTRAINT "formapagamento_pkey" PRIMARY KEY ("id_forma_pagamento")
);

-- CreateTable
CREATE TABLE "frete" (
    "id_frete" SERIAL NOT NULL,
    "id_vendedor" INTEGER,
    "id_bairro" INTEGER,
    "preco" DECIMAL(10,2),

    CONSTRAINT "frete_pkey" PRIMARY KEY ("id_frete")
);

-- CreateTable
CREATE TABLE "pagamento" (
    "id_pagamento" SERIAL NOT NULL,
    "id_venda" INTEGER,
    "id_forma_pagamento" INTEGER,
    "valor_pago" DECIMAL(10,2),

    CONSTRAINT "pagamento_pkey" PRIMARY KEY ("id_pagamento")
);

-- CreateTable
CREATE TABLE "vendedor" (
    "id_vendedor" SERIAL NOT NULL,
    "id_pessoa" INTEGER,
    "descricao" TEXT,
    "cnpj" VARCHAR(14),
    "nome_fazenda" VARCHAR(100),

    CONSTRAINT "vendedor_pkey" PRIMARY KEY ("id_vendedor")
);

-- CreateIndex
CREATE UNIQUE INDEX "pessoa_cpf_key" ON "pessoa"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "pessoa_email_key" ON "pessoa"("email");

-- CreateIndex
CREATE INDEX "idx_pessoa_bairro" ON "pessoa"("id_bairro");

-- CreateIndex
CREATE INDEX "idx_produto_categoria" ON "produto"("id_categoria");

-- CreateIndex
CREATE INDEX "idx_produto_unidade" ON "produto"("id_unidade_medida");

-- CreateIndex
CREATE INDEX "idx_produto_vendedor" ON "produto"("id_vendedor");

-- CreateIndex
CREATE INDEX "idx_venda_cliente" ON "venda"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_venda_data" ON "venda"("data_venda");

-- CreateIndex
CREATE INDEX "idx_vendaproduto_produto" ON "vendaproduto"("id_produto");

-- CreateIndex
CREATE INDEX "idx_chat_cliente" ON "chat"("id_cliente");

-- CreateIndex
CREATE INDEX "idx_chat_vendedor" ON "chat"("id_vendedor");

-- CreateIndex
CREATE INDEX "idx_frete_vendedor" ON "frete"("id_vendedor");

-- CreateIndex
CREATE INDEX "idx_pagamento_forma_pagamento" ON "pagamento"("id_forma_pagamento");

-- CreateIndex
CREATE UNIQUE INDEX "vendedor_id_pessoa_key" ON "vendedor"("id_pessoa");

-- AddForeignKey
ALTER TABLE "pessoa" ADD CONSTRAINT "pessoa_id_bairro_fkey" FOREIGN KEY ("id_bairro") REFERENCES "bairro"("id_bairro") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categoria"("id_categoria") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_id_unidade_medida_fkey" FOREIGN KEY ("id_unidade_medida") REFERENCES "unidademedida"("id_unidade_medida") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "produto" ADD CONSTRAINT "produto_id_vendedor_fkey" FOREIGN KEY ("id_vendedor") REFERENCES "pessoa"("id_pessoa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "venda" ADD CONSTRAINT "venda_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "pessoa"("id_pessoa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vendaproduto" ADD CONSTRAINT "vendaproduto_id_produto_fkey" FOREIGN KEY ("id_produto") REFERENCES "produto"("id_produto") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vendaproduto" ADD CONSTRAINT "vendaproduto_id_venda_fkey" FOREIGN KEY ("id_venda") REFERENCES "venda"("id_venda") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliacao" ADD CONSTRAINT "avaliacao_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "pessoa"("id_pessoa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "avaliacao" ADD CONSTRAINT "avaliacao_id_venda_fkey" FOREIGN KEY ("id_venda") REFERENCES "venda"("id_venda") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "pessoa"("id_pessoa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_id_vendedor_fkey" FOREIGN KEY ("id_vendedor") REFERENCES "pessoa"("id_pessoa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "frete" ADD CONSTRAINT "frete_id_bairro_fkey" FOREIGN KEY ("id_bairro") REFERENCES "bairro"("id_bairro") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "frete" ADD CONSTRAINT "frete_id_vendedor_fkey" FOREIGN KEY ("id_vendedor") REFERENCES "pessoa"("id_pessoa") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_id_forma_pagamento_fkey" FOREIGN KEY ("id_forma_pagamento") REFERENCES "formapagamento"("id_forma_pagamento") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pagamento" ADD CONSTRAINT "pagamento_id_venda_fkey" FOREIGN KEY ("id_venda") REFERENCES "venda"("id_venda") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "vendedor" ADD CONSTRAINT "vendedor_id_pessoa_fkey" FOREIGN KEY ("id_pessoa") REFERENCES "pessoa"("id_pessoa") ON DELETE NO ACTION ON UPDATE NO ACTION;
