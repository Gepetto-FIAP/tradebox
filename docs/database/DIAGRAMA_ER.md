# Diagrama Entidade-Relacionamento - TradeBox

## Sistema de Trade Marketing para Varejistas e Indústrias

```mermaid
erDiagram
    USUARIOS ||--o{ PRODUTOS : "vendedor_id (1:N)"
    USUARIOS ||--o{ PRODUTOS : "industria_id (1:N)"
    USUARIOS ||--o{ CLIENTES : "vendedor_id (1:N)"
    USUARIOS ||--o{ VENDAS : "vendedor_id (1:N)"
    CATEGORIAS ||--o{ PRODUTOS : "categoria_id (1:N)"
    CLIENTES ||--o{ VENDAS : "cliente_id (1:N)"
    VENDAS ||--|{ ITENS_VENDA : "venda_id (1:N)"
    PRODUTOS ||--o{ ITENS_VENDA : "produto_id (1:N)"

    USUARIOS {
        NUMBER id PK "Sequence: seq_usuarios"
        VARCHAR2 email UK "NOT NULL, max 320"
        VARCHAR2 password_hash "NOT NULL, max 255"
        VARCHAR2 nome "NOT NULL, max 255"
        VARCHAR2 categoria "NOT NULL, VAREJISTA ou INDUSTRIA"
        CHAR tipo_pessoa "NOT NULL, PF ou PJ"
        VARCHAR2 documento UK "NOT NULL, max 14, CPF ou CNPJ"
        VARCHAR2 telefone "max 15"
        VARCHAR2 endereco "max 500"
        CHAR ativo "DEFAULT Y, Y ou N"
        TIMESTAMP created_at "NOT NULL"
        TIMESTAMP updated_at "NOT NULL"
    }

    CATEGORIAS {
        NUMBER id PK "Sequence: seq_categorias"
        VARCHAR2 nome UK "NOT NULL, max 100"
        VARCHAR2 descricao "max 500"
        CHAR ativo "DEFAULT Y, Y ou N"
        TIMESTAMP created_at "NOT NULL"
        TIMESTAMP updated_at "NOT NULL"
    }

    PRODUTOS {
        NUMBER id PK "Sequence: seq_produtos"
        NUMBER vendedor_id FK "NOT NULL, ref: USUARIOS"
        NUMBER industria_id FK "ref: USUARIOS"
        NUMBER categoria_id FK "ref: CATEGORIAS"
        VARCHAR2 gtin "NOT NULL, max 14"
        VARCHAR2 nome "NOT NULL, max 255"
        VARCHAR2 descricao "max 1000"
        NUMBER preco_base "NOT NULL, CHECK >= 0"
        NUMBER preco_custo "NOT NULL DEFAULT 0, CHECK >= 0"
        NUMBER estoque "DEFAULT 0, CHECK >= 0"
        CHAR ativo "DEFAULT Y, Y ou N"
        TIMESTAMP created_at "NOT NULL"
        TIMESTAMP updated_at "NOT NULL"
    }

    CLIENTES {
        NUMBER id PK "Sequence: seq_clientes"
        NUMBER vendedor_id FK "NOT NULL, ref: USUARIOS"
        VARCHAR2 nome "NOT NULL, max 255"
        VARCHAR2 documento "max 14"
        VARCHAR2 telefone "max 15"
        VARCHAR2 email "max 320"
        VARCHAR2 endereco "max 500"
        CHAR ativo "DEFAULT Y, Y ou N"
        TIMESTAMP created_at "NOT NULL"
        TIMESTAMP updated_at "NOT NULL"
    }

    VENDAS {
        NUMBER id PK "Sequence: seq_vendas"
        NUMBER vendedor_id FK "NOT NULL, ref: USUARIOS"
        NUMBER cliente_id FK "ref: CLIENTES"
        TIMESTAMP data_venda "NOT NULL"
        NUMBER valor_total "NOT NULL, CHECK >= 0"
        NUMBER quantidade_itens "DEFAULT 0, CHECK >= 0"
        VARCHAR2 status "DEFAULT CONCLUIDA"
        VARCHAR2 observacoes "max 1000"
        TIMESTAMP created_at "NOT NULL"
        TIMESTAMP updated_at "NOT NULL"
    }

    ITENS_VENDA {
        NUMBER id PK "Sequence: seq_itens_venda"
        NUMBER venda_id FK "NOT NULL, ref: VENDAS"
        NUMBER produto_id FK "NOT NULL, ref: PRODUTOS"
        NUMBER quantidade "NOT NULL, CHECK > 0"
        NUMBER preco_unitario "NOT NULL, CHECK >= 0"
        NUMBER subtotal "NOT NULL, CHECK >= 0"
        TIMESTAMP created_at "NOT NULL"
    }
```

