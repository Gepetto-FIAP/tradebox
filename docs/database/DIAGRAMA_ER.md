# Diagrama Entidade-Relacionamento - TradeBox

## Visão Geral do Schema

Este documento apresenta o diagrama ER do sistema TradeBox focado no módulo de vendas.

## Diagrama Completo

```
┌─────────────────────────┐
│      USUARIOS           │
│  (VAREJISTA/INDUSTRIA)  │
└─────────────────────────┘
            │
            │ 1:N (vendedor)
            ▼
┌─────────────────────────┐           ┌─────────────────┐
│      PRODUTOS           │◄──────────│   CATEGORIAS    │
│                         │  N:1      │                 │
│  - id (PK)              │ (opcional)│  - id (PK)      │
│  - vendedor_id (FK)     │           │  - nome         │
│  - industria_id (FK)    │           │  - descricao    │
│  - categoria_id (FK)    │           │  - ativo        │
│  - gtin                 │           └─────────────────┘
│  - nome                 │
│  - descricao            │
│  - preco_base           │
│  - estoque              │
│  - ativo                │
└─────────────────────────┘
            │
            │ 1:N
            ▼
┌─────────────────────────┐
│    ITENS_VENDA          │
│                         │
│  - id (PK)              │
│  - venda_id (FK)        │
│  - produto_id (FK)      │
│  - quantidade           │
│  - preco_unitario       │
│  - subtotal             │
└─────────────────────────┘
            │
            │ N:1
            ▼
┌─────────────────────────┐           ┌─────────────────┐
│       VENDAS            │◄──────────│    CLIENTES     │
│                         │  N:1      │                 │
│  - id (PK)              │ (opcional)│  - id (PK)      │
│  - vendedor_id (FK)     │           │  - vendedor_id  │
│  - cliente_id (FK)      │           │  - nome         │
│  - data_venda           │           │  - documento    │
│  - valor_total          │           │  - telefone     │
│  - quantidade_itens     │           │  - email        │
│  - status               │           │  - ativo        │
│  - observacoes          │           └─────────────────┘
└─────────────────────────┘
```

## Relacionamentos Detalhados

### USUARIOS → PRODUTOS
- **Tipo:** 1:N (um para muitos)
- **Vendedor:** Um vendedor pode cadastrar muitos produtos
- **Indústria:** Uma indústria pode estar associada a muitos produtos (opcional)
- **Cascata:** DELETE CASCADE no vendedor (deleta produtos ao deletar vendedor)
- **Cascata:** SET NULL na indústria (mantém produto ao deletar indústria)

```
usuarios (vendedor)  ─┬─→ produtos[vendedor_id]
                      ├─→ produtos[vendedor_id]
                      └─→ produtos[vendedor_id]

usuarios (industria) ─┬─→ produtos[industria_id]
                      └─→ produtos[industria_id]
```

### CATEGORIAS → PRODUTOS
- **Tipo:** 1:N (um para muitos)
- **Descrição:** Uma categoria pode ter muitos produtos
- **Opcional:** Produto pode não ter categoria
- **Cascata:** SET NULL (mantém produto ao deletar categoria)

```
categorias ─┬─→ produtos[categoria_id]
            ├─→ produtos[categoria_id]
            └─→ produtos[categoria_id]
```

### PRODUTOS → ITENS_VENDA
- **Tipo:** 1:N (um para muitos)
- **Descrição:** Um produto pode estar em muitas vendas
- **Cascata:** RESTRICT (não permite deletar produto com vendas)

```
produtos ─┬─→ itens_venda[produto_id]
          ├─→ itens_venda[produto_id]
          └─→ itens_venda[produto_id]
```

### VENDAS → ITENS_VENDA
- **Tipo:** 1:N (um para muitos)
- **Descrição:** Uma venda tem muitos itens
- **Cascata:** DELETE CASCADE (deleta itens ao deletar venda)

```
vendas ─┬─→ itens_venda[venda_id]
        ├─→ itens_venda[venda_id]
        └─→ itens_venda[venda_id]
```

### USUARIOS → VENDAS
- **Tipo:** 1:N (um para muitos)
- **Descrição:** Um vendedor pode fazer muitas vendas
- **Cascata:** DELETE CASCADE (deleta vendas ao deletar vendedor)

```
usuarios (vendedor) ─┬─→ vendas[vendedor_id]
                     ├─→ vendas[vendedor_id]
                     └─→ vendas[vendedor_id]
```

### CLIENTES → VENDAS
- **Tipo:** 1:N (um para muitos)
- **Descrição:** Um cliente pode ter muitas vendas
- **Opcional:** Venda pode não ter cliente associado
- **Cascata:** SET NULL (mantém venda ao deletar cliente)

```
clientes ─┬─→ vendas[cliente_id]
          ├─→ vendas[cliente_id]
          └─→ vendas[cliente_id]
```

### USUARIOS → CLIENTES
- **Tipo:** 1:N (um para muitos)
- **Descrição:** Um vendedor pode cadastrar muitos clientes
- **Cascata:** DELETE CASCADE (deleta clientes ao deletar vendedor)

