# Schema de Produtos e Vendas - TradeBox

## Visão Geral

Este documento descreve o schema de banco de dados completo para o módulo de produtos e vendas do TradeBox, focado nas funcionalidades do vendedor (varejista).

## Estrutura do Banco de Dados

### Diagrama de Relacionamentos

```
usuarios (VAREJISTA)
    |
    ├── produtos (1:N)
    |       |
    |       └── itens_venda (1:N)
    |               |
    |               └── vendas (N:1)
    |                       |
    |                       └── clientes (N:1 opcional)
    |
    └── vendas (1:N)

usuarios (INDUSTRIA)
    |
    └── produtos (1:N opcional)

categorias
    |
    └── produtos (1:N opcional)
```

## Tabelas

### 1. `categorias`
Categorias de produtos para organização e análises.

**Campos principais:**
- `id`: Identificador único
- `nome`: Nome da categoria (único)
- `descricao`: Descrição detalhada
- `ativo`: Status ativo/inativo

**Exemplos:** Alimentos, Bebidas, Higiene, Limpeza, Eletrônicos

### 2. `produtos`
Produtos cadastrados pelos vendedores (varejistas).

**Campos principais:**
- `id`: Identificador único
- `vendedor_id`: Vendedor que cadastrou (FK -> usuarios)
- `industria_id`: Indústria parceira (FK -> usuarios, opcional)
- `categoria_id`: Categoria do produto (FK -> categorias, opcional)
- `gtin`: Código de barras (EAN/UPC)
- `nome`: Nome do produto
- `preco_base`: Preço base de venda
- `estoque`: Quantidade em estoque
- `ativo`: Status ativo/inativo

**Constraints importantes:**
- GTIN é único por vendedor (um vendedor não pode cadastrar o mesmo GTIN duas vezes)
- Preço e estoque devem ser não-negativos
- Cada produto pertence a apenas um vendedor

### 3. `clientes`
Clientes dos vendedores (opcional, para expansões futuras).

**Campos principais:**
- `id`: Identificador único
- `vendedor_id`: Vendedor responsável (FK -> usuarios)
- `nome`: Nome do cliente
- `documento`: CPF ou CNPJ
- `telefone`, `email`: Contatos opcionais

### 4. `vendas`
Registro de vendas realizadas pelos vendedores.

**Campos principais:**
- `id`: Identificador único
- `vendedor_id`: Vendedor que realizou a venda (FK -> usuarios)
- `cliente_id`: Cliente da venda (FK -> clientes, opcional)
- `data_venda`: Data e hora da venda
- `valor_total`: Valor total da venda
- `quantidade_itens`: Total de itens vendidos
- `status`: Status da venda (CONCLUIDA, CANCELADA, PENDENTE)
- `observacoes`: Observações opcionais

### 5. `itens_venda`
Itens individuais de cada venda.

**Campos principais:**
- `id`: Identificador único
- `venda_id`: Venda associada (FK -> vendas)
- `produto_id`: Produto vendido (FK -> produtos)
- `quantidade`: Quantidade vendida
- `preco_unitario`: Preço no momento da venda
- `subtotal`: Calculado automaticamente (quantidade × preço_unitario)

**Importante:** O preço é capturado no momento da venda, permitindo que o preço base do produto mude sem afetar vendas históricas.

## Fluxos de Trabalho

### Cadastro de Produto

#### Via Scan de Código de Barras
1. Vendedor escaneia código de barras
2. Sistema consulta API externa (GTIN) para obter informações
3. Sistema verifica se GTIN já existe no catálogo do vendedor
4. Se não existe, vendedor preenche:
   - Preço base
   - Estoque inicial
   - Seleciona indústria parceira (dropdown)
   - Opcionalmente, seleciona categoria
5. Produto é salvo na tabela `produtos`

#### Via Cadastro Manual
1. Vendedor preenche formulário com:
   - GTIN (código de barras)
   - Nome
   - Descrição
   - Preço base
   - Estoque
   - Categoria
   - Indústria parceira
2. Produto é salvo na tabela `produtos`

### Realização de Venda

#### Via Scan (Preferencial)
1. Vendedor escaneia código de barras do produto
2. Sistema busca produto no catálogo do vendedor pelo GTIN
3. **Se produto existe:**
   - Adiciona ao carrinho com `preco_base` do produto
   - Permite ajustar quantidade
4. **Se produto NÃO existe:**
   - Oferece cadastro rápido (mesmo fluxo de cadastro via scan)
   - Após cadastro, adiciona ao carrinho
5. Vendedor finaliza venda
6. Sistema cria registro em `vendas` e múltiplos `itens_venda`

#### Via Manual
1. Vendedor digita GTIN manualmente
2. Segue mesmo fluxo do scan

