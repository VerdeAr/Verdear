-- Dados iniciais para o banco Verdear.
-- Executar com:
--   docker exec -i verdear-banco-1 psql -U postgres -d postgres < prisma/seed.sql

INSERT INTO categoria (nome_categoria) VALUES
    ('Hortifrúti'),
    ('Laticínios'),
    ('Grãos'),
    ('Pães e Massas'),
    ('Temperos'),
    ('Bebidas'),
    ('Doces'),
    ('Carnes e Ovos')
ON CONFLICT DO NOTHING;

INSERT INTO unidademedida (nome_unidade_medida) VALUES
    ('Kg'),
    ('Grama'),
    ('Litro'),
    ('Mililitro'),
    ('Unidade'),
    ('Dúzia'),
    ('Pacote'),
    ('Caixa')
ON CONFLICT DO NOTHING;

INSERT INTO formapagamento (descricao) VALUES
    ('Cartão'),
    ('PIX'),
    ('Dinheiro'),
    ('Boleto')
ON CONFLICT DO NOTHING;
