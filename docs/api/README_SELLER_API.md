# TradeBox - Seller APIs

## Visão Geral

Este documento descreve todas as APIs REST disponíveis para o módulo do vendedor (VAREJISTA) no TradeBox. Todas as APIs requerem autenticação e são filtradas automaticamente pelo `vendedor_id` do usuário logado.

## Autenticação

Todas as APIs exigem que o usuário esteja autenticado. O sistema utiliza JWT armazenado em cookie HTTP-only.

**Cookie:** `tradebox_auth`

Se não autenticado, as APIs retornarão:
```json
{
  "success": false,
  "error": "Não autenticado",
  "message": "Faça login para continuar"
}
```

## Padrão de Response

### Sucesso
```json
{
  "success": true,
  "data": { ... },
  "message": "Mensagem opcional"
}
```

### Erro
```json
{
  "success": false,
  "error": "Tipo do erro",
  "message": "Descrição detalhada do erro"
}
```

### Status Codes
- `200` - OK (requisição bem-sucedida)
- `201` - Created (recurso criado com sucesso)
- `400` - Bad Request (erro de validação)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found (recurso não encontrado)
- `500` - Internal Server Error (erro no servidor)

---

## Endpoints

### 📦 Products API

#### 1. **GET** `/api/products`
Lista produtos do vendedor com filtros opcionais.

**Query Parameters:**
- `search` (string, opcional): Busca por nome ou GTIN
- `categoria_id` (number, opcional): Filtrar por categoria
- `ativo` (string, opcional): Y ou N (padrão: Y)
- `page` (number, opcional): Página (padrão: 1)
- `limit` (number, opcional): Itens por página (padrão: 20, máx: 100)

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "vendedor_id": 10,
      "industria_id": 5,
      "categoria_id": 2,
      "gtin": "7891234567890",
      "nome": "Arroz Integral 1kg",
      "descricao": "Arroz integral tipo 1",
      "preco_base": 8.90,
      "estoque": 100,
      "ativo": "Y",
      "created_at": "2024-10-18T10:00:00.000Z",
      "updated_at": "2024-10-18T10:00:00.000Z",
      "categoria_nome": "Alimentos",
      "industria_nome": "Indústria ABC"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20
}
```

**Exemplo:**
```bash
curl -X GET "http://localhost:3000/api/products?search=arroz&categoria_id=1&page=1" \
  -H "Cookie: tradebox_auth=..."
