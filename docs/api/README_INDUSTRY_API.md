# TradeBox - Industry APIs

## Visão Geral

Este documento descreve todas as APIs REST disponíveis para o módulo da indústria no TradeBox. Todas as APIs requerem autenticação e são filtradas automaticamente pelo `industria_id` do usuário logado.

## Autenticação

Todas as APIs exigem que o usuário esteja autenticado com categoria **INDUSTRIA**.

**Cookie:** `tradebox_auth`

Se não autenticado ou se não for indústria, as APIs retornarão:
```json
{
  "success": false,
  "error": "Acesso negado",
  "message": "Apenas indústrias podem acessar este recurso"
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

---

## Endpoints

### 📦 Products API

#### 1. **GET** `/api/industry/products`
Lista todos os produtos associados à indústria.

**Query Parameters:**
- `search` (string, opcional): Busca por nome ou GTIN
- `categoria_id` (number, opcional): Filtrar por categoria
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
      "vendedor_nome": "João Silva",
      "qtd_vendas": 45
    }
  ],
  "total": 120,
  "page": 1,
  "limit": 20
}
```

**O que mostra:**
- Todos os produtos cadastrados pelos vendedores que foram associados a esta indústria
- Quantidade de vendas de cada produto
- Informações do vendedor que cadastrou

**Exemplo:**
```bash
curl -X GET "http://localhost:3000/api/industry/products?search=arroz&page=1" \
  -H "Cookie: tradebox_auth=..."
```

---

### 👥 Sellers API

#### 2. **GET** `/api/industry/sellers`
Lista todos os vendedores que vendem produtos da indústria.

**Response:**
```json
{
  "success": true,
  "sellers": [
    {
      "id": 10,
      "nome": "João Silva",
      "email": "joao@vendedor.com",
      "telefone": "11999999999",
      "qtd_produtos": 15,
      "qtd_vendas": 120,
      "receita_gerada": 45000.50,
      "ultima_venda": "2024-10-18T14:30:00.000Z"
    }
  ],
  "total": 25
}
```

**O que mostra:**
- Vendedores que possuem produtos desta indústria
- Quantidade de produtos cadastrados
- Total de vendas realizadas
- Receita total gerada
- Data da última venda

---

### 🛒 Sales API

#### 3. **GET** `/api/industry/sales`
Lista todas as vendas de produtos da indústria.

**Query Parameters:**
- `vendedor_id` (number, opcional): Filtrar por vendedor específico
- `data_inicio` (string, opcional): Data início (YYYY-MM-DD)
- `data_fim` (string, opcional): Data fim (YYYY-MM-DD)
- `limit` (number, opcional): Máx registros (padrão: 50)

**Response:**
```json
{
  "success": true,
  "sales": [
    {
      "id": 1,
      "vendedor_id": 10,
      "data_venda": "2024-10-18T14:30:00.000Z",
      "valor_total": 29.10,
      "quantidade_itens": 3,
      "status": "CONCLUIDA",
      "vendedor_nome": "João Silva"
    }
  ],
  "total": 150
}
```

**O que mostra:**
- Todas as vendas que contêm produtos desta indústria
- Informações do vendedor que fez a venda
- Detalhes da venda (valor, quantidade, data)

**Nota:** Uma venda pode conter produtos de múltiplas indústrias. A query filtra vendas que contêm pelo menos um produto desta indústria.

---

### 📊 Dashboard APIs

#### 4. **GET** `/api/industry/dashboard/metrics`
Retorna métricas principais do dashboard.

**Query Parameters:**
- `periodo` (string, opcional): 7d, 30d, 90d, 1y (padrão: 30d)

**Response:**
```json
{
  "success": true,
  "metrics": {
    "total_produtos": 120,
    "total_vendedores": 25,
    "total_vendas": 450,
    "receita_gerada": 125000.50,
    "produto_mais_vendido": "Arroz Integral 1kg",
    "qtd_vendida_top": 320
  }
}
```

