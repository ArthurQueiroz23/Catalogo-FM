-- Conjunto inicial de tamanhos típicos de roupa infantil. A administradora pode editar,
-- desativar, reordenar ou criar novos tamanhos livremente pelo painel — este é só o ponto
-- de partida para não começar com o catálogo sem nenhum tamanho cadastrado.
INSERT INTO tamanho (nome, ordem, ativo) VALUES
    ('RN', 0, TRUE),
    ('P', 1, TRUE),
    ('M', 2, TRUE),
    ('G', 3, TRUE),
    ('GG', 4, TRUE),
    ('1 ANO', 5, TRUE),
    ('2 ANOS', 6, TRUE),
    ('3 ANOS', 7, TRUE),
    ('4 ANOS', 8, TRUE),
    ('6 ANOS', 9, TRUE),
    ('8 ANOS', 10, TRUE),
    ('10 ANOS', 11, TRUE),
    ('12 ANOS', 12, TRUE);
