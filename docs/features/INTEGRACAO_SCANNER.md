# Correção de Erro e Integração com Scanner

## Problema Identificado ❌

**Erro**: `Encountered two children with the same key, 'cat-undefined'`

### Causa Raiz
O Oracle retorna os resultados de queries como **arrays de arrays** por padrão, não como objetos com propriedades nomeadas. Quando fazíamos `.map((row: any) => ({ id: row.ID, ... }))`, o `row` era um array `[1, 'Nome', ...]`, não um objeto `{ ID: 1, NOME: 'Nome', ... }`.

Resultado: Todas as categorias e indústrias tinham `id: undefined`, causando keys duplicadas no React.

## Solução Implementada ✅

Adicionado o parâmetro `outFormat` nas queries do Oracle para retornar objetos:

```typescript
const result = await connection.execute(
  query, 
  { ativo },
  { outFormat: connection.constructor.OUT_FORMAT_OBJECT }  // <-- Correção
);
```

### Arquivos Corrigidos
- ✅ `/app/api/categories/route.ts`
- ✅ `/app/api/industries/route.ts`

Agora os dados retornam como:
```javascript
[
  { ID: 1, NOME: 'Bebidas', DESCRICAO: '...', ATIVO: 'Y', ... },
  { ID: 2, NOME: 'Alimentos', DESCRICAO: '...', ATIVO: 'Y', ... },
]
```

## Integração com Scanner Existente 📷

### Rota `/scan` - Scanner de Vendas
**Localização**: `/app/(dashboard)/scan/page.tsx`

**Funcionalidade**:
- Usa ZXing para scan via câmera do dispositivo
- Detecta código de barras em tempo real
- Consulta API GTIN para obter informações do produto
- Permite adicionar ao carrinho com preço definido
- **Finalidade**: Registrar vendas de produtos

### Diferença com `/seller/store` - Cadastro de Produtos

| Aspecto | `/scan` (Vendas) | `/seller/store` (Cadastro) |
|---------|------------------|----------------------------|
| **Objetivo** | Vender produtos | Cadastrar produtos |
| **Scanner** | Câmera ZXing | Leitor USB/Bluetooth |
| **API GTIN** | Busca info básica | Preenche formulário completo |
| **Output** | Adiciona ao carrinho | Cria produto no banco |
| **Campos** | Apenas preço de venda | Todos os campos do produto |
| **Fluxo** | Scan → Preço → Carrinho | Scan → Formulário → Cadastro |

### Fluxos Complementares

#### Fluxo 1: Cadastrar Produto Novo
```
1. Vendedor acessa /seller/store
2. Clica "Adicionar Produto"
3. Opção A: Usa leitor USB/Bluetooth
   - Ativa scanner
   - Escaneia código de barras
   - Sistema consulta API GTIN
   - Preenche dados automaticamente
4. Opção B: Digita GTIN manualmente
   - Digite o código
   - Busca informações
5. Completa campos (preço, estoque, categoria, indústria)
6. Cadastra produto no banco
7. Produto disponível para vendas
```

#### Fluxo 2: Vender Produto Cadastrado
```
1. Vendedor acessa /scan
2. Aponta câmera para código de barras
3. Sistema detecta código automaticamente
4. Busca produto no banco via GTIN
5. Se encontrado:
   - Mostra informações do produto
   - Vendedor confirma preço (ou usa preço cadastrado)
   - Adiciona ao carrinho
6. Se não encontrado:
   - Erro: produto não cadastrado
   - Opção: Redirecionar para cadastro
```

### Recomendações de UX

#### 1. Link entre as funcionalidades
Quando produto não encontrado em `/scan`:

```typescript
// Em /scan/page.tsx
if (productInfo.error) {
  return (
    <div className={styles.product_error}>
      <p>Produto não cadastrado</p>
      <Button href="/seller/store">
        Cadastrar Produto
      </Button>
    </div>
  );
}
```

#### 2. Pre-fill no cadastro
Se vier de `/scan` com GTIN:

