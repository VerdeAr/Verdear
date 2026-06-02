-- CreateTable
CREATE TABLE "carrinho" (
    "id_carrinho" SERIAL NOT NULL,
    "id_pessoa" INTEGER NOT NULL,
    "tipo_entrega" "tipo_entrega_enum",
    "forma_pagamento" INTEGER,
    "criado_em" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "carrinho_pkey" PRIMARY KEY ("id_carrinho")
);

-- CreateTable
CREATE TABLE "itemcarrinho" (
    "id_item" SERIAL NOT NULL,
    "id_carrinho" INTEGER NOT NULL,
    "id_produto" INTEGER NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "itemcarrinho_pkey" PRIMARY KEY ("id_item")
);

-- CreateIndex
CREATE UNIQUE INDEX "carrinho_id_pessoa_key" ON "carrinho"("id_pessoa");

-- AddForeignKey
ALTER TABLE "carrinho" ADD CONSTRAINT "carrinho_id_pessoa_fkey" FOREIGN KEY ("id_pessoa") REFERENCES "pessoa"("id_pessoa") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "carrinho" ADD CONSTRAINT "carrinho_forma_pagamento_fkey" FOREIGN KEY ("forma_pagamento") REFERENCES "formapagamento"("id_forma_pagamento") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itemcarrinho" ADD CONSTRAINT "itemcarrinho_id_carrinho_fkey" FOREIGN KEY ("id_carrinho") REFERENCES "carrinho"("id_carrinho") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "itemcarrinho" ADD CONSTRAINT "itemcarrinho_id_produto_fkey" FOREIGN KEY ("id_produto") REFERENCES "produto"("id_produto") ON DELETE NO ACTION ON UPDATE NO ACTION;