**Métricas:**
- `total_produtos`: Total de produtos ativos cadastrados com esta indústria
- `total_vendedores`: Quantidade de vendedores que trabalham com produtos desta indústria
- `total_vendas`: Vendas concluídas no período que incluem produtos desta indústria
- `receita_gerada`: Receita total gerada pelos produtos desta indústria no período
- `produto_mais_vendido`: Nome do produto mais vendido no período
- `qtd_vendida_top`: Quantidade vendida do produto mais popular

---

#### 5. **GET** `/api/industry/dashboard/sellers-performance`
Retorna performance dos vendedores.

**Query Parameters:**
- `periodo` (string, opcional): 7d, 30d, 90d, 1y (padrão: 30d)
- `limit` (number, opcional): Quantidade de vendedores (padrão: 10)

**Response:**
```json
{
  "success": true,
  "sellers": [
    {
      "vendedor_id": 10,
      "vendedor": "João Silva",
      "qtd_produtos": 15,
      "qtd_vendas": 120,
      "produtos_vendidos": 450,
      "receita": 45000.50
    }
  ]
}
```

**O que mostra:**
- Top N vendedores ordenados por receita gerada
- Quantidade de produtos da indústria que cada vendedor possui
- Total de vendas realizadas
- Unidades vendidas
- Receita gerada no período

**Uso:** Identificar melhores parceiros, vendedores que precisam de suporte, etc.

---

