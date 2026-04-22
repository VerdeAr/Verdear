-- AlterTable
ALTER TABLE "pessoa" ADD COLUMN "ultimo_acesso" TIMESTAMP(6);

-- AlterTable
ALTER TABLE "chat" ADD COLUMN "data_ultima_mensagem" TIMESTAMP(6);

-- CreateTable
CREATE TABLE "mensagem" (
    "id_mensagem" SERIAL NOT NULL,
    "id_chat" INTEGER NOT NULL,
    "id_autor" INTEGER NOT NULL,
    "conteudo" TEXT NOT NULL,
    "data_envio" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lida" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "mensagem_pkey" PRIMARY KEY ("id_mensagem")
);

-- CreateIndex
CREATE INDEX "idx_mensagem_chat" ON "mensagem"("id_chat");

-- CreateIndex
CREATE INDEX "idx_mensagem_autor" ON "mensagem"("id_autor");

-- AddForeignKey
ALTER TABLE "mensagem" ADD CONSTRAINT "mensagem_id_chat_fkey" FOREIGN KEY ("id_chat") REFERENCES "chat"("id_chat") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "mensagem" ADD CONSTRAINT "mensagem_id_autor_fkey" FOREIGN KEY ("id_autor") REFERENCES "pessoa"("id_pessoa") ON DELETE NO ACTION ON UPDATE NO ACTION;