### Controle de Estoque
1. Dashboard mostra produtos com estoque baixo
2. Vendedor pode editar estoque na tela de produtos
3. Opcionalmente: Sistema pode decrementar estoque automaticamente após venda (implementação futura)

## Queries para Dashboards

### Dashboard Principal (`/seller`)

```sql
-- Vendas nos últimos 7 dias
SELECT COALESCE(SUM(valor_total), 0) as total_vendas_7d
FROM vendas
WHERE vendedor_id = :vendedor_id
  AND data_venda >= CURRENT_TIMESTAMP - INTERVAL '7' DAY
  AND status = 'CONCLUIDA';

-- Top 10 produtos mais vendidos
SELECT p.nome, SUM(iv.quantidade) as vendas
FROM produtos p
JOIN itens_venda iv ON p.id = iv.produto_id
JOIN vendas v ON iv.venda_id = v.id
WHERE v.vendedor_id = :vendedor_id
  AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '30' DAY
  AND v.status = 'CONCLUIDA'
GROUP BY p.id, p.nome
ORDER BY vendas DESC
FETCH FIRST 10 ROWS ONLY;
```

### Analytics (`/seller/analytics`)

```sql
-- Performance mensal
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

-- Vendas por categoria
SELECT 
    c.nome as categoria,
    SUM(iv.subtotal) as valor_vendas
FROM categorias c
JOIN produtos p ON c.id = p.categoria_id
JOIN itens_venda iv ON p.id = iv.produto_id
JOIN vendas v ON iv.venda_id = v.id
WHERE v.vendedor_id = :vendedor_id
  AND v.status = 'CONCLUIDA'
GROUP BY c.id, c.nome
ORDER BY valor_vendas DESC;

-- Top parceiros de indústria
SELECT 
    u.nome as industria,
    COUNT(DISTINCT p.id) as qtd_produtos,
    COALESCE(SUM(iv.subtotal), 0) as receita_gerada
FROM usuarios u
JOIN produtos p ON u.id = p.industria_id
LEFT JOIN itens_venda iv ON p.id = iv.produto_id
LEFT JOIN vendas v ON iv.venda_id = v.id AND v.status = 'CONCLUIDA'
WHERE p.vendedor_id = :vendedor_id
  AND u.categoria = 'INDUSTRIA'
GROUP BY u.id, u.nome
ORDER BY receita_gerada DESC;
```

### Store (`/seller/store`)

```sql
-- Listar produtos do vendedor
SELECT 
    p.id,
    p.gtin,
    p.nome,
    p.preco_base,
    p.estoque,
    c.nome as categoria,
    u.nome as industria
FROM produtos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN usuarios u ON p.industria_id = u.id
WHERE p.vendedor_id = :vendedor_id
  AND p.ativo = 'Y'
ORDER BY p.created_at DESC;
```

### Histórico de Vendas (`/seller/sell`)

```sql
-- Vendas recentes
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

-- Detalhes de uma venda
SELECT 
    iv.id,
    p.nome as produto_nome,
    p.gtin,
    iv.quantidade,
    iv.preco_unitario,
    iv.subtotal
FROM itens_venda iv
JOIN produtos p ON iv.produto_id = p.id
WHERE iv.venda_id = :venda_id;
```

## Instalação

### 1. Executar Schema Base
Primeiro, certifique-se de que o schema de usuários está criado:
```bash
sqlplus usuario/senha@database @docs/database/schema_usuarios_simplificado.sql
```

### 2. Executar Schema de Produtos
```bash
sqlplus usuario/senha@database @docs/database/schema_produtos_vendas.sql
```

### 3. Verificar Instalação
```sql
-- Verificar tabelas criadas
SELECT table_name FROM user_tables 
WHERE table_name IN ('CATEGORIAS', 'PRODUTOS', 'CLIENTES', 'VENDAS', 'ITENS_VENDA');

-- Verificar sequences
SELECT sequence_name FROM user_sequences
WHERE sequence_name LIKE 'SEQ_%';

-- Verificar constraints
SELECT constraint_name, constraint_type, table_name
FROM user_constraints
WHERE table_name IN ('PRODUTOS', 'VENDAS', 'ITENS_VENDA');
```

## Dados de Teste

O arquivo SQL inclui exemplos comentados de inserção de dados. Para testar:

1. **Criar usuários de teste:**
```sql
-- Vendedor
INSERT INTO usuarios (email, password_hash, nome, categoria, tipo_pessoa, documento) 
VALUES ('vendedor@teste.com', '$2b$10$hash', 'João Vendedor', 'VAREJISTA', 'PF', '12345678901');

-- Indústria
INSERT INTO usuarios (email, password_hash, nome, categoria, tipo_pessoa, documento) 
VALUES ('industria@teste.com', '$2b$10$hash', 'Indústria Teste LTDA', 'INDUSTRIA', 'PJ', '12345678000195');
```

