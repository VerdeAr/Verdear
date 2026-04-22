-- Aumenta a coluna senha para comportar hashes bcrypt (60 chars) com margem.
ALTER TABLE "pessoa" ALTER COLUMN "senha" TYPE VARCHAR(255);
