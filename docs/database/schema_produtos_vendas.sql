-- ==========================================
-- TRADEBOX - SCHEMA DE PRODUTOS E VENDAS
-- Sistema completo para gestão de produtos, vendas e estoque
-- Projeto Universitário - Trade Marketing
-- ==========================================

-- ==========================================
-- SEQUENCES
-- ==========================================

CREATE SEQUENCE seq_categorias
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE seq_produtos
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE seq_clientes
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE seq_vendas
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

CREATE SEQUENCE seq_itens_venda
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- ==========================================
-- TABELA: CATEGORIAS
-- Categorias de produtos para organização e analytics
-- ==========================================

CREATE TABLE categorias (
    -- Chave primária
    id NUMBER(10) DEFAULT seq_categorias.NEXTVAL PRIMARY KEY,
    
    -- Dados da categoria
    nome VARCHAR2(100) NOT NULL UNIQUE,
    descricao VARCHAR2(500),
    
    -- Status
    ativo CHAR(1) DEFAULT 'Y' CHECK (ativo IN ('Y', 'N')),
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ==========================================
-- TABELA: PRODUTOS
-- Produtos cadastrados pelos vendedores
-- ==========================================

CREATE TABLE produtos (
    -- Chave primária
    id NUMBER(10) DEFAULT seq_produtos.NEXTVAL PRIMARY KEY,
    
    -- Relacionamentos
    vendedor_id NUMBER(10) NOT NULL,
    industria_id NUMBER(10),
    categoria_id NUMBER(10),
    
    -- Dados do produto
    gtin VARCHAR2(14) NOT NULL,
    nome VARCHAR2(255) NOT NULL,
    descricao VARCHAR2(1000),
    
    -- Precificação e estoque
    preco_base NUMBER(10,2) NOT NULL CHECK (preco_base >= 0),
    estoque NUMBER(10) DEFAULT 0 CHECK (estoque >= 0),
    
    -- Status
    ativo CHAR(1) DEFAULT 'Y' CHECK (ativo IN ('Y', 'N')),
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_produto_vendedor FOREIGN KEY (vendedor_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_produto_industria FOREIGN KEY (industria_id) 
        REFERENCES usuarios(id) ON DELETE SET NULL,
    CONSTRAINT fk_produto_categoria FOREIGN KEY (categoria_id) 
        REFERENCES categorias(id) ON DELETE SET NULL,
    
    -- Unique constraint: mesmo GTIN pode ser cadastrado por vendedores diferentes
    CONSTRAINT uk_produto_vendedor_gtin UNIQUE (vendedor_id, gtin)
);

-- ==========================================
-- TABELA: CLIENTES
-- Clientes dos vendedores (opcional para expansões futuras)
-- ==========================================

CREATE TABLE clientes (
    -- Chave primária
    id NUMBER(10) DEFAULT seq_clientes.NEXTVAL PRIMARY KEY,
    
    -- Relacionamento
    vendedor_id NUMBER(10) NOT NULL,
    
    -- Dados do cliente
    nome VARCHAR2(255) NOT NULL,
    documento VARCHAR2(14),
    telefone VARCHAR2(15),
    email VARCHAR2(320),
    endereco VARCHAR2(500),
    
    -- Status
    ativo CHAR(1) DEFAULT 'Y' CHECK (ativo IN ('Y', 'N')),
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Key
    CONSTRAINT fk_cliente_vendedor FOREIGN KEY (vendedor_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE
);

-- ==========================================
-- TABELA: VENDAS
-- Registro de vendas realizadas
-- ==========================================

CREATE TABLE vendas (
    -- Chave primária
    id NUMBER(10) DEFAULT seq_vendas.NEXTVAL PRIMARY KEY,
    
    -- Relacionamentos
    vendedor_id NUMBER(10) NOT NULL,
    cliente_id NUMBER(10),
    
    -- Dados da venda
    data_venda TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    valor_total NUMBER(10,2) NOT NULL CHECK (valor_total >= 0),
    quantidade_itens NUMBER(10) DEFAULT 0 CHECK (quantidade_itens >= 0),
    
    -- Status da venda
    status VARCHAR2(20) DEFAULT 'CONCLUIDA' CHECK (status IN ('CONCLUIDA', 'CANCELADA', 'PENDENTE')),
    
    -- Observações
    observacoes VARCHAR2(1000),
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_venda_vendedor FOREIGN KEY (vendedor_id) 
        REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_venda_cliente FOREIGN KEY (cliente_id) 
        REFERENCES clientes(id) ON DELETE SET NULL
);

-- ==========================================
-- TABELA: ITENS_VENDA
-- Itens individuais de cada venda
-- ==========================================

CREATE TABLE itens_venda (
    -- Chave primária
    id NUMBER(10) DEFAULT seq_itens_venda.NEXTVAL PRIMARY KEY,
    
    -- Relacionamentos
    venda_id NUMBER(10) NOT NULL,
    produto_id NUMBER(10) NOT NULL,
    
    -- Dados do item
    quantidade NUMBER(10) NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMBER(10,2) NOT NULL CHECK (preco_unitario >= 0),
    subtotal NUMBER(10,2) NOT NULL CHECK (subtotal >= 0),
    
    -- Auditoria
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_item_venda FOREIGN KEY (venda_id) 
        REFERENCES vendas(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) 
        REFERENCES produtos(id)
);

-- ==========================================
-- ÍNDICES PARA PERFORMANCE
-- ==========================================

-- Índices para categorias
CREATE INDEX idx_categorias_ativo ON categorias(ativo);

-- Índices para produtos
CREATE INDEX idx_produtos_vendedor ON produtos(vendedor_id);
CREATE INDEX idx_produtos_industria ON produtos(industria_id);
CREATE INDEX idx_produtos_categoria ON produtos(categoria_id);
CREATE INDEX idx_produtos_gtin ON produtos(gtin);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);
CREATE INDEX idx_produtos_vendedor_created ON produtos(vendedor_id, created_at DESC);

-- Índices para clientes
CREATE INDEX idx_clientes_vendedor ON clientes(vendedor_id);
CREATE INDEX idx_clientes_documento ON clientes(documento);

-- Índices para vendas
CREATE INDEX idx_vendas_vendedor ON vendas(vendedor_id);
CREATE INDEX idx_vendas_cliente ON vendas(cliente_id);
CREATE INDEX idx_vendas_data ON vendas(data_venda DESC);
CREATE INDEX idx_vendas_status ON vendas(status);
CREATE INDEX idx_vendas_vendedor_data ON vendas(vendedor_id, data_venda DESC);

-- Índices para itens_venda
CREATE INDEX idx_itens_venda ON itens_venda(venda_id);
CREATE INDEX idx_itens_produto ON itens_venda(produto_id);

-- ==========================================
-- TRIGGERS PARA UPDATED_AT
-- ==========================================

CREATE OR REPLACE TRIGGER trg_categorias_updated_at
    BEFORE UPDATE ON categorias
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_produtos_updated_at
    BEFORE UPDATE ON produtos
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_vendas_updated_at
    BEFORE UPDATE ON vendas
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- ==========================================
-- TRIGGER PARA CALCULAR SUBTOTAL
-- ==========================================

CREATE OR REPLACE TRIGGER trg_itens_venda_subtotal
    BEFORE INSERT OR UPDATE ON itens_venda
    FOR EACH ROW
BEGIN
    :NEW.subtotal := :NEW.quantidade * :NEW.preco_unitario;
END;
/

-- ==========================================
-- COMENTÁRIOS NAS TABELAS E COLUNAS
-- ==========================================

-- Categorias
COMMENT ON TABLE categorias IS 'Categorias de produtos para organização e analytics';
COMMENT ON COLUMN categorias.id IS 'Identificador único da categoria';
COMMENT ON COLUMN categorias.nome IS 'Nome da categoria';
COMMENT ON COLUMN categorias.descricao IS 'Descrição detalhada da categoria';

-- Produtos
COMMENT ON TABLE produtos IS 'Produtos cadastrados pelos vendedores';
COMMENT ON COLUMN produtos.id IS 'Identificador único do produto';
COMMENT ON COLUMN produtos.vendedor_id IS 'Vendedor que cadastrou o produto';
COMMENT ON COLUMN produtos.industria_id IS 'Indústria/distribuidor associado ao produto';
COMMENT ON COLUMN produtos.categoria_id IS 'Categoria do produto';
COMMENT ON COLUMN produtos.gtin IS 'Código de barras (EAN/UPC) - até 14 dígitos';
COMMENT ON COLUMN produtos.nome IS 'Nome do produto';
COMMENT ON COLUMN produtos.preco_base IS 'Preço base de venda do produto';
COMMENT ON COLUMN produtos.estoque IS 'Quantidade em estoque';

-- Clientes
COMMENT ON TABLE clientes IS 'Clientes dos vendedores';
COMMENT ON COLUMN clientes.id IS 'Identificador único do cliente';
COMMENT ON COLUMN clientes.vendedor_id IS 'Vendedor responsável pelo cliente';
COMMENT ON COLUMN clientes.documento IS 'CPF ou CNPJ do cliente';

-- Vendas
COMMENT ON TABLE vendas IS 'Registro de vendas realizadas';
COMMENT ON COLUMN vendas.id IS 'Identificador único da venda';
COMMENT ON COLUMN vendas.vendedor_id IS 'Vendedor que realizou a venda';
COMMENT ON COLUMN vendas.cliente_id IS 'Cliente da venda (opcional)';
COMMENT ON COLUMN vendas.data_venda IS 'Data e hora da venda';
COMMENT ON COLUMN vendas.valor_total IS 'Valor total da venda';
COMMENT ON COLUMN vendas.quantidade_itens IS 'Quantidade total de itens vendidos';
COMMENT ON COLUMN vendas.status IS 'Status da venda: CONCLUIDA, CANCELADA, PENDENTE';

-- Itens de Venda
COMMENT ON TABLE itens_venda IS 'Itens individuais de cada venda';
COMMENT ON COLUMN itens_venda.id IS 'Identificador único do item';
COMMENT ON COLUMN itens_venda.venda_id IS 'Venda a qual o item pertence';
COMMENT ON COLUMN itens_venda.produto_id IS 'Produto vendido';
COMMENT ON COLUMN itens_venda.quantidade IS 'Quantidade vendida';
COMMENT ON COLUMN itens_venda.preco_unitario IS 'Preço unitário no momento da venda';
COMMENT ON COLUMN itens_venda.subtotal IS 'Valor total do item (quantidade × preço_unitario)';

-- ==========================================
-- DADOS DE EXEMPLO PARA TESTES
-- ==========================================

-- Categorias
INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Alimentos', 'Produtos alimentícios em geral', 'Y');
INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Bebidas', 'Bebidas em geral', 'Y');
INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Higiene', 'Produtos de higiene pessoal', 'Y');
INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Limpeza', 'Produtos de limpeza', 'Y');
INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Eletrônicos', 'Produtos eletrônicos', 'Y');
INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Roupas', 'Vestuário e acessórios', 'Y');

-- Nota: Para inserir produtos, vendas e clientes de exemplo, 
-- você precisará ter usuários criados na tabela 'usuarios' primeiro.
-- Os exemplos abaixo assumem que existem usuários com IDs 1 (vendedor) e 2 (indústria).

-- Exemplo de produtos (requer vendedor_id = 1 e industria_id = 2)
/*
INSERT INTO produtos (vendedor_id, industria_id, categoria_id, gtin, nome, descricao, preco_base, estoque) 
VALUES (1, 2, 1, '7891234567890', 'Arroz Integral 1kg', 'Arroz integral tipo 1', 8.90, 100);

INSERT INTO produtos (vendedor_id, industria_id, categoria_id, gtin, nome, descricao, preco_base, estoque) 
VALUES (1, 2, 1, '7891234567891', 'Feijão Carioca 1kg', 'Feijão carioca tipo 1', 7.50, 150);

INSERT INTO produtos (vendedor_id, industria_id, categoria_id, gtin, nome, descricao, preco_base, estoque) 
VALUES (1, 2, 1, '7891234567892', 'Açúcar Cristal 1kg', 'Açúcar cristal refinado', 4.20, 200);

INSERT INTO produtos (vendedor_id, categoria_id, gtin, nome, descricao, preco_base, estoque) 
VALUES (1, 2, '7891234567893', 'Refrigerante Cola 2L', 'Refrigerante sabor cola', 6.50, 80);

INSERT INTO produtos (vendedor_id, categoria_id, gtin, nome, descricao, preco_base, estoque) 
VALUES (1, 3, '7891234567894', 'Sabonete Líquido 250ml', 'Sabonete líquido neutro', 12.90, 60);
*/

-- Exemplo de venda
/*
-- Inserir uma venda
INSERT INTO vendas (vendedor_id, data_venda, valor_total, quantidade_itens, status) 
VALUES (1, CURRENT_TIMESTAMP, 29.10, 3, 'CONCLUIDA');

-- Inserir itens da venda (assumindo venda_id = 1 e produtos com IDs 1, 2, 3)
INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) 
VALUES (1, 1, 2, 8.90);

INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) 
VALUES (1, 2, 1, 7.50);

INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario) 
VALUES (1, 3, 1, 4.20);
*/

-- ==========================================
-- QUERIES ÚTEIS PARA OS DASHBOARDS
-- ==========================================

-- ====================================
-- DASHBOARD PRINCIPAL (/seller)
-- ====================================

-- Total de vendas nos últimos 7 dias
/*
SELECT 
    COALESCE(SUM(valor_total), 0) as total_vendas_7d
FROM vendas
WHERE vendedor_id = :vendedor_id
    AND data_venda >= CURRENT_TIMESTAMP - INTERVAL '7' DAY
    AND status = 'CONCLUIDA';
*/

-- Produtos em alta (mais vendidos nos últimos 30 dias)
/*
SELECT 
    p.nome,
    SUM(iv.quantidade) as vendas
FROM produtos p
JOIN itens_venda iv ON p.id = iv.produto_id
JOIN vendas v ON iv.venda_id = v.id
WHERE v.vendedor_id = :vendedor_id
    AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '30' DAY
    AND v.status = 'CONCLUIDA'
GROUP BY p.id, p.nome
ORDER BY vendas DESC
FETCH FIRST 10 ROWS ONLY;
*/

-- Cards de métricas
/*
-- Total de vendas (count)
SELECT COUNT(*) as total_vendas
FROM vendas
WHERE vendedor_id = :vendedor_id
    AND status = 'CONCLUIDA'
    AND data_venda >= CURRENT_TIMESTAMP - INTERVAL '30' DAY;

-- Faturamento total
SELECT COALESCE(SUM(valor_total), 0) as faturamento
FROM vendas
WHERE vendedor_id = :vendedor_id
    AND status = 'CONCLUIDA'
    AND data_venda >= CURRENT_TIMESTAMP - INTERVAL '30' DAY;

-- Total de produtos cadastrados
SELECT COUNT(*) as total_produtos
FROM produtos
WHERE vendedor_id = :vendedor_id
    AND ativo = 'Y';

-- Produtos com estoque baixo
SELECT COUNT(*) as produtos_estoque_baixo
FROM produtos
WHERE vendedor_id = :vendedor_id
    AND ativo = 'Y'
    AND estoque < 10;
*/

-- ====================================
-- ANALYTICS (/seller/analytics)
-- ====================================

-- Performance mensal (últimos 12 meses)
/*
SELECT 
    TO_CHAR(data_venda, 'YYYY-MM') as mes,
    COUNT(*) as qtd_pedidos,
    SUM(valor_total) as receita
FROM vendas
WHERE vendedor_id = :vendedor_id
    AND status = 'CONCLUIDA'
    AND data_venda >= ADD_MONTHS(CURRENT_TIMESTAMP, -12)
GROUP BY TO_CHAR(data_venda, 'YYYY-MM')
ORDER BY mes;
*/

-- Vendas por categoria
/*
SELECT 
    c.nome as categoria,
    COUNT(DISTINCT v.id) as qtd_vendas,
    SUM(iv.subtotal) as valor_vendas
FROM categorias c
JOIN produtos p ON c.id = p.categoria_id
JOIN itens_venda iv ON p.id = iv.produto_id
JOIN vendas v ON iv.venda_id = v.id
WHERE v.vendedor_id = :vendedor_id
    AND v.status = 'CONCLUIDA'
    AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '30' DAY
GROUP BY c.id, c.nome
ORDER BY valor_vendas DESC;
*/

-- Top 5 produtos mais vendidos
/*
SELECT 
    p.nome,
    SUM(iv.quantidade) as qtd_vendida,
    SUM(iv.subtotal) as receita
FROM produtos p
JOIN itens_venda iv ON p.id = iv.produto_id
JOIN vendas v ON iv.venda_id = v.id
WHERE v.vendedor_id = :vendedor_id
    AND v.status = 'CONCLUIDA'
    AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '30' DAY
GROUP BY p.id, p.nome
ORDER BY receita DESC
FETCH FIRST 5 ROWS ONLY;
*/

-- Principais parceiros de indústria
/*
SELECT 
    u.nome as industria,
    COUNT(DISTINCT p.id) as qtd_produtos,
    COUNT(DISTINCT v.id) as qtd_vendas,
    COALESCE(SUM(iv.subtotal), 0) as receita_gerada
FROM usuarios u
JOIN produtos p ON u.id = p.industria_id
LEFT JOIN itens_venda iv ON p.id = iv.produto_id
LEFT JOIN vendas v ON iv.venda_id = v.id AND v.status = 'CONCLUIDA'
WHERE p.vendedor_id = :vendedor_id
    AND u.categoria = 'INDUSTRIA'
GROUP BY u.id, u.nome
ORDER BY receita_gerada DESC
FETCH FIRST 5 ROWS ONLY;
*/

-- ====================================
-- STORE (/seller/store)
-- ====================================

-- Listar todos os produtos do vendedor
/*
SELECT 
    p.id,
    p.gtin,
    p.nome,
    p.preco_base,
    p.estoque,
    c.nome as categoria,
    u.nome as industria,
    p.ativo,
    p.created_at
FROM produtos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN usuarios u ON p.industria_id = u.id
WHERE p.vendedor_id = :vendedor_id
ORDER BY p.created_at DESC;
*/

-- Buscar produto por GTIN (para scan)
/*
SELECT 
    p.id,
    p.gtin,
    p.nome,
    p.preco_base,
    p.estoque,
    p.categoria_id,
    p.industria_id
FROM produtos p
WHERE p.vendedor_id = :vendedor_id
    AND p.gtin = :gtin
    AND p.ativo = 'Y';
*/

-- ====================================
-- HISTÓRICO DE VENDAS (/seller/sell)
-- ====================================

-- Listar vendas recentes
/*
SELECT 
    v.id,
    v.data_venda,
    v.quantidade_itens,
    v.valor_total,
    v.status,
    c.nome as cliente_nome
FROM vendas v
LEFT JOIN clientes c ON v.cliente_id = c.id
WHERE v.vendedor_id = :vendedor_id
ORDER BY v.data_venda DESC
FETCH FIRST 50 ROWS ONLY;
*/

-- Detalhes de uma venda específica
/*
SELECT 
    iv.id,
    p.nome as produto_nome,
    p.gtin,
    iv.quantidade,
    iv.preco_unitario,
    iv.subtotal
FROM itens_venda iv
JOIN produtos p ON iv.produto_id = p.id
WHERE iv.venda_id = :venda_id
ORDER BY iv.id;
*/

-- ====================================
-- SCAN - CADASTRO/VENDA
-- ====================================

-- Verificar se produto existe no catálogo do vendedor
/*
SELECT COUNT(*) as existe
FROM produtos
WHERE vendedor_id = :vendedor_id
    AND gtin = :gtin
    AND ativo = 'Y';
*/

-- Listar indústrias para dropdown (ao cadastrar produto)
/*
SELECT 
    id,
    nome,
    documento as cnpj
FROM usuarios
WHERE categoria = 'INDUSTRIA'
    AND ativo = 'Y'
ORDER BY nome;
*/

-- ==========================================
-- PROCEDURES ÚTEIS (OPCIONAL)
-- ==========================================

-- Procedure para criar uma venda completa
/*
CREATE OR REPLACE PROCEDURE criar_venda(
    p_vendedor_id IN NUMBER,
    p_cliente_id IN NUMBER DEFAULT NULL,
    p_itens IN SYS_REFCURSOR,
    p_venda_id OUT NUMBER
) AS
    v_valor_total NUMBER(10,2) := 0;
    v_qtd_itens NUMBER(10) := 0;
    v_produto_id NUMBER;
    v_quantidade NUMBER;
    v_preco NUMBER(10,2);
BEGIN
    -- Calcular totais (implementação simplificada)
    -- Na prática, você iteraria sobre o cursor de itens
    
    -- Inserir venda
    INSERT INTO vendas (
        vendedor_id, 
        cliente_id, 
        valor_total, 
        quantidade_itens, 
        status
    ) VALUES (
        p_vendedor_id,
        p_cliente_id,
        v_valor_total,
        v_qtd_itens,
        'CONCLUIDA'
    ) RETURNING id INTO p_venda_id;
    
    -- Inserir itens (loop sobre o cursor)
    -- Atualizar estoque dos produtos
    
    COMMIT;
END;
/
*/

-- ==========================================
-- VIEWS ÚTEIS (OPCIONAL)
-- ==========================================

-- View consolidada de produtos com informações completas
/*
CREATE OR REPLACE VIEW v_produtos_completo AS
SELECT 
    p.id,
    p.vendedor_id,
    v.nome as vendedor_nome,
    p.industria_id,
    i.nome as industria_nome,
    p.categoria_id,
    c.nome as categoria_nome,
    p.gtin,
    p.nome as produto_nome,
    p.descricao,
    p.preco_base,
    p.estoque,
    p.ativo,
    p.created_at,
    p.updated_at
FROM produtos p
JOIN usuarios v ON p.vendedor_id = v.id
LEFT JOIN usuarios i ON p.industria_id = i.id
LEFT JOIN categorias c ON p.categoria_id = c.id;
*/

-- View de vendas com detalhes
/*
CREATE OR REPLACE VIEW v_vendas_completo AS
SELECT 
    v.id as venda_id,
    v.vendedor_id,
    u.nome as vendedor_nome,
    v.cliente_id,
    c.nome as cliente_nome,
    v.data_venda,
    v.valor_total,
    v.quantidade_itens,
    v.status,
    v.observacoes,
    v.created_at
FROM vendas v
JOIN usuarios u ON v.vendedor_id = u.id
LEFT JOIN clientes c ON v.cliente_id = c.id;
*/

-- ==========================================
-- FIM DO SCHEMA
-- ==========================================