```typescript
// URL: /seller/store?gtin=7894900700398
// Em AddProductForm.tsx
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const gtin = urlParams.get('gtin');
  if (gtin) {
    setGtinSearch(gtin);
    searchByGTIN();
  }
}, []);
```

#### 3. Usar produto cadastrado em vendas
Modificar `/scan` para buscar primeiro no banco:

```typescript
async function consultarProduto(codigo: string) {
  // 1. Buscar no banco
  const produtoCadastrado = await fetch(`/api/products/gtin/${codigo}`);
  
  if (produtoCadastrado.success) {
    // Usa dados do banco (com preço já definido)
    setProductInfo({
      ...produtoCadastrado.product,
      productValue: produtoCadastrado.product.preco_base
    });
  } else {
    // 2. Buscar na API GTIN (produto não cadastrado)
    const response = await fetch(`/api/gtin?code=${codigo}`);
    setProductInfo(await response.json());
  }
}
```

## Melhores Práticas Implementadas

### 1. **Configuração Global do Oracle**
Para evitar repetir `outFormat` em todas as queries:

```typescript
// lib/db.ts (recomendação futura)
import oracledb from 'oracledb';

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

export async function connectOracle() {
  return await oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
  });
}
```

### 2. **Validação de Dados**
Sempre verificar se dados existem antes de usar:

```typescript
const categories = (result.rows || []).map((row: any) => ({
  id: row.ID,
  nome: row.NOME || 'Sem nome',  // Fallback
  // ...
})).filter(cat => cat.id != null);  // Remove inválidos
```

### 3. **Keys Únicas no React**
Usar prefixos descritivos:

```typescript
{categories.map((cat) => (
  <option key={`category-${cat.id}`} value={cat.id}>
    {cat.nome}
  </option>
))}
```

### 4. **Loading States**
Feedback visual durante fetch:

```typescript
const [loadingCategories, setLoadingCategories] = useState(true);

async function fetchCategories() {
  setLoadingCategories(true);
  try {
    // ...
  } finally {
    setLoadingCategories(false);
  }
}
```

## Testes

### Teste 1: Verificar Formato de Retorno
```bash
# No console do browser
fetch('/api/categories')
  .then(r => r.json())
  .then(data => console.log('Categories:', data.categories));

# Deve mostrar:
# [{ id: 1, nome: 'Bebidas', ... }, { id: 2, ... }]
```

### Teste 2: Cadastrar Produto
```
1. Acesse /seller/store
2. Clique "Adicionar Produto"
3. Ative scanner ou digite GTIN
4. Verifique se dropdowns carregam
5. Selecione categoria e indústria
6. Cadastre produto
7. Verifique se aparece na lista
```

### Teste 3: Vender Produto
```
1. Acesse /scan
2. Escaneie código de produto cadastrado
3. Defina preço
4. Adicione ao carrinho
5. Finalize venda
```

## Próximos Passos

### Integração Completa
- [ ] Modificar `/scan` para buscar produtos do banco primeiro
- [ ] Adicionar link de cadastro quando produto não encontrado
- [ ] Implementar preenchimento automático de GTIN via URL params
- [ ] Usar `preco_base` do produto cadastrado em vendas
- [ ] Adicionar histórico de produtos escaneados

### Melhorias de Performance
- [ ] Configurar `outFormat` globalmente no Oracle
- [ ] Cache de categorias e indústrias no frontend
- [ ] Debounce na busca de GTIN
- [ ] Lazy loading de imagens de produtos

### UX
- [ ] Feedback visual quando produto já cadastrado
- [ ] Sugestão de preço baseado em histórico
- [ ] Scanner alternativo em `/seller/store` (ZXing)
- [ ] Atalho para cadastro rápido durante venda

---

**Status**: ✅ Erro corrigido  
**Impacto**: Dropdowns de categoria e indústria funcionando  
**Versão**: 1.1  
**Data**: Outubro 2025

