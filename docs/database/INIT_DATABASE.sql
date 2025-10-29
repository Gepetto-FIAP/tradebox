-- ==========================================
-- TRADEBOX - INICIALIZAÇÃO COMPLETA DO BANCO DE DADOS
-- Sistema de Trade Marketing para Varejistas e Indústrias
-- Projeto Universitário FIAP - 2025
-- ==========================================
-- 
-- INSTRUÇÕES DE USO:
-- 1. Conecte-se ao Oracle Database como usuário com privilégios DDL
-- 2. Execute este script completo em ordem
-- 3. O script irá:
--    - Criar todas as sequences
--    - Criar todas as tabelas
--    - Criar índices para performance
--    - Criar triggers de auditoria
--    - Inserir dados de exemplo (categorias e usuários de teste)
--
-- ATENÇÃO: Este script assume que o banco está vazio.
-- Se as tabelas já existirem, execute primeiro o script DROP_ALL.sql
-- ==========================================

-- ==========================================
-- PARTE 1: LIMPEZA (OPCIONAL - COMENTADO POR SEGURANÇA)
-- Descomente apenas se precisar recriar tudo do zero
-- ==========================================

/*
-- Drop tables (ordem inversa das FKs)
DROP TABLE itens_venda CASCADE CONSTRAINTS;
DROP TABLE vendas CASCADE CONSTRAINTS;
DROP TABLE clientes CASCADE CONSTRAINTS;
DROP TABLE produtos CASCADE CONSTRAINTS;
DROP TABLE categorias CASCADE CONSTRAINTS;
DROP TABLE usuarios CASCADE CONSTRAINTS;

-- Drop sequences
DROP SEQUENCE seq_itens_venda;
DROP SEQUENCE seq_vendas;
DROP SEQUENCE seq_clientes;
DROP SEQUENCE seq_produtos;
DROP SEQUENCE seq_categorias;
DROP SEQUENCE seq_usuarios;
*/

-- ==========================================
-- PARTE 2: SEQUENCES
-- ==========================================

CREATE SEQUENCE seq_usuarios
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

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
-- PARTE 3: TABELAS
-- ==========================================

-- ------------------------------------------
-- TABELA: USUARIOS
-- Usuários do sistema (Varejistas e Indústrias)
-- ------------------------------------------

CREATE TABLE usuarios (
    -- Chave primária
    id NUMBER(10) DEFAULT seq_usuarios.NEXTVAL PRIMARY KEY,
    
    -- Dados básicos obrigatórios
    email VARCHAR2(320) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    nome VARCHAR2(255) NOT NULL,
    
    -- Categoria do usuário: VAREJISTA ou INDUSTRIA
    categoria VARCHAR2(20) NOT NULL CHECK (categoria IN ('VAREJISTA', 'INDUSTRIA')),
    
    -- Tipo de pessoa (PF ou PJ)
    tipo_pessoa CHAR(2) NOT NULL CHECK (tipo_pessoa IN ('PF', 'PJ')),
    
    -- Documento (CPF ou CNPJ) - apenas números
    documento VARCHAR2(14) NOT NULL UNIQUE,
    
    -- Contato opcional
    telefone VARCHAR2(15),
    endereco VARCHAR2(500),
    
    -- Status da conta
    ativo CHAR(1) DEFAULT 'Y' CHECK (ativo IN ('Y', 'N')),
    
    -- Auditoria simples
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ------------------------------------------
-- TABELA: CATEGORIAS
-- Categorias de produtos para organização e analytics
-- ------------------------------------------

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

-- ------------------------------------------
-- TABELA: PRODUTOS
-- Produtos cadastrados pelos vendedores
-- ------------------------------------------

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
    preco_custo NUMBER(10,2) DEFAULT 0 NOT NULL CHECK (preco_custo >= 0),
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
    
    -- Unique constraint: mesmo GTIN pode existir para vendedor+industria diferentes
    CONSTRAINT uk_produto_vendedor_gtin_industria UNIQUE (vendedor_id, gtin, industria_id)
);

-- ------------------------------------------
-- TABELA: CLIENTES
-- Clientes dos vendedores (opcional)
-- ------------------------------------------

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