```

---

#### 2. **POST** `/api/products`
Cria um novo produto.

**Body:**
```json
{
  "gtin": "7891234567890",
  "nome": "Arroz Integral 1kg",
  "descricao": "Arroz integral tipo 1",
  "preco_base": 8.90,
  "estoque": 100,
  "categoria_id": 1,
  "industria_id": 5
}
```

**Campos Obrigatórios:**
- `gtin`: String (8, 12, 13 ou 14 dígitos)
- `nome`: String (máx 255 caracteres)
- `preco_base`: Number (>= 0)

**Campos Opcionais:**
- `descricao`: String (máx 1000 caracteres)
- `estoque`: Number (>= 0, padrão: 0)
- `categoria_id`: Number
- `industria_id`: Number (deve ser usuário INDUSTRIA ativo)

**Response:**
```json
{
  "success": true,
  "product": { ... },
  "message": "Produto cadastrado com sucesso"
}
```

**Erros Comuns:**
- `GTIN duplicado`: Vendedor já possui produto com este GTIN
- `Indústria inválida`: ID fornecido não é de uma indústria ativa

---

#### 3. **GET** `/api/products/[id]`
Busca produto por ID.

**Response:**
```json
{
  "success": true,
  "product": { ... }
}
```

---

#### 4. **PATCH** `/api/products/[id]`
Atualiza produto existente.

**Body (todos os campos opcionais):**
```json
{
  "nome": "Arroz Integral Premium 1kg",
  "descricao": "Nova descrição",
  "preco_base": 9.90,
  "estoque": 150,
  "categoria_id": 2,
  "industria_id": 6,
  "ativo": "Y"
}
```

**Response:**
```json
{
  "success": true,
  "product": { ... },
  "message": "Produto atualizado com sucesso"
}
```

---

#### 5. **DELETE** `/api/products/[id]`
Deleta produto (soft delete - marca como inativo).

**Response:**
```json
{
  "success": true,
  "message": "Produto removido com sucesso"
}
```

**Nota:** Se o produto tiver vendas associadas, não poderá ser deletado fisicamente (por restrição do banco).

---

#### 6. **GET** `/api/products/gtin/[gtin]`
Busca produto por GTIN (código de barras).

**Uso:** Scanner de código de barras durante venda ou edição.

**Response (produto encontrado):**
```json
{
  "success": true,
  "found": true,
  "product": { ... }
}
```

**Response (produto não encontrado):**
```json
{
  "success": true,
  "found": false,
  "product": null,
  "message": "Produto não encontrado no seu catálogo"
}
```

---

### 🛒 Sales API

#### 7. **GET** `/api/sales`
Lista vendas do vendedor.

**Query Parameters:**
- `status` (string, opcional): CONCLUIDA, CANCELADA, PENDENTE
- `data_inicio` (string, opcional): YYYY-MM-DD
- `data_fim` (string, opcional): YYYY-MM-DD
- `limit` (number, opcional): Máx registros (padrão: 50)

**Response:**
```json
{
  "success": true,
  "sales": [
    {
      "id": 1,
      "vendedor_id": 10,
      "cliente_id": null,
      "data_venda": "2024-10-18T14:30:00.000Z",
      "valor_total": 29.10,
      "quantidade_itens": 3,
      "status": "CONCLUIDA",
      "observacoes": null,
      "created_at": "2024-10-18T14:30:00.000Z",
      "cliente_nome": null
    }
  ],
  "total": 1
}
```

---

#### 8. **POST** `/api/sales`
Cria nova venda com itens.

**Body:**
```json
{
  "cliente_id": 5,
  "itens": [
    {
      "produto_id": 1,
      "quantidade": 2,
      "preco_unitario": 8.90
    },
    {
      "produto_id": 2,
      "quantidade": 1,
      "preco_unitario": 7.50
    }
  ],
  "observacoes": "Cliente pediu entrega"
}
```

**Campos Obrigatórios:**
- `itens`: Array com pelo menos 1 item
  - `produto_id`: Number
  - `quantidade`: Number (> 0)
  - `preco_unitario`: Number (>= 0)

**Campos Opcionais:**
- `cliente_id`: Number
- `observacoes`: String (máx 1000 caracteres)

**Response:**
```json
{
  "success": true,
  "venda_id": 1,
  "valor_total": 25.30,
  "quantidade_itens": 3,
  "message": "Venda realizada com sucesso"
}
```

**Processamento:**
1. Valida que todos os produtos pertencem ao vendedor
2. Calcula `valor_total` e `quantidade_itens`
3. Cria registro em `vendas`
4. Cria múltiplos registros em `itens_venda`
5. Tudo em transação (rollback em caso de erro)

---

#### 9. **GET** `/api/sales/[id]`
Busca detalhes de uma venda com todos os itens.

**Response:**
```json
{
  "success": true,
  "sale": {
    "id": 1,
    "vendedor_id": 10,
    "data_venda": "2024-10-18T14:30:00.000Z",
    "valor_total": 29.10,
    "quantidade_itens": 3,
    "status": "CONCLUIDA",
    ...
  },
  "items": [
    {
      "id": 1,
      "venda_id": 1,
      "produto_id": 1,
      "quantidade": 2,
      "preco_unitario": 8.90,
      "subtotal": 17.80,
      "produto_nome": "Arroz Integral 1kg",
      "produto_gtin": "7891234567890"
    }
  ]
}
```

---

### 🏷️ Categories API

#### 10. **GET** `/api/categories`
Lista todas as categorias ativas.

**Query Parameters:**
- `ativo` (string, opcional): Y ou N (padrão: Y)

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "nome": "Alimentos",
      "descricao": "Produtos alimentícios em geral",
      "ativo": "Y",
      "created_at": "2024-10-18T10:00:00.000Z",
      "updated_at": "2024-10-18T10:00:00.000Z"
    }
  ]
}
```

**Uso:** Dropdown no cadastro de produtos.

---

### 🏭 Industries API

#### 11. **GET** `/api/industries`
Lista todos os usuários do tipo INDUSTRIA.

**Query Parameters:**
- `ativo` (string, opcional): Y ou N (padrão: Y)

**Response:**
```json
{
  "success": true,
  "industries": [
    {
      "id": 5,
      "email": "contato@industria.com",
      "nome": "Indústria ABC LTDA",
      "categoria": "INDUSTRIA",
      "tipo_pessoa": "PJ",
      "documento": "12345678000195",
      "telefone": "1133334444",
      "endereco": "Rod. Industrial, km 45",
      "ativo": "Y",
      "created_at": "2024-10-18T10:00:00.000Z"
    }
  ]
}
```

**Uso:** Dropdown no cadastro de produtos.

---

### 📊 Dashboard APIs

#### 12. **GET** `/api/dashboard/metrics`
Retorna métricas principais do dashboard.

**Query Parameters:**
- `periodo` (string, opcional): 7d, 30d, 90d, 1y (padrão: 30d)

**Response:**
```json
{
  "success": true,
  "metrics": {
    "total_vendas": 24,
    "faturamento": 25000.00,
    "vendas_7d": 5234.56,
    "total_produtos": 12,
    "produtos_estoque_baixo": 3
  }
}
```

**Métricas:**
- `total_vendas`: Quantidade de vendas concluídas no período
- `faturamento`: Soma do valor_total das vendas no período
- `vendas_7d`: Vendas dos últimos 7 dias
- `total_produtos`: Total de produtos ativos cadastrados
- `produtos_estoque_baixo`: Produtos com estoque < 10

---

#### 13. **GET** `/api/dashboard/trending`
Retorna produtos mais vendidos.

