# Cadastro de Produtos - Via Scan ou Manual

## Visão Geral

Implementação completa do fluxo de cadastro de produtos para vendedores, suportando:
- 🔍 Busca por código de barras (GTIN/EAN)
- 📷 Scan com leitor de código de barras
- 📱 **Scan com câmera do dispositivo (NOVO!)**
- ✍️ Cadastro manual de produtos
- 🏭 Associação com indústrias
- 📦 Controle de estoque e preços

## Arquivos Implementados

### 1. Componente de Formulário
**`/components/AddProductForm/AddProductForm.tsx`**
- Componente client-side com dois steps:
  - **Step 1 (GTIN)**: Busca por código de barras (manual ou câmera)
  - **Step 2 (Form)**: Formulário completo de cadastro
- Integração com APIs:
  - `/api/gtin` - Busca informações do produto por GTIN
  - `/api/products/gtin/[gtin]` - Verifica se produto já cadastrado
  - `/api/products` - Cria novo produto (POST)
  - `/api/categories` - Lista categorias disponíveis
  - `/api/industries` - Lista indústrias disponíveis

### 2. Componente de Scanner de Câmera (**NOVO**)
**`/components/CameraScanner/CameraScanner.tsx`**
- Escaneia códigos de barras usando a câmera do dispositivo
- Tecnologia: ZXing library
- Funcionalidades:
  - Solicita permissão de câmera
  - Usa câmera traseira por padrão (mobile)
  - Feedback visual com overlay
  - Feedback tátil (vibração) ao detectar
  - Tratamento robusto de erros
- Ver documentação completa: `components/CameraScanner/README.md`

### 3. Estilos do Formulário
**`/components/AddProductForm/AddProductForm.module.css`**
- Design responsivo
- Estados de loading e erro
- Validações visuais
- Mobile-first approach
- Botão de câmera destacado

### 4. Página Atualizada
**`/app/(dashboard)/seller/store/page.tsx`**
- Convertida para client component
- Modal de cadastro integrado
- Auto-refresh da lista após cadastro
- Tratamento de estados

## Fluxo de Uso

### Cenário 1: Cadastro via Câmera (**NOVO**)

```
1. Vendedor clica em "Adicionar Produto"
2. Modal abre com opções de scan
3. Vendedor clica em "Usar Câmera"
4. Navegador solicita permissão de câmera
5. Camera Scanner abre em fullscreen
6. Vendedor aponta câmera para código de barras
7. Sistema detecta código automaticamente
8. Vibração de feedback (se disponível)
9. Modal fecha e busca informações:
   a) Se produto já cadastrado → mostra erro
   b) Se não cadastrado → busca na API GTIN
   c) Se encontrado na API → preenche dados automaticamente
   d) Se não encontrado → permite cadastro manual
10. Vendedor completa campos obrigatórios
11. Sistema valida e cadastra produto
12. Modal fecha e lista atualiza
```

### Cenário 2: Cadastro via Scanner Manual

```
1. Vendedor clica em "Adicionar Produto"
2. Modal abre com campo de GTIN focado
3. Vendedor escaneia código de barras (ou digita)
4. Sistema busca:
   a) Se produto já cadastrado → mostra erro
   b) Se não cadastrado → busca na API GTIN
   c) Se encontrado na API → preenche dados automaticamente
   d) Se não encontrado → permite cadastro manual
5. Vendedor completa campos obrigatórios:
   - Preço de venda (obrigatório)
   - Preço de custo (opcional)
   - Estoque inicial
   - Categoria
   - Indústria
6. Sistema valida e cadastra produto
7. Modal fecha e lista atualiza
```

### Cenário 2: Cadastro Manual

```
1. Vendedor clica em "Adicionar Produto"
2. Modal abre
3. Vendedor clica em "Cadastrar Manualmente"
4. Formulário completo é exibido
5. Vendedor preenche todos os campos
6. Sistema valida e cadastra produto
7. Modal fecha e lista atualiza
```

## Campos do Formulário

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| GTIN | `string` | ✅ Sim | Código de barras único |
| Nome | `string` | ✅ Sim | Nome do produto |
| Descrição | `textarea` | ❌ Não | Descrição detalhada |
| Preço de Venda | `number` | ✅ Sim | Preço base (R$) |
| Preço de Custo | `number` | ❌ Não | Custo pago à indústria |
| Estoque Inicial | `number` | ❌ Não | Quantidade em estoque (padrão: 0) |
| Categoria | `select` | ❌ Não | Categoria do produto |
| Indústria | `select` | ❌ Não | Indústria fornecedora |

## Validações Implementadas

### Client-side
- ✅ GTIN não vazio
- ✅ Nome não vazio
- ✅ Preço de venda > 0
- ✅ Preço de custo ≤ preço de venda
- ✅ Estoque ≥ 0