```
usuarios (vendedor) ─┬─→ clientes[vendedor_id]
                     ├─→ clientes[vendedor_id]
                     └─→ clientes[vendedor_id]
```

## Cardinalidades

| Relacionamento | De | Para | Tipo | Obrigatório |
|---------------|-----|------|------|-------------|
| Vendedor cadastra Produtos | usuarios | produtos | 1:N | Sim |
| Indústria fornece Produtos | usuarios | produtos | 1:N | Não |
| Categoria agrupa Produtos | categorias | produtos | 1:N | Não |
| Produto compõe Itens | produtos | itens_venda | 1:N | Sim |
| Venda contém Itens | vendas | itens_venda | 1:N | Sim |
| Vendedor realiza Vendas | usuarios | vendas | 1:N | Sim |
| Cliente compra em Vendas | clientes | vendas | 1:N | Não |
| Vendedor cadastra Clientes | usuarios | clientes | 1:N | Sim |

## Constraints Importantes

### Unique Constraints
```sql
-- Um vendedor não pode cadastrar o mesmo GTIN duas vezes
UNIQUE (vendedor_id, gtin) em PRODUTOS

-- Nome de categoria é único
UNIQUE (nome) em CATEGORIAS
```

### Check Constraints
```sql
-- Valores não-negativos
CHECK (preco_base >= 0) em PRODUTOS
CHECK (estoque >= 0) em PRODUTOS
CHECK (valor_total >= 0) em VENDAS
CHECK (quantidade > 0) em ITENS_VENDA
CHECK (preco_unitario >= 0) em ITENS_VENDA

-- Status válidos
CHECK (ativo IN ('Y', 'N'))
CHECK (status IN ('CONCLUIDA', 'CANCELADA', 'PENDENTE')) em VENDAS
```

### Foreign Key Actions
```sql
-- Ao deletar vendedor
ON DELETE CASCADE  → Deleta produtos, vendas, clientes
ON DELETE RESTRICT → Não permite se houver registros

-- Ao deletar indústria
ON DELETE SET NULL → Mantém produto, limpa industria_id

-- Ao deletar categoria
ON DELETE SET NULL → Mantém produto, limpa categoria_id

-- Ao deletar cliente
ON DELETE SET NULL → Mantém venda, limpa cliente_id

-- Ao deletar produto
ON DELETE RESTRICT → Não permite se houver itens de venda

-- Ao deletar venda
ON DELETE CASCADE → Deleta todos os itens_venda
```

## Exemplo de Fluxo Completo

### 1. Cadastro de Produto
```
USUARIO (vendedor) ─→ Scan GTIN
                  ↓
            API GTIN Externa
                  ↓
       Preenche dados do produto
                  ↓
      Seleciona INDUSTRIA (opcional)
                  ↓
      Seleciona CATEGORIA (opcional)
                  ↓
            INSERT em PRODUTOS
```

### 2. Realização de Venda
```
USUARIO (vendedor) ─→ Scan produto
                  ↓
      Busca em PRODUTOS por GTIN
                  ↓
         Adiciona ao carrinho
                  ↓
    (Repete para vários produtos)
                  ↓
          Finaliza venda
                  ↓
       INSERT em VENDAS
                  ↓
    INSERT em ITENS_VENDA (múltiplos)
                  ↓
  (Opcional) Decrementa ESTOQUE
```

### 3. Consulta de Dashboard
```
USUARIO (vendedor) ─→ Acessa dashboard
                  ↓
       SELECT vendedor_id
                  ↓
    ┌─────────────┴────────────┐
    │                          │
JOIN PRODUTOS              JOIN VENDAS
    │                          │
    │                    JOIN ITENS_VENDA
    │                          │
    └──────────┬───────────────┘
               ▼
      Agrega e exibe métricas
```

## Índices para Performance

```
produtos:
  - idx_produtos_vendedor (vendedor_id)
  - idx_produtos_gtin (gtin)
  - idx_produtos_vendedor_created (vendedor_id, created_at DESC)

vendas:
  - idx_vendas_vendedor (vendedor_id)
  - idx_vendas_data (data_venda DESC)
  - idx_vendas_vendedor_data (vendedor_id, data_venda DESC)

itens_venda:
  - idx_itens_venda (venda_id)
  - idx_itens_produto (produto_id)
```

## Isolamento por Vendedor

Todas as queries devem filtrar por `vendedor_id` para garantir isolamento:

```sql
-- ✅ Correto - filtra por vendedor
SELECT * FROM produtos WHERE vendedor_id = :current_user_id;

-- ❌ Errado - não filtra, pode ver produtos de outros
SELECT * FROM produtos;
```

## Regras de Negócio no Schema

1. **Isolamento:** Cada vendedor vê apenas seus próprios dados
2. **Integridade:** Não é possível deletar produto com vendas (RESTRICT)
3. **Rastreabilidade:** Preço capturado no momento da venda (histórico)
4. **Flexibilidade:** GTIN único por vendedor (multi-tenant)
5. **Parceria:** Produto pode referenciar indústria parceira
6. **Organização:** Produtos organizados por categoria
7. **Opcionalidade:** Cliente é opcional nas vendas

---

**Última atualização:** Outubro 2025  
**Projeto:** TradeBox - FIAP