#### 6. **GET** `/api/industry/dashboard/products-performance`
Retorna performance dos produtos.

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
      "gtin": "7891234567890",
      "nome": "Arroz Integral 1kg",
      "qtd_vendedores": 8,
      "qtd_vendas": 120,
      "qtd_vendida": 450,
      "receita": 40000.00
    }
  ]
}
```

**O que mostra:**
- Top N produtos ordenados por receita
- Quantidade de vendedores que comercializam cada produto
- Total de vendas
- Unidades vendidas
- Receita gerada

**Uso:** Identificar produtos best-sellers, produtos com baixo desempenho, distribuição de produtos por vendedores.

---

#### 7. **GET** `/api/industry/dashboard/analytics`
Retorna dados completos de analytics.

**Query Parameters:**
- `periodo` (string, opcional): 7d, 30d, 90d, 1y (padrão: 30d)

**Response:**
```json
{
  "success": true,
  "monthlyPerformance": [
    {
      "mes": "2024-01",
      "qtd_vendas": 145,
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
  "distribution": {
    "qtd_vendedores": 25,
    "qtd_vendas": 450,
    "receita": 125000.00
  },
  "topSellers": [
    {
      "vendedor": "João Silva",
      "receita": 45000.00
    }
  ]
}
```

**Dados Inclusos:**
- `monthlyPerformance`: Últimos 12 meses de vendas e receita
- `salesByCategory`: Vendas agrupadas por categoria de produto
- `distribution`: Distribuição geral (vendedores, vendas, receita total)
- `topSellers`: Top 5 vendedores dos últimos 30 dias

---

#### 8. **PATCH** `/api/industry/products/[id]/price`
Atualiza o preço de custo de um produto específico.

**Permissão:** Apenas a indústria associada ao produto pode atualizar.

**Body:**
```json
{
  "preco_custo": 7.50
}
```

**Validações:**
- `preco_custo` é obrigatório
- Deve ser um número >= 0
- Não pode ser maior que o `preco_base` do produto

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "Preço de custo atualizado com sucesso",
  "product": {
    "id": 1,
    "nome": "Arroz Integral 1kg",
    "gtin": "7891234567890",
    "preco_base": 8.90,
    "preco_custo": 7.50,
    "lucro_unitario": 1.40,
    "margem_percentual": 18.67,
    "vendedor_nome": "João Silva"
  }
}
```

**Erros:**
- `400`: Validação falhou (preço negativo ou maior que base)
- `403`: Acesso negado (produto não pertence à indústria)
- `404`: Produto não encontrado

**Uso:** Gestão de preços de custo, ajuste de margens, recomendações de preço.

---

#### 9. **GET** `/api/industry/dashboard/pricing-insights`
Retorna insights de preços e sugestões de ajustes para melhorar margens.

**Query Parameters:**
- `margem_maxima` (number, opcional): Margem máxima % para alertar (padrão: 15)
- `margem_alvo` (number, opcional): Margem alvo % desejada (padrão: 25)
- `limit` (number, opcional): Quantidade de sugestões (padrão: 20)

**Response:**
```json
{
  "success": true,
  "insights": {
    "total_produtos_baixa_margem": 8,
    "margem_media_atual": 19.45,
    "margem_alvo": 25,
    "sugestoes": [
      {
        "produto_id": 1,
        "nome": "Arroz Integral 1kg",
        "gtin": "7891234567890",
        "vendedor": "João Silva",
        "preco_custo_atual": 8.00,
        "preco_base": 8.90,
        "margem_atual": 11.25,
        "preco_custo_sugerido": 7.12,
        "margem_alvo": 25.0,
        "reducao_necessaria": 0.88
      }
    ]
  }
}
```

**Dados Inclusos:**
- **total_produtos_baixa_margem**: Quantidade de produtos com margem abaixo do esperado
- **margem_media_atual**: Margem média de todos os produtos da indústria
- **margem_alvo**: Meta de margem configurada
- **sugestoes**: Lista de produtos com sugestões de ajuste de preço de custo

**Uso:** 
- Identificar produtos com margem baixa
- Receber sugestões automáticas de ajuste de preço de custo
- Tomar decisões de precificação baseadas em dados
- Negociar com vendedores sobre preços de venda

**Exemplo de Caso de Uso:**
1. Indústria consulta pricing insights
2. Identifica produtos com margem < 15%
3. Vê sugestão de reduzir custo de R$ 8,00 para R$ 7,12
4. Usa endpoint `/api/industry/products/[id]/price` para ajustar
5. Margem sobe de 11.25% para 25%

---

## Casos de Uso

### 1. Dashboard Principal da Indústria

**Objetivo:** Mostrar visão geral do desempenho

**Requisições:**
```javascript
// Buscar métricas principais
GET /api/industry/dashboard/metrics?periodo=30d

// Buscar top vendedores
GET /api/industry/dashboard/sellers-performance?periodo=30d&limit=5

// Buscar top produtos
GET /api/industry/dashboard/products-performance?periodo=30d&limit=5
```

**Exibir:**
- Cards de métricas (produtos, vendedores, vendas, receita)
- Gráfico de performance mensal
- Ranking de vendedores
- Ranking de produtos
- Produto em destaque

---

### 2. Análise de Vendedores Parceiros

**Objetivo:** Identificar melhores parceiros e oportunidades

**Requisições:**
```javascript
// Listar todos os vendedores
GET /api/industry/sellers

// Ver vendas de um vendedor específico
GET /api/industry/sales?vendedor_id=10&data_inicio=2024-01-01

// Ver produtos cadastrados por vendedor
GET /api/industry/products (filtrar no frontend por vendedor_id)
```

**Análises:**
- Vendedores com melhor performance
- Vendedores inativos recentemente
- Produtos mais vendidos por vendedor
- Oportunidades de parceria

---

### 3. Análise de Produtos

**Objetivo:** Entender performance de cada produto

**Requisições:**
```javascript
// Performance dos produtos
GET /api/industry/dashboard/products-performance?periodo=90d&limit=20

// Lista completa de produtos
GET /api/industry/products
```

**Análises:**
- Produtos best-sellers
- Produtos com baixa rotatividade
- Distribuição geográfica por vendedor
- Oportunidades de expansão

---

### 4. Analytics Completo

**Objetivo:** Relatórios e insights detalhados

**Requisições:**
```javascript
// Dados completos
GET /api/industry/dashboard/analytics?periodo=90d
```

**Gerar:**
- Relatórios de performance
- Tendências de venda
- Análise por categoria
- Previsões e recomendações

---

## Comparação: Indústria vs Vendedor

| Aspecto | Vendedor | Indústria |
|---------|----------|-----------|
| **Produtos** | Vê apenas seus produtos | Vê todos que a referenciam |
| **Vendas** | Vê apenas suas vendas | Vê vendas de todos os vendedores |
| **Métricas** | Performance própria | Performance de toda a rede |
| **Visibilidade** | Seus clientes | Seus parceiros (vendedores) |
| **Objetivo** | Vender mais | Expandir distribuição |

---

## Filtros e Segmentação

### Por Vendedor
Todas as APIs suportam análise por vendedor específico:
```javascript
// Ver apenas produtos de um vendedor
GET /api/industry/products?vendedor_id=10

// Ver apenas vendas de um vendedor
GET /api/industry/sales?vendedor_id=10
```

### Por Período
Análises temporais para identificar tendências:
```javascript
// Últimos 7 dias
GET /api/industry/dashboard/metrics?periodo=7d

// Último ano
GET /api/industry/dashboard/analytics?periodo=1y
```

### Por Categoria
Entender performance por linha de produto:
```javascript
GET /api/industry/products?categoria_id=1
GET /api/industry/dashboard/analytics // já inclui breakdown por categoria
```

---

## Métricas Importantes para Indústria

### KPIs Principais
1. **Penetração de Mercado**
   - Total de vendedores ativos
   - Crescimento mês a mês
   - Distribuição geográfica

2. **Performance de Produtos**
   - Produtos mais vendidos
   - Taxa de rotatividade
   - Ticket médio

3. **Performance de Parceiros**
   - Top vendedores
   - Vendedores em crescimento
   - Vendedores inativos

4. **Receita e Vendas**
   - Receita total gerada
   - Crescimento período a período
   - Sazonalidade

---

## Segurança e Privacidade

### O que a Indústria PODE Ver:
✅ Produtos que foram associados a ela
✅ Vendedores que cadastraram seus produtos
✅ Vendas agregadas (quantidade, valor, data)
✅ Performance geral dos vendedores

### O que a Indústria NÃO PODE Ver:
❌ Dados pessoais dos clientes finais
❌ Preços praticados pelos vendedores (vê apenas preco_base)
❌ Margem de lucro dos vendedores
❌ Produtos de outras indústrias
❌ Estoque detalhado por vendedor

---

## Próximos Passos

### Funcionalidades Futuras
- [ ] Sugestões de preço baseadas em análise de mercado
- [ ] Alertas de vendedores inativos
- [ ] Campanhas direcionadas para vendedores
- [ ] Previsão de demanda por produto
- [ ] Análise de competitividade
- [ ] Relatórios em PDF
- [ ] Export de dados para BI
- [ ] Integração com ERP da indústria

### Melhorias de UX
- [ ] Dashboard customizável
- [ ] Comparação entre períodos
- [ ] Filtros salvos
- [ ] Notificações em tempo real
- [ ] Metas e objetivos

---

## Exemplos de Integração

### React Component Example
```typescript
'use client';

import { useEffect, useState } from 'react';

interface IndustryMetrics {
  total_produtos: number;
  total_vendedores: number;
  total_vendas: number;
  receita_gerada: number;
}

export default function IndustryDashboard() {
  const [metrics, setMetrics] = useState<IndustryMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/industry/dashboard/metrics?periodo=30d');
        const data = await response.json();
        
        if (data.success) {
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMetrics();
  }, []);
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      <h1>Dashboard da Indústria</h1>
      <div>
        <p>Produtos: {metrics?.total_produtos}</p>
        <p>Vendedores: {metrics?.total_vendedores}</p>
        <p>Vendas: {metrics?.total_vendas}</p>
        <p>Receita: R$ {metrics?.receita_gerada.toFixed(2)}</p>
      </div>
    </div>
  );
}
```

---

**Projeto:** TradeBox - Sistema de Trade Marketing  
**Versão da API:** 1.0  
**Módulo:** Indústria  
**Data:** Outubro 2025  
**Documentação Completa:** `/docs`

