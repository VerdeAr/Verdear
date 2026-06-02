-- DropForeignKey
ALTER TABLE "carrinho" DROP CONSTRAINT "carrinho_forma_pagamento_fkey";

-- AlterTable
ALTER TABLE "carrinho" ALTER COLUMN "forma_pagamento" SET DATA TYPE VARCHAR(50);