**Query Parameters:**
- `periodo` (string, opcional): 7d, 30d, 90d, 1y (padrão: 30d)
- `limit` (number, opcional): Quantidade de produtos (padrão: 10)

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "produto_id": 1,
      "nome": "Feijão Carioca 1kg",
      "vendas": 95
    },
    {
      "produto_id": 2,
      "nome": "Arroz Integral 1kg",
      "vendas": 81
    }
  ]
}
```

**Uso:** Dashboard principal - "Produtos em alta".

---

#### 14. **GET** `/api/dashboard/analytics`
Retorna dados completos para dashboard de analytics.

**Query Parameters:**
- `periodo` (string, opcional): 7d, 30d, 90d, 1y (padrão: 30d)

**Response:**
```json
{
  "success": true,
  "monthlyPerformance": [
    {
      "mes": "2024-01",
      "qtd_pedidos": 145,
      "receita": 28000.00
    }
  ],
  "salesByCategory": [
    {
      "categoria": "Alimentos",
      "qtd_vendas": 150,
      "valor_vendas": 12500.00
    }
  ],
  "topProducts": [
    {
      "produto_id": 1,
      "nome": "Produto X",
      "qtd_vendida": 45,
      "receita": 67500.00
    }
  ],
  "industryPartners": [
    {
      "industria_id": 5,
      "industria": "Indústria ABC",
      "qtd_produtos": 15,
      "qtd_vendas": 120,
      "receita_gerada": 45000.00
    }
  ]
}
```

**Dados Inclusos:**
- `monthlyPerformance`: Últimos 12 meses
- `salesByCategory`: Vendas agrupadas por categoria
- `topProducts`: Top 5 produtos por receita
- `industryPartners`: Top 5 parceiros de indústria

---

## Fluxos de Uso

### Fluxo: Cadastrar Produto via Scan

1. **Escanear código de barras** → obtém GTIN
2. **Consultar API externa** → `GET /api/gtin?codigo={gtin}`
3. **Verificar se existe no catálogo** → `GET /api/products/gtin/{gtin}`
4. Se não existe:
   - **Criar produto** → `POST /api/products` com dados da API + preço + estoque
5. Se existe:
   - Exibir informações do produto

### Fluxo: Realizar Venda via Scan

1. **Escanear produto** → obtém GTIN
2. **Buscar no catálogo** → `GET /api/products/gtin/{gtin}`
3. Se encontrado:
   - Adicionar ao carrinho com `preco_base`
4. Se não encontrado:
   - Oferecer cadastro rápido (mesmo fluxo anterior)
   - Após cadastro, adicionar ao carrinho
5. Repetir passos 1-4 para múltiplos produtos
6. **Finalizar venda** → `POST /api/sales` com array de itens

### Fluxo: Dashboard Principal

1. **Buscar métricas** → `GET /api/dashboard/metrics?periodo=30d`
2. **Buscar trending** → `GET /api/dashboard/trending?periodo=30d&limit=10`
3. Renderizar cards e gráficos

### Fluxo: Analytics Dashboard

1. **Buscar todos os dados** → `GET /api/dashboard/analytics?periodo=30d`
2. Renderizar:
   - Gráfico de performance mensal
   - Gráfico de vendas por categoria
   - Lista de top produtos
   - Lista de parceiros de indústria

---

## Tratamento de Erros

### Erros de Validação (400)
```json
{
  "success": false,
  "error": "Dados inválidos",
  "message": "GTIN deve conter 8, 12, 13 ou 14 dígitos numéricos"
}
```

### Erros de Autenticação (401)
```json
{
  "success": false,
  "error": "Não autenticado",
  "message": "Faça login para continuar"
}
```

### Erros de Autorização (403)
```json
{
  "success": false,
  "error": "Acesso negado",
  "message": "Apenas vendedores podem acessar este recurso"
}
```

### Erros de Recurso (404)
```json
{
  "success": false,
  "error": "Produto não encontrado",
  "message": "O produto não existe ou você não tem permissão para acessá-lo"
}
```

### Erros do Oracle
O sistema traduz erros do Oracle para mensagens amigáveis:

**ORA-00001 (Unique constraint):**
```json
{
  "success": false,
  "error": "Registro duplicado",
  "message": "Já existe um registro com estes dados"
}
```

**ORA-02292 (Child record found):**
```json
{
  "success": false,
  "error": "Operação não permitida",
  "message": "Não é possível deletar este registro pois existem registros relacionados"
}
```

---

## Próximos Passos

### Integrações Futuras
- [ ] Atualizar componentes frontend para usar APIs reais
- [ ] Adicionar cache para queries pesadas
- [ ] Implementar rate limiting
- [ ] Adicionar testes automatizados
- [ ] Implementar webhooks para notificações
- [ ] Adicionar suporte a upload de imagens de produtos

### Melhorias de Performance
- [ ] Implementar paginação cursor-based
- [ ] Adicionar materialized views para analytics
- [ ] Implementar cache Redis
- [ ] Otimizar queries com hints do Oracle

---

**Projeto:** TradeBox - Sistema de Trade Marketing  
**Versão da API:** 1.0  
**Data:** Outubro 2025  
**Documentação Completa:** `/docs`

