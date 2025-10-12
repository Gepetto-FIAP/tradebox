-- ==========================================
-- TRADEBOX - SCHEMA SIMPLIFICADO DE USUÁRIOS
-- Sistema de autenticação simplificado para projeto universitário
-- ==========================================

-- Criação da sequência para IDs
CREATE SEQUENCE seq_usuarios
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Tabela simplificada de usuários
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

-- ==========================================
-- ÍNDICES PARA PERFORMANCE
-- ==========================================

CREATE UNIQUE INDEX idx_usuarios_email ON usuarios (email);
CREATE UNIQUE INDEX idx_usuarios_documento ON usuarios (documento);
CREATE INDEX idx_usuarios_categoria ON usuarios (categoria);

-- ==========================================
-- TRIGGER PARA UPDATED_AT
-- ==========================================

CREATE OR REPLACE TRIGGER trg_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- ==========================================
-- CONSTRAINT: Indústrias devem ter CNPJ
-- ==========================================

ALTER TABLE usuarios ADD CONSTRAINT chk_industria_cnpj
CHECK (
    (categoria = 'INDUSTRIA' AND tipo_pessoa = 'PJ')
    OR categoria = 'VAREJISTA'
);

-- ==========================================
-- VALIDAÇÕES DE FORMATO
-- ==========================================

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

-- ==========================================
-- COMENTÁRIOS
-- ==========================================

COMMENT ON TABLE usuarios IS 'Tabela simplificada de usuários TradeBox';
COMMENT ON COLUMN usuarios.id IS 'Identificador único do usuário';
COMMENT ON COLUMN usuarios.email IS 'Email único do usuário (usado para login)';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash bcrypt da senha';
COMMENT ON COLUMN usuarios.nome IS 'Nome completo (PF) ou Razão Social (PJ)';
COMMENT ON COLUMN usuarios.categoria IS 'VAREJISTA ou INDUSTRIA';
COMMENT ON COLUMN usuarios.tipo_pessoa IS 'PF (CPF) ou PJ (CNPJ)';
COMMENT ON COLUMN usuarios.documento IS 'CPF (11 dígitos) ou CNPJ (14 dígitos)';

-- ==========================================
-- EXEMPLOS DE INSERÇÃO (PARA TESTES)
-- ==========================================

-- Varejista Pessoa Física
INSERT INTO usuarios (
    email, password_hash, nome, categoria, tipo_pessoa, documento, 
    telefone, endereco, ativo
) VALUES (
    'joao@varejista.com',
    '$2b$10$hash_aqui', -- Substituir por hash real
    'João Silva Santos',
    'VAREJISTA',
    'PF',
    '12345678901',
    '11999999999',
    'Rua do Comércio, 123, São Paulo',
    'Y'
);

-- Indústria (sempre CNPJ)
INSERT INTO usuarios (
    email, password_hash, nome, categoria, tipo_pessoa, documento, 
    telefone, endereco, ativo
) VALUES (
    'contato@industria.com',
    '$2b$10$hash_aqui', -- Substituir por hash real
    'Indústria ABC S/A',
    'INDUSTRIA',
    'PJ',
    '12345678000195',
    '1133334444',
    'Rod. Industrial, km 45',
    'Y'
);

-- ==========================================
-- QUERIES ÚTEIS
-- ==========================================

-- Buscar usuário por email (para login)
-- SELECT * FROM usuarios WHERE email = :email AND ativo = 'Y';

-- Verificar se email já existe
-- SELECT COUNT(*) FROM usuarios WHERE email = :email;

-- Verificar se documento já existe
-- SELECT COUNT(*) FROM usuarios WHERE documento = :documento;

-- Listar por categoria
-- SELECT * FROM usuarios WHERE categoria = 'VAREJISTA' AND ativo = 'Y';