-- ------------------------------------------
-- TABELA: VENDAS
-- Registro de vendas realizadas
-- ------------------------------------------

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

-- ------------------------------------------
-- TABELA: ITENS_VENDA
-- Itens individuais de cada venda
-- ------------------------------------------

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
-- PARTE 4: ÍNDICES PARA PERFORMANCE
-- ==========================================

-- Índices de USUARIOS
CREATE UNIQUE INDEX idx_usuarios_email ON usuarios (email);
CREATE UNIQUE INDEX idx_usuarios_documento ON usuarios (documento);
CREATE INDEX idx_usuarios_categoria ON usuarios (categoria);
CREATE INDEX idx_usuarios_ativo ON usuarios (ativo);

-- Índices de CATEGORIAS
CREATE INDEX idx_categorias_ativo ON categorias (ativo);

-- Índices de PRODUTOS
CREATE INDEX idx_produtos_vendedor ON produtos (vendedor_id);
CREATE INDEX idx_produtos_industria ON produtos (industria_id);
CREATE INDEX idx_produtos_categoria ON produtos (categoria_id);
CREATE INDEX idx_produtos_gtin ON produtos (gtin);
CREATE INDEX idx_produtos_ativo ON produtos (ativo);
CREATE INDEX idx_produtos_estoque ON produtos (estoque);
CREATE INDEX idx_produtos_margem ON produtos (preco_base, preco_custo);

-- Índices de CLIENTES
CREATE INDEX idx_clientes_vendedor ON clientes (vendedor_id);
CREATE INDEX idx_clientes_ativo ON clientes (ativo);

-- Índices de VENDAS
CREATE INDEX idx_vendas_vendedor ON vendas (vendedor_id);
CREATE INDEX idx_vendas_cliente ON vendas (cliente_id);
CREATE INDEX idx_vendas_data ON vendas (data_venda);
CREATE INDEX idx_vendas_status ON vendas (status);

-- Índices de ITENS_VENDA
CREATE INDEX idx_itens_venda ON itens_venda (venda_id);
CREATE INDEX idx_itens_produto ON itens_venda (produto_id);

-- ==========================================
-- PARTE 5: CONSTRAINTS ADICIONAIS
-- ==========================================

-- Indústrias devem ter CNPJ
ALTER TABLE usuarios ADD CONSTRAINT chk_industria_cnpj
CHECK (
    (categoria = 'INDUSTRIA' AND tipo_pessoa = 'PJ')
    OR categoria = 'VAREJISTA'
);