### Server-side (API)
- ✅ GTIN único por vendedor
- ✅ Vendedor autenticado e autorizado
- ✅ Indústria é de categoria `INDUSTRIA`
- ✅ Categoria existe e está ativa
- ✅ Validação de tipos e ranges

## Integração com APIs

### POST `/api/products`

**Request:**
```json
{
  "gtin": "7891234567890",
  "nome": "Produto Exemplo",
  "descricao": "Descrição opcional",
  "preco_base": 35.90,
  "preco_custo": 25.50,
  "estoque": 100,
  "categoria_id": 5,
  "industria_id": 12
}
```

**Response Success:**
```json
{
  "success": true,
  "product": {
    "id": 123,
    "gtin": "7891234567890",
    "nome": "Produto Exemplo",
    "preco_base": 35.90,
    "preco_custo": 25.50,
    "estoque": 100,
    "lucro_unitario": 10.40,
    "margem_percentual": 40.78
  },
  "message": "Produto cadastrado com sucesso"
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "Este GTIN já está cadastrado para este vendedor"
}
```

### GET `/api/gtin?code=7891234567890`

**Response:**
```json
{
  "success": true,
  "product": {
    "gtin": "7891234567890",
    "nome": "Coca-Cola 2L",
    "descricao": "Refrigerante Coca-Cola 2 Litros",
    "marca": "Coca-Cola",
    "categoria": "Bebidas"
  }
}
```

## Estados do Componente

### Step 1: GTIN Search
- **Idle**: Aguardando input
- **Loading**: Buscando produto
- **Error**: GTIN inválido ou já cadastrado
- **Success**: Produto encontrado, avança para formulário

### Step 2: Form
- **Idle**: Aguardando preenchimento
- **Loading**: Salvando produto
- **Error**: Validação falhou
- **Success**: Produto cadastrado

## Experiência do Usuário

### ✨ Destaques
- **Auto-focus** no campo GTIN ao abrir modal
- **Enter** para buscar produto
- **ESC** para fechar modal
- **Loading states** em todos os botões
- **Mensagens de erro** claras e específicas
- **Preenchimento automático** de dados via API GTIN
- **Validação em tempo real** nos inputs
- **Feedback visual** em todos os estados

### 📱 Responsividade
- Desktop: Grid 2 colunas
- Tablet: Grid 2 colunas
- Mobile: Grid 1 coluna (stack)
- Botões adaptam tamanho

## Compatibilidade com Leitores de Código de Barras

O formulário suporta leitores de código de barras USB/Bluetooth:
- Input focado automaticamente
- Aceita entrada rápida de múltiplos dígitos
- Enter automático após scan dispara busca
- Funciona como teclado virtual

## Próximos Passos

### Melhorias Futuras
- [ ] Upload de imagem do produto
- [ ] Scanner de câmera (mobile)
- [ ] Histórico de produtos cadastrados
- [ ] Importação em lote (CSV/Excel)
- [ ] Sugestões de preço baseado em histórico
- [ ] Alertas de estoque baixo

### Integrações Pendentes
- [ ] Atualizar `ProductList` para usar API real
- [ ] Implementar edição inline de produtos
- [ ] Adicionar filtros e busca na lista
- [ ] Paginação da lista de produtos

## Testes

### Manual
```bash
# 1. Teste de scan com GTIN válido
- GTIN: 7891234567890 (Coca-Cola)
- Deve preencher nome e descrição

# 2. Teste de GTIN já cadastrado
- GTIN: (um já existente no DB)
- Deve mostrar erro

# 3. Teste de cadastro manual
- Clicar em "Cadastrar Manualmente"
- Preencher todos os campos
- Submeter e verificar criação

# 4. Teste de validação
- Preço de custo > preço de venda
- Deve mostrar erro
```

## Troubleshooting

### Erro: "Este GTIN já está cadastrado"
**Causa**: Produto com esse GTIN já existe para o vendedor  
**Solução**: Verificar lista de produtos ou usar GTIN diferente

### Erro: "Erro ao buscar produto"
**Causa**: API GTIN fora do ar ou GTIN inválido  
**Solução**: Usar cadastro manual

### Modal não fecha após cadastro
**Causa**: Erro na API de criação  
**Solução**: Verificar logs do servidor e console do browser

### Categorias/Indústrias não carregam
**Causa**: APIs `/api/categories` ou `/api/industries` falharam  
**Solução**: Verificar autenticação e conexão com banco

## Arquitetura

```
Page (seller/store)
├── Modal
│   └── AddProductForm
│       ├── Step 1: GTIN Search
│       │   ├── Input GTIN
│       │   ├── Search Button
│       │   └── Manual Button
│       └── Step 2: Product Form
│           ├── Product Info (GTIN, Nome, Descrição)
│           ├── Pricing (Venda, Custo)
│           ├── Stock
│           ├── Category Select
│           ├── Industry Select
│           └── Submit Button
└── ProductList (auto-refresh)
```

---

**Versão**: 1.0  
**Data**: Outubro 2025  
**Autor**: TradeBox Team