2. **As categorias já são inseridas automaticamente**

3. **Criar produtos de teste:** (descomente as linhas no arquivo SQL)

4. **Criar vendas de teste:** (descomente as linhas no arquivo SQL)

## Integrações

### API GTIN
O sistema consulta APIs externas para obter informações de produtos via GTIN:
- Endpoint atual: `/api/gtin?codigo={gtin}`
- Retorna: nome, marca, categoria, imagem

### Endpoints da API (Implementação Futura)

#### Produtos
- `GET /api/products` - Listar produtos do vendedor
- `POST /api/products` - Criar produto
- `GET /api/products/:id` - Detalhes do produto
- `PATCH /api/products/:id` - Atualizar produto
- `DELETE /api/products/:id` - Deletar produto
- `GET /api/products/gtin/:gtin` - Buscar por GTIN

#### Vendas
- `GET /api/sales` - Listar vendas
- `POST /api/sales` - Criar venda
- `GET /api/sales/:id` - Detalhes da venda
- `PATCH /api/sales/:id` - Atualizar venda

#### Categorias
- `GET /api/categories` - Listar categorias

#### Dashboard
- `GET /api/dashboard/metrics` - Métricas principais
- `GET /api/dashboard/trending` - Produtos em alta
- `GET /api/dashboard/analytics` - Dados para analytics

## TypeScript Types

Todos os tipos estão definidos em `lib/types.ts`:

```typescript
import { 
  Product, 
  Category, 
  Sale, 
  SaleItem, 
  Customer,
  CreateProductRequest,
  CreateSaleRequest,
  DashboardMetrics
} from '@/lib/types';
```

## Métricas Importantes

### Dashboard Principal
- **Vendas nos últimos 7 dias:** Soma de `valor_total` das vendas
- **Produtos em alta:** Top 10 produtos por quantidade vendida
- **Total de vendas:** Count de vendas concluídas
- **Faturamento:** Soma do `valor_total`
- **Produtos cadastrados:** Count de produtos ativos
- **Produtos em estoque baixo:** Count de produtos com `estoque < 10`

### Analytics
- **Receita total:** Soma de todas as vendas concluídas
- **Pedidos:** Total de vendas
- **Vendas por categoria:** Agregação por categoria
- **Performance mensal:** Vendas agrupadas por mês
- **Top produtos:** Produtos mais vendidos por receita
- **Parceiros indústria:** Indústrias que mais geraram receita

## Considerações de Performance

### Índices Criados
- Todos os foreign keys têm índices
- Índice composto em `(vendedor_id, created_at)` para queries de dashboard
- Índice em `gtin` para buscas rápidas por código de barras
- Índice em `data_venda` para queries temporais

### Otimizações Recomendadas
1. Use sempre `vendedor_id` nas queries (index-friendly)
2. Limite resultados com `FETCH FIRST N ROWS ONLY`
3. Use `COALESCE` para evitar NULLs em agregações
4. Considere materialized views para dashboards pesados (futuro)

## Expansões Futuras

### Curto Prazo
- [ ] Implementar APIs REST para todas as tabelas
- [ ] Adicionar controle automático de estoque na venda
- [ ] Implementar histórico de alterações de preço

### Médio Prazo
- [ ] Sistema de alertas de estoque baixo
- [ ] Relatórios em PDF
- [ ] Dashboard para usuários indústria
- [ ] Sistema de metas e campanhas

### Longo Prazo
- [ ] Previsão de demanda (ML)
- [ ] Integração com sistemas de pagamento
- [ ] App mobile nativo
- [ ] Multi-loja para vendedores

## Troubleshooting

### Erro: Sequence não encontrada
```sql
-- Verificar se sequences existem
SELECT sequence_name FROM user_sequences WHERE sequence_name LIKE 'SEQ_%';

-- Recriar se necessário
CREATE SEQUENCE seq_produtos START WITH 1 INCREMENT BY 1;
```

### Erro: Foreign key constraint violation
- Certifique-se que o `vendedor_id` existe na tabela `usuarios`
- Certifique-se que o `industria_id` é de um usuário com `categoria = 'INDUSTRIA'`

### Erro: Unique constraint violation
- GTIN já cadastrado por este vendedor
- Verifique com: `SELECT * FROM produtos WHERE vendedor_id = ? AND gtin = ?`

## Suporte

Para dúvidas ou problemas:
1. Verifique a documentação em `/docs`
2. Consulte o código de exemplo no SQL
3. Revise os tipos TypeScript em `lib/types.ts`

---

**Projeto:** TradeBox - Sistema de Trade Marketing  
**Contexto:** Projeto Universitário FIAP  
**Versão:** 1.0  
**Última atualização:** Outubro 2025