---

## Descrição das Entidades

### 1. **USUARIOS**
- **Tipo**: Tabela principal do sistema
- **Descrição**: Armazena usuários do sistema (Varejistas e Indústrias)
- **Categoria**: VAREJISTA ou INDUSTRIA
- **Tipo Pessoa**: PF (Pessoa Física - CPF) ou PJ (Pessoa Jurídica - CNPJ)
- **Regras**:
  - Indústrias devem ser obrigatoriamente PJ
  - Email único e validado por regex
  - CPF: 11 dígitos numéricos
  - CNPJ: 14 dígitos numéricos

### 2. **CATEGORIAS**
- **Tipo**: Tabela auxiliar
- **Descrição**: Categorias de produtos para organização
- **Exemplos**: Alimentos, Bebidas, Higiene, Limpeza, etc.

### 3. **PRODUTOS**
- **Tipo**: Tabela principal
- **Descrição**: Produtos cadastrados pelos vendedores (varejistas)
- **GTIN**: Código de barras global (8-14 dígitos)
- **Relacionamentos**:
  - Pertence a um **vendedor** (VAREJISTA)
  - Pode ter uma **indústria** fornecedora (opcional)
  - Pode ter uma **categoria** (opcional)
- **Precificação**:
  - `preco_base`: Preço de venda ao consumidor
  - `preco_custo`: Preço pago à indústria (pode ser 0 inicialmente)
- **Constraint única**: `(vendedor_id, gtin, industria_id)`

### 4. **CLIENTES**
- **Tipo**: Tabela auxiliar
- **Descrição**: Clientes dos vendedores (opcional nas vendas)
- **Relacionamento**: Pertence a um vendedor

### 5. **VENDAS**
- **Tipo**: Tabela transacional
- **Descrição**: Registro de vendas realizadas
- **Status**: CONCLUIDA, CANCELADA ou PENDENTE
- **Relacionamentos**:
  - Feita por um **vendedor**
  - Pode ter um **cliente** associado (opcional)
- **Campos calculados**:
  - `valor_total`: Soma dos subtotais dos itens
  - `quantidade_itens`: Soma das quantidades dos itens

### 6. **ITENS_VENDA**
- **Tipo**: Tabela transacional (detalhamento)
- **Descrição**: Itens individuais de cada venda
- **Relacionamentos**:
  - Pertence a uma **venda**
  - Referencia um **produto**
- **Campos**:
  - `quantidade`: Unidades vendidas
  - `preco_unitario`: Preço no momento da venda
  - `subtotal`: quantidade × preco_unitario

---

## Relacionamentos

### **1:N (Um para Muitos)**

1. **USUARIOS (VAREJISTA) → PRODUTOS**
   - Um varejista pode cadastrar vários produtos
   - `produtos.vendedor_id` → `usuarios.id`
   - `ON DELETE CASCADE`

2. **USUARIOS (INDUSTRIA) → PRODUTOS**
   - Uma indústria pode fornecer vários produtos
   - `produtos.industria_id` → `usuarios.id`
   - `ON DELETE SET NULL`

