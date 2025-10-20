-- ==========================================
-- ALTERAÇÃO: Adicionar campo preco_custo
-- Data: Outubro 2025
-- Objetivo: Permitir análises de margem e lucro
-- ==========================================

-- Adicionar coluna preco_custo à tabela produtos
ALTER TABLE produtos ADD (
    preco_custo NUMBER(10,2) DEFAULT 0 CHECK (preco_custo >= 0)
);

-- Adicionar comentário
COMMENT ON COLUMN produtos.preco_custo IS 'Preço de custo/compra pago pelo vendedor à indústria';

-- Criar índice para queries de margem
CREATE INDEX idx_produtos_margem ON produtos(preco_base, preco_custo) WHERE ativo = 'Y';

-- ==========================================
-- EXEMPLOS DE QUERIES COM MARGEM
-- ==========================================

-- Produtos com margem de lucro
/*
SELECT 
    id,
    nome,
    gtin,
    preco_custo,
    preco_base,
    (preco_base - preco_custo) as lucro_unitario,
    CASE 
        WHEN preco_custo > 0 THEN 
            ROUND(((preco_base - preco_custo) / preco_custo * 100), 2)
        ELSE 0 
    END as margem_percentual
FROM produtos
WHERE vendedor_id = :vendedor_id
    AND ativo = 'Y'
ORDER BY margem_percentual DESC;
*/

-- Produtos com margem baixa (alerta)
/*
SELECT 
    id,
    nome,
    preco_custo,
    preco_base,
    (preco_base - preco_custo) as lucro_unitario,
    ROUND(((preco_base - preco_custo) / preco_custo * 100), 2) as margem_percentual
FROM produtos
WHERE vendedor_id = :vendedor_id
    AND ativo = 'Y'
    AND preco_custo > 0
    AND ((preco_base - preco_custo) / preco_custo * 100) < 20
ORDER BY margem_percentual ASC;
*/

-- Análise de lucro por venda
/*
SELECT 
    v.id as venda_id,
    v.data_venda,
    SUM(iv.subtotal) as receita_total,
    SUM(p.preco_custo * iv.quantidade) as custo_total,
    SUM(iv.subtotal - (p.preco_custo * iv.quantidade)) as lucro_total,
    ROUND(
        SUM(iv.subtotal - (p.preco_custo * iv.quantidade)) / 
        SUM(iv.subtotal) * 100, 
        2
    ) as margem_percentual
FROM vendas v
JOIN itens_venda iv ON v.id = iv.venda_id
JOIN produtos p ON iv.produto_id = p.id
WHERE v.vendedor_id = :vendedor_id
    AND v.status = 'CONCLUIDA'
GROUP BY v.id, v.data_venda
ORDER BY v.data_venda DESC;
*/

-- Produtos mais lucrativos (receita vs lucro)
/*
SELECT 
    p.id,
    p.nome,
    p.gtin,
    COUNT(DISTINCT v.id) as qtd_vendas,
    SUM(iv.quantidade) as qtd_vendida,
    SUM(iv.subtotal) as receita_total,
    SUM(p.preco_custo * iv.quantidade) as custo_total,
    SUM(iv.subtotal - (p.preco_custo * iv.quantidade)) as lucro_total,
    ROUND(
        SUM(iv.subtotal - (p.preco_custo * iv.quantidade)) / 
        SUM(iv.subtotal) * 100, 
        2
    ) as margem_media
FROM produtos p
JOIN itens_venda iv ON p.id = iv.produto_id
JOIN vendas v ON iv.venda_id = v.id
WHERE v.vendedor_id = :vendedor_id
    AND v.status = 'CONCLUIDA'
    AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '30' DAY
GROUP BY p.id, p.nome, p.gtin
ORDER BY lucro_total DESC
FETCH FIRST 10 ROWS ONLY;
*/

-- Análise de margem por indústria (para o vendedor)
/*
SELECT 
    u.nome as industria,
    COUNT(DISTINCT p.id) as qtd_produtos,
    AVG(
        CASE 
            WHEN p.preco_custo > 0 THEN 
                ((p.preco_base - p.preco_custo) / p.preco_custo * 100)
            ELSE 0 
        END
    ) as margem_media,
    SUM(iv.subtotal) as receita_gerada,
    SUM(p.preco_custo * iv.quantidade) as custo_total,
    SUM(iv.subtotal - (p.preco_custo * iv.quantidade)) as lucro_total
FROM usuarios u
JOIN produtos p ON u.id = p.industria_id
LEFT JOIN itens_venda iv ON p.id = iv.produto_id
LEFT JOIN vendas v ON iv.venda_id = v.id AND v.status = 'CONCLUIDA'
WHERE p.vendedor_id = :vendedor_id
    AND p.ativo = 'Y'
GROUP BY u.id, u.nome
ORDER BY lucro_total DESC;
*/

-- Sugestão de preço (para indústria sugerir ao vendedor)
/*
-- Exemplo: produtos com margem < 15% podem precisar de ajuste de preço de custo
SELECT 
    p.id,
    p.nome,
    p.gtin,
    v.nome as vendedor,
    p.preco_custo,
    p.preco_base,
    ROUND(((p.preco_base - p.preco_custo) / p.preco_custo * 100), 2) as margem_atual,
    -- Sugestão de preço de custo para margem de 25%
    ROUND(p.preco_base / 1.25, 2) as preco_custo_sugerido
FROM produtos p
JOIN usuarios v ON p.vendedor_id = v.id
WHERE p.industria_id = :industria_id
    AND p.ativo = 'Y'
    AND p.preco_custo > 0
    AND ((p.preco_base - p.preco_custo) / p.preco_custo * 100) < 15
ORDER BY margem_atual ASC;
*/

-- ==========================================
-- PERMISSÕES E CONTROLE DE ACESSO
-- ==========================================

/*
VENDEDOR (VAREJISTA):
- Pode visualizar preco_custo de seus produtos
- Pode atualizar todos os campos EXCETO preco_custo
- preco_custo é read-only para o vendedor

INDÚSTRIA:
- Pode visualizar preco_custo dos produtos associados
- Pode atualizar APENAS preco_custo
- Não pode alterar outros campos (nome, preco_base, estoque, etc)
*/

-- ==========================================
-- REGRAS DE NEGÓCIO
-- ==========================================

/*
1. preco_custo deve ser sempre menor ou igual a preco_base
   (a indústria não pode definir um custo maior que o preço de venda)

2. Quando preco_custo = 0, significa que o custo ainda não foi definido

3. Margem mínima recomendada: 15-20%

4. Alertas automáticos quando:
   - Margem < 10% (muito baixa)
   - Preço de custo > preço base (inconsistência)
   - Preço de custo não definido

5. Trade Marketing:
   - Indústria pode reduzir preco_custo temporariamente (promoção)
   - Vendedor vê margem maior e pode fazer promoção também
   - Win-win: indústria vende mais volume, vendedor mantém margem
*/

-- ==========================================
-- FIM DA ALTERAÇÃO
-- ==========================================

