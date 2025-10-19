# Funcionalidade de Preço de Custo e Análise de Margem

## Visão Geral

Esta funcionalidade adiciona o conceito de **preço de custo** à tabela de produtos, permitindo análises detalhadas de margem de lucro e estratégias de trade marketing.

## Mudanças no Schema

### Campo Adicionado: `preco_custo`

```sql
ALTER TABLE produtos ADD (
    preco_custo NUMBER(10,2) DEFAULT 0 CHECK (preco_custo >= 0)
);
```

**Descrição**: Representa o preço que o vendedor (varejista) paga à indústria pelo produto.

**Regras de Negócio**:
- Valor padrão: 0 (não definido)
- Não pode ser negativo
- Não pode ser maior que `preco_base`
- Quando = 0, indica que o custo ainda não foi definido pela indústria

## Controle de Acesso

### Vendedor (VAREJISTA)
- **READ**: Pode visualizar `preco_custo` de seus produtos
- **CREATE**: Pode definir `preco_custo` ao cadastrar produto (opcional)
- **UPDATE**: **NÃO PODE** atualizar `preco_custo` após criação
- **CRUD Completo**: Mantém acesso total aos demais campos

### Indústria (INDUSTRIA)
- **READ**: Pode visualizar `preco_custo` dos produtos associados
- **UPDATE**: Pode atualizar **APENAS** `preco_custo`
- **Restrição**: Não pode modificar outros campos do produto

## APIs Implementadas

### 1. Atualizar Preço de Custo (Indústria)

**Endpoint**: `PATCH /api/industry/products/[id]/price`

**Autenticação**: Requer token JWT de usuário `INDUSTRIA`

**Autorização**: Apenas a indústria associada ao produto pode atualizar

**Request Body**:
```json
{
  "preco_custo": 25.50
}
```