3. **USUARIOS → CLIENTES**
   - Um varejista pode ter vários clientes
   - `clientes.vendedor_id` → `usuarios.id`
   - `ON DELETE CASCADE`

4. **USUARIOS → VENDAS**
   - Um varejista pode fazer várias vendas
   - `vendas.vendedor_id` → `usuarios.id`
   - `ON DELETE CASCADE`

5. **CATEGORIAS → PRODUTOS**
   - Uma categoria pode ter vários produtos
   - `produtos.categoria_id` → `categorias.id`
   - `ON DELETE SET NULL`

6. **CLIENTES → VENDAS**
   - Um cliente pode ter várias vendas
   - `vendas.cliente_id` → `clientes.id`
   - `ON DELETE SET NULL`

7. **VENDAS → ITENS_VENDA**
   - Uma venda pode ter vários itens
   - `itens_venda.venda_id` → `vendas.id`
   - `ON DELETE CASCADE`

8. **PRODUTOS → ITENS_VENDA**
   - Um produto pode estar em vários itens de venda
   - `itens_venda.produto_id` → `produtos.id`

---

## Índices para Performance

### **USUARIOS**
- `idx_usuarios_email` (UNIQUE) → email
- `idx_usuarios_documento` (UNIQUE) → documento
- `idx_usuarios_categoria` → categoria
- `idx_usuarios_ativo` → ativo

### **CATEGORIAS**
- `idx_categorias_ativo` → ativo

### **PRODUTOS**
- `idx_produtos_vendedor` → vendedor_id
- `idx_produtos_industria` → industria_id
- `idx_produtos_categoria` → categoria_id
- `idx_produtos_gtin` → gtin
- `idx_produtos_ativo` → ativo
- `idx_produtos_estoque` → estoque
- `idx_produtos_margem` → (preco_base, preco_custo)

### **CLIENTES**
- `idx_clientes_vendedor` → vendedor_id
- `idx_clientes_ativo` → ativo

### **VENDAS**
- `idx_vendas_vendedor` → vendedor_id
- `idx_vendas_cliente` → cliente_id
- `idx_vendas_data` → data_venda
- `idx_vendas_status` → status

### **ITENS_VENDA**
- `idx_itens_venda` → venda_id
- `idx_itens_produto` → produto_id

---

## Triggers de Auditoria

Todas as tabelas principais possuem triggers que atualizam automaticamente o campo `updated_at`:

- `trg_usuarios_updated_at`
- `trg_categorias_updated_at`
- `trg_produtos_updated_at`
- `trg_clientes_updated_at`
- `trg_vendas_updated_at`

---

## Constraints Adicionais

1. **Indústrias devem ter CNPJ**: `chk_industria_cnpj`
2. **Email válido**: `chk_email_format` (regex)
3. **CPF válido**: `chk_cpf_format` (11 dígitos)
4. **CNPJ válido**: `chk_cnpj_format` (14 dígitos)
5. **Preço custo ≤ Preço base**: `chk_preco_custo_valido`

---

## Fluxo de Dados Típico

1. **Cadastro de Usuário** (VAREJISTA ou INDUSTRIA)
2. **Cadastro de Categorias** (sistema)
3. **Cadastro de Produtos** (VAREJISTA)
   - Pode associar uma INDUSTRIA
   - Pode associar uma CATEGORIA
4. **Cadastro de Clientes** (VAREJISTA) - opcional
5. **Registro de Venda** (VAREJISTA)
   - Cria registro em VENDAS
   - Adiciona itens em ITENS_VENDA
   - Atualiza estoque dos PRODUTOS
6. **Indústria define preço de custo** (INDUSTRIA)
   - Atualiza `preco_custo` em PRODUTOS

---

## Versão
- **Database**: Oracle 19c+
- **Projeto**: TradeBox - Sistema de Trade Marketing
- **Data**: 2025
- **Instituição**: FIAP