-- Email válido
ALTER TABLE usuarios ADD CONSTRAINT chk_email_format 
CHECK (REGEXP_LIKE(email, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'));

-- CPF: 11 dígitos para PF
ALTER TABLE usuarios ADD CONSTRAINT chk_cpf_format 
CHECK (
    (tipo_pessoa = 'PF' AND LENGTH(documento) = 11 AND REGEXP_LIKE(documento, '^[0-9]{11}$'))
    OR tipo_pessoa = 'PJ'
);

-- CNPJ: 14 dígitos para PJ
ALTER TABLE usuarios ADD CONSTRAINT chk_cnpj_format 
CHECK (
    (tipo_pessoa = 'PJ' AND LENGTH(documento) = 14 AND REGEXP_LIKE(documento, '^[0-9]{14}$'))
    OR tipo_pessoa = 'PF'
);


-- Preço custo não pode ser maior que preço base
ALTER TABLE produtos ADD CONSTRAINT chk_preco_custo_valido 
CHECK (preco_custo <= preco_base);

-- ==========================================
-- PARTE 6: TRIGGERS DE AUDITORIA
-- ==========================================

-- Trigger para USUARIOS
CREATE OR REPLACE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Trigger para CATEGORIAS
CREATE OR REPLACE TRIGGER trg_categorias_updated_at
    BEFORE UPDATE ON categorias
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Trigger para PRODUTOS
CREATE OR REPLACE TRIGGER trg_produtos_updated_at
    BEFORE UPDATE ON produtos
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Trigger para CLIENTES
CREATE OR REPLACE TRIGGER trg_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- Trigger para VENDAS
CREATE OR REPLACE TRIGGER trg_vendas_updated_at
    BEFORE UPDATE ON vendas
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- ==========================================
-- PARTE 7: COMENTÁRIOS NAS TABELAS E COLUNAS
-- ==========================================

-- USUARIOS
COMMENT ON TABLE usuarios IS 'Usuários do sistema (Varejistas e Indústrias)';
COMMENT ON COLUMN usuarios.id IS 'Identificador único do usuário';
COMMENT ON COLUMN usuarios.email IS 'Email único do usuário (usado para login)';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash bcrypt da senha';
COMMENT ON COLUMN usuarios.nome IS 'Nome completo (PF) ou Razão Social (PJ)';
COMMENT ON COLUMN usuarios.categoria IS 'VAREJISTA ou INDUSTRIA';
COMMENT ON COLUMN usuarios.tipo_pessoa IS 'PF (CPF) ou PJ (CNPJ)';
COMMENT ON COLUMN usuarios.documento IS 'CPF (11 dígitos) ou CNPJ (14 dígitos)';

-- CATEGORIAS
COMMENT ON TABLE categorias IS 'Categorias de produtos para organização';
COMMENT ON COLUMN categorias.nome IS 'Nome único da categoria';

-- PRODUTOS
COMMENT ON TABLE produtos IS 'Produtos cadastrados pelos vendedores';
COMMENT ON COLUMN produtos.gtin IS 'Código de barras global (8-14 dígitos)';
COMMENT ON COLUMN produtos.preco_base IS 'Preço de venda ao consumidor';
COMMENT ON COLUMN produtos.preco_custo IS 'Preço de custo pago à indústria';
COMMENT ON COLUMN produtos.estoque IS 'Quantidade em estoque';

-- VENDAS
COMMENT ON TABLE vendas IS 'Registro de vendas realizadas';
COMMENT ON COLUMN vendas.valor_total IS 'Valor total da venda';
COMMENT ON COLUMN vendas.quantidade_itens IS 'Quantidade total de itens vendidos';

-- ITENS_VENDA
COMMENT ON TABLE itens_venda IS 'Itens individuais de cada venda';
COMMENT ON COLUMN itens_venda.subtotal IS 'quantidade * preco_unitario';

-- ==========================================
-- PARTE 8: DADOS INICIAIS (DML)
-- ==========================================

-- ------------------------------------------
-- CATEGORIAS PADRÃO
-- ------------------------------------------

INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Alimentos', 'Produtos alimentícios em geral', 'Y');

INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Bebidas', 'Bebidas alcoólicas e não alcoólicas', 'Y');

INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Higiene', 'Produtos de higiene pessoal', 'Y');

INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Limpeza', 'Produtos de limpeza doméstica', 'Y');

INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Mercearia', 'Produtos de mercearia seca', 'Y');

INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Frios e Laticínios', 'Produtos refrigerados', 'Y');

INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Padaria', 'Pães, bolos e confeitaria', 'Y');

INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Açougue', 'Carnes e derivados', 'Y');

INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Hortifruti', 'Frutas, legumes e verduras', 'Y');

INSERT INTO categorias (nome, descricao, ativo) VALUES 
    ('Congelados', 'Produtos congelados', 'Y');

-- ------------------------------------------
-- USUÁRIOS DE TESTE
-- ------------------------------------------

-- Senha padrão para todos: "senha123"
-- Hash bcrypt: $2b$10$rOjLKZ5RxZ5RxZ5RxZ5RxeK7vGH4kqH4kqH4kqH4kqH4kqH4kqH4kq

-- Varejista 1 - Pessoa Física
INSERT INTO usuarios (
    email, password_hash, nome, categoria, tipo_pessoa, documento, 
    telefone, endereco, ativo
) VALUES (
    'joao@varejista.com',
    '$2b$10$rOjLKZ5RxZ5RxZ5RxZ5RxeK7vGH4kqH4kqH4kqH4kqH4kqH4kqH4kq',
    'João Silva Santos',
    'VAREJISTA',
    'PF',
    '12345678901',
    '11999999999',
    'Rua do Comércio, 123, São Paulo - SP',
    'Y'
);

-- Varejista 2 - Pessoa Jurídica
INSERT INTO usuarios (
    email, password_hash, nome, categoria, tipo_pessoa, documento, 
    telefone, endereco, ativo
) VALUES (
    'contato@mercadinho.com',
    '$2b$10$rOjLKZ5RxZ5RxZ5RxZ5RxeK7vGH4kqH4kqH4kqH4kqH4kqH4kqH4kq',
    'Mercadinho Bom Preço LTDA',
    'VAREJISTA',
    'PJ',
    '12345678000100',
    '1133334444',
    'Av. Principal, 456, São Paulo - SP',
    'Y'
);

-- Indústria 1 - Coca-Cola
INSERT INTO usuarios (
    email, password_hash, nome, categoria, tipo_pessoa, documento, 
    telefone, endereco, ativo
) VALUES (
    'vendas@cocacola.com.br',
    '$2b$10$rOjLKZ5RxZ5RxZ5RxZ5RxeK7vGH4kqH4kqH4kqH4kqH4kqH4kqH4kq',
    'Coca-Cola Brasil S/A',
    'INDUSTRIA',
    'PJ',
    '45997418000153',
    '08007071212',
    'Rod. Presidente Dutra, km 154, Guarulhos - SP',
    'Y'
);

-- Indústria 2 - Nestlé
INSERT INTO usuarios (
    email, password_hash, nome, categoria, tipo_pessoa, documento, 
    telefone, endereco, ativo
) VALUES (
    'comercial@nestle.com.br',
    '$2b$10$rOjLKZ5RxZ5RxZ5RxZ5RxeK7vGH4kqH4kqH4kqH4kqH4kqH4kqH4kq',
    'Nestlé Brasil LTDA',
    'INDUSTRIA',
    'PJ',
    '60409075000192',
    '08007027000',
    'Av. das Nações Unidas, 12.495, São Paulo - SP',
    'Y'
);

-- Indústria 3 - Unilever
INSERT INTO usuarios (
    email, password_hash, nome, categoria, tipo_pessoa, documento, 
    telefone, endereco, ativo
) VALUES (
    'contato@unilever.com.br',
    '$2b$10$rOjLKZ5RxZ5RxZ5RxZ5RxeK7vGH4kqH4kqH4kqH4kqH4kqH4kqH4kq',
    'Unilever Brasil Industrial LTDA',
    'INDUSTRIA',
    'PJ',
    '61068276000180',
    '08007073456',
    'Rod. Vinhedo-Viracopos, km 77, Vinhedo - SP',
    'Y'
);

-- ------------------------------------------
-- PRODUTOS DE EXEMPLO (para o primeiro varejista)
-- ------------------------------------------

-- Produto 1: Coca-Cola Lata 350ml
INSERT INTO produtos (
    vendedor_id, industria_id, categoria_id, gtin, nome, descricao,
    preco_base, preco_custo, estoque, ativo
) VALUES (
    1, -- João Silva Santos
    3, -- Coca-Cola
    2, -- Bebidas
    '7894900011517',
    'Coca-Cola Lata 350ml',
    'Refrigerante Coca-Cola em lata de 350ml',
    5.50,
    3.20,
    100,
    'Y'
);

-- Produto 2: Nescau Cereal 210g
INSERT INTO produtos (
    vendedor_id, industria_id, categoria_id, gtin, nome, descricao,
    preco_base, preco_custo, estoque, ativo
) VALUES (
    1, -- João Silva Santos
    4, -- Nestlé
    1, -- Alimentos
    '7891000100103',
    'Nescau Cereal 210g',
    'Cereal matinal sabor chocolate Nescau',
    12.90,
    8.50,
    50,
    'Y'
);

-- Produto 3: Dove Sabonete 90g
INSERT INTO produtos (
    vendedor_id, industria_id, categoria_id, gtin, nome, descricao,
    preco_base, preco_custo, estoque, ativo
) VALUES (
    1, -- João Silva Santos
    5, -- Unilever
    3, -- Higiene
    '7891150017504',
    'Dove Sabonete Original 90g',
    'Sabonete em barra Dove Original',
    4.99,
    2.80,
    200,
    'Y'
);

-- Produto 4: Leite Ninho 400g
INSERT INTO produtos (
    vendedor_id, industria_id, categoria_id, gtin, nome, descricao,
    preco_base, preco_custo, estoque, ativo
) VALUES (
    1, -- João Silva Santos
    4, -- Nestlé
    6, -- Frios e Laticínios
    '7891000100004',
    'Leite Ninho Integral 400g',
    'Leite em pó integral Ninho',
    18.90,
    12.50,
    30,
    'Y'
);

-- Produto 5: Omo Líquido 3L
INSERT INTO produtos (
    vendedor_id, industria_id, categoria_id, gtin, nome, descricao,
    preco_base, preco_custo, estoque, ativo
) VALUES (
    1, -- João Silva Santos
    5, -- Unilever
    4, -- Limpeza
    '7891150061002',
    'Omo Líquido Lavagem Perfeita 3L',
    'Sabão líquido para roupas Omo 3 litros',
    32.90,
    22.00,
    25,
    'Y'
);

-- ==========================================
-- PARTE 9: COMMIT
-- ==========================================

COMMIT;

-- ==========================================
-- FIM DA INICIALIZAÇÃO
-- ==========================================

-- Verificar dados inseridos
SELECT 'Usuários cadastrados: ' || COUNT(*) as resultado FROM usuarios;
SELECT 'Categorias cadastradas: ' || COUNT(*) as resultado FROM categorias;
SELECT 'Produtos cadastrados: ' || COUNT(*) as resultado FROM produtos;

-- ==========================================
-- QUERIES ÚTEIS PARA VALIDAÇÃO
-- ==========================================

/*
-- Listar todos os usuários
SELECT id, email, nome, categoria, tipo_pessoa FROM usuarios WHERE ativo = 'Y';

-- Listar todas as categorias
SELECT id, nome, descricao FROM categorias WHERE ativo = 'Y';

-- Listar produtos com detalhes
SELECT 
    p.id,
    p.nome as produto,
    p.gtin,
    p.preco_base,
    p.preco_custo,
    (p.preco_base - p.preco_custo) as lucro_unitario,
    ROUND(((p.preco_base - p.preco_custo) / p.preco_custo * 100), 2) as margem_percentual,
    p.estoque,
    c.nome as categoria,
    u.nome as vendedor,
    i.nome as industria
FROM produtos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN usuarios u ON p.vendedor_id = u.id
LEFT JOIN usuarios i ON p.industria_id = i.id
WHERE p.ativo = 'Y'
ORDER BY p.id;

-- Verificar integridade referencial
SELECT 
    'Produtos sem vendedor' as tipo,
    COUNT(*) as quantidade
FROM produtos p
LEFT JOIN usuarios u ON p.vendedor_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 
    'Produtos com indústria inválida' as tipo,
    COUNT(*) as quantidade
FROM produtos p
LEFT JOIN usuarios i ON p.industria_id = i.id
WHERE p.industria_id IS NOT NULL AND i.id IS NULL;
*/

-- ==========================================
-- INFORMAÇÕES IMPORTANTES
-- ==========================================

/*
CREDENCIAIS DE TESTE:
- Email: joao@varejista.com
- Email: contato@mercadinho.com
- Email: vendas@cocacola.com.br
- Email: comercial@nestle.com.br
- Email: contato@unilever.com.br
- Senha para todos: senha123

OBSERVAÇÕES:
1. O hash de senha fornecido é apenas um exemplo
2. Em produção, use bcrypt com salt adequado
3. Ajuste os dados de exemplo conforme necessário
4. Mantenha backups regulares do banco de dados
5. Revise as permissões de usuários do Oracle

PRÓXIMOS PASSOS:
1. Criar usuários adicionais conforme necessário
2. Cadastrar mais produtos
3. Realizar vendas de teste
4. Validar relatórios e analytics
5. Ajustar índices baseado em performance real
*/