**Validações**:
- `preco_custo` deve ser número ≥ 0
- `preco_custo` não pode ser maior que `preco_base`
- Produto deve estar ativo
- Indústria deve ser dona do produto

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Preço de custo atualizado com sucesso",
  "product": {
    "id": 123,
    "nome": "Produto Exemplo",
    "gtin": "7891234567890",
    "preco_base": 35.00,
    "preco_custo": 25.50,
    "lucro_unitario": 9.50,
    "margem_percentual": 37.25,
    "vendedor_nome": "Loja ABC"
  }
}
```

**Response Error (400)**:
```json
{
  "success": false,
  "error": "Validação falhou",
  "message": "Preço de custo (R$ 40.00) não pode ser maior que o preço base (R$ 35.00)"
}
```

### 2. Análise de Lucro (Vendedor)

**Endpoint**: `GET /api/dashboard/profit-analysis`

**Autenticação**: Requer token JWT de usuário `VAREJISTA`

**Query Parameters**:
- `periodo_dias` (padrão: 30): Período de análise em dias
- `limit_produtos` (padrão: 10): Quantidade de produtos lucrativos
- `limit_vendas` (padrão: 20): Quantidade de vendas recentes
- `margem_minima` (padrão: 20): Margem mínima para alertas

**Response Success (200)**:
```json
{
  "success": true,
  "periodo_dias": 30,
  "resumo": {
    "lucro_total": 5420.80,
    "receita_total": 18500.00,
    "margem_global": 29.30,
    "produtos_baixa_margem": 3
  },
  "produtos_lucrativos": [
    {
      "produto_id": 101,
      "nome": "Produto A",
      "gtin": "7891234567890",
      "qtd_vendas": 15,
      "qtd_vendida": 45,
      "receita_total": 3150.00,
      "custo_total": 2025.00,
      "lucro_total": 1125.00,
      "margem_media": 35.71
    }
  ],
  "analise_vendas": [
    {
      "venda_id": 501,
      "data_venda": "2025-10-15T10:30:00",
      "receita_total": 350.00,
      "custo_total": 245.00,
      "lucro_total": 105.00,
      "margem_percentual": 30.00
    }
  ],
  "margem_por_industria": [
    {
      "industria": "Coca-Cola",
      "qtd_produtos": 12,
      "margem_media": 32.5,
      "receita_gerada": 8500.00,
      "custo_total": 5738.64,
      "lucro_total": 2761.36
    }
  ],
  "alertas_margem_baixa": [
    {
      "produto_id": 205,
      "nome": "Produto X",
      "preco_custo": 18.50,
      "preco_base": 21.00,
      "lucro_unitario": 2.50,
      "margem_percentual": 13.51
    }
  ]
}
```

### 3. Insights de Preços (Indústria)

**Endpoint**: `GET /api/industry/dashboard/pricing-insights`

**Autenticação**: Requer token JWT de usuário `INDUSTRIA`

**Query Parameters**:
- `margem_maxima` (padrão: 15): Margem abaixo da qual alertar
- `margem_alvo` (padrão: 25): Margem desejada para sugestões
- `limit` (padrão: 20): Quantidade de sugestões

**Response Success (200)**:
```json
{
  "success": true,
  "insights": {
    "total_produtos_baixa_margem": 8,
    "margem_media_atual": 12.35,
    "margem_alvo": 25,
    "sugestoes": [
      {
        "produto_id": 305,
        "nome": "Produto Y",
        "gtin": "7891234567891",
        "vendedor": "Loja XYZ",
        "preco_custo_atual": 35.00,
        "preco_base": 38.50,
        "margem_atual": 10.00,
        "preco_custo_sugerido": 30.80,
        "margem_alvo": 25,
        "reducao_necessaria": 4.20
      }
    ]
  }
}
```

## Cálculos de Margem

### Lucro Unitário
```
lucro_unitario = preco_base - preco_custo
```

### Margem Percentual
```
margem_percentual = ((preco_base - preco_custo) / preco_custo) * 100
```

### Margem Global
```
margem_global = (lucro_total / receita_total) * 100
```

### Preço de Custo Sugerido (para margem alvo)
```
preco_custo_sugerido = preco_base / (1 + margem_alvo / 100)
```

**Exemplo**: 
- `preco_base` = R$ 40,00
- `margem_alvo` = 25%
- `preco_custo_sugerido` = 40 / (1 + 0.25) = R$ 32,00

## Estratégias de Trade Marketing

### 1. Promoção Win-Win
A indústria reduz temporariamente o `preco_custo`:
- Vendedor vê margem maior
- Vendedor pode fazer promoção mantendo margem
- Indústria vende maior volume
- Ambos ganham

**Exemplo**:
- Preço normal: Custo R$ 30, Venda R$ 40 (margem 33%)
- Promoção: Custo R$ 25, Venda R$ 38 (margem 52%)
- Resultado: Vendedor mantém lucro, consumidor paga menos

### 2. Análise de Rentabilidade por Parceiro
O vendedor pode identificar:
- Indústrias com melhores margens
- Produtos mais lucrativos
- Oportunidades de negociação

### 3. Alertas Inteligentes
Sistema detecta automaticamente:
- Produtos com margem < 10% (crítico)
- Produtos com margem < 20% (atenção)
- Produtos com custo > preço base (inconsistência)

### 4. Recomendações de Preço
Indústria recebe sugestões de ajuste baseadas em:
- Margem alvo desejada pelo vendedor
- Competitividade de mercado
- Volume de vendas

## Casos de Uso

### Caso 1: Vendedor Cadastra Produto
```
1. Vendedor escaneia código de barras
2. Sistema busca informações na API GTIN
3. Vendedor define preco_base (ex: R$ 45,00)
4. preco_custo inicia em 0 (não definido)
5. Produto criado com margem desconhecida
```

### Caso 2: Indústria Define Preço de Custo
```
1. Indústria acessa seus produtos
2. Seleciona produto do vendedor X
3. Define preco_custo = R$ 32,00
4. Sistema calcula: margem = 40.6%
5. Vendedor passa a visualizar margem real
```

### Caso 3: Trade Marketing - Promoção
```
1. Indústria quer impulsionar vendas
2. Reduz preco_custo de R$ 32 para R$ 28
3. Vendedor vê margem subir de 40% para 60%
4. Vendedor faz promoção: reduz preço para R$ 40
5. Mantém margem de 42%, vende mais volume
6. Indústria atinge meta de volume
```

### Caso 4: Análise de Lucratividade
```
1. Vendedor acessa dashboard de lucro
2. Vê que Produto A: margem 35%, lucro R$ 1.200
3. Vê que Produto B: margem 12%, lucro R$ 180
4. Decide focar em promover Produto A
5. Negocia melhoria de custo para Produto B
```

## Dashboards Atualizados

### Dashboard do Vendedor
**Novos Widgets**:
- Total de Lucro (período)
- Margem Global (%)
- Top 10 Produtos Lucrativos
- Alertas de Margem Baixa
- Lucro por Indústria Parceira

### Dashboard da Indústria
**Novos Widgets**:
- Produtos com Margem Crítica
- Sugestões de Ajuste de Preço
- Margem Média por Vendedor
- Oportunidades de Trade Marketing

## Queries de Exemplo

### Produtos Mais Lucrativos
```sql
SELECT 
  p.nome,
  SUM(iv.subtotal - (p.preco_custo * iv.quantidade)) as lucro_total,
  COUNT(DISTINCT v.id) as qtd_vendas
FROM produtos p
JOIN itens_venda iv ON p.id = iv.produto_id
JOIN vendas v ON iv.venda_id = v.id
WHERE v.vendedor_id = :vendedor_id
  AND v.status = 'CONCLUIDA'
GROUP BY p.id, p.nome
ORDER BY lucro_total DESC
FETCH FIRST 10 ROWS ONLY;
```

### Produtos com Margem Baixa
```sql
SELECT 
  nome,
  preco_custo,
  preco_base,
  ROUND(((preco_base - preco_custo) / preco_custo * 100), 2) as margem
FROM produtos
WHERE vendedor_id = :vendedor_id
  AND ativo = 'Y'
  AND preco_custo > 0
  AND ((preco_base - preco_custo) / preco_custo * 100) < 20
ORDER BY margem ASC;
```

## Benefícios

### Para o Vendedor
✅ Visibilidade completa de margem e lucro  
✅ Identificação de produtos mais rentáveis  
✅ Alertas de produtos com margem baixa  
✅ Dados para negociação com indústria  
✅ Análise de performance por parceiro  

### Para a Indústria
✅ Controle sobre preço de custo  
✅ Estratégias de trade marketing  
✅ Insights sobre margens praticadas  
✅ Recomendações de ajuste de preço  
✅ Aumento de volume via promoções  

### Para a Plataforma
✅ Dados ricos para analytics  
✅ Facilitação de parcerias  
✅ Valor agregado ao serviço  
✅ Diferencial competitivo  
✅ Base para IA e recomendações  

## Próximos Passos

### Fase 2 (Futuro)
- [ ] Histórico de alterações de `preco_custo`
- [ ] Comparação com preços de mercado
- [ ] Recomendações automáticas de preço
- [ ] Alertas push para oportunidades
- [ ] Dashboard de competitividade
- [ ] Integração com análise de mercado

### Fase 3 (Futuro)
- [ ] Machine Learning para precificação
- [ ] Previsão de margem ideal
- [ ] Simulador de promoções
- [ ] Análise de elasticidade de preço
- [ ] Benchmark entre vendedores

## Segurança e Auditoria

- Todas as alterações de `preco_custo` são registradas via `updated_at`
- Log de auditoria recomendado (trigger futuro)
- Controle de acesso via middleware JWT
- Validação rigorosa de permissões
- Proteção contra SQL injection

## Troubleshooting

### Erro: "Preço de custo não pode ser maior que preço base"
**Causa**: Indústria tentou definir custo maior que o preço de venda  
**Solução**: Reduzir `preco_custo` ou solicitar ao vendedor aumentar `preco_base`

### Erro: "Acesso negado"
**Causa**: Indústria tentou atualizar produto de outra indústria  
**Solução**: Verificar que `industria_id` do produto corresponde ao usuário logado

### Margem mostra 0%
**Causa**: `preco_custo` = 0 (não foi definido pela indústria)  
**Solução**: Indústria deve definir o preço de custo

## Suporte

Para dúvidas ou problemas:
1. Consultar `docs/api/README_SELLER_API.md`
2. Consultar `docs/api/README_INDUSTRY_API.md`
3. Verificar logs em `/api/industry/products/[id]/price`
4. Testar queries em `docs/database/ALTER_ADD_PRECO_CUSTO.sql`

---

**Versão**: 1.0  
**Data**: Outubro 2025  
**Autor**: TradeBox Team

