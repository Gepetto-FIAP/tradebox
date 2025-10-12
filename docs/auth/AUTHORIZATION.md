# 🔐 Sistema de Autorização - TradeBox

## 📋 Visão Geral

Sistema de controle de acesso baseado em tipo de usuário (categoria) para garantir que cada usuário só acesse rotas apropriadas.

## 🎯 Regras de Acesso

### 1. Varejistas (VAREJISTA / Retailer)
**Podem acessar:**
- ✅ `/seller` - Dashboard principal
- ✅ `/seller/sell` - Página de vendas
- ✅ `/seller/store` - Gerenciamento de loja
- ✅ `/seller/analytics` - Análises de vendas
- ✅ `/scan` - Scanner de produtos

**NÃO podem acessar:**
- ❌ `/industry/*` - Rotas de indústria

### 2. Indústrias (INDUSTRIA / Industry)
**Podem acessar:**
- ✅ `/industry` - Dashboard principal
- ✅ `/industry/products` - Catálogo de produtos
- ✅ `/industry/analytics` - Análises de distribuição
- ✅ `/scan` - Scanner de produtos

**NÃO podem acessar:**
- ❌ `/seller/*` - Rotas de varejista

## 🏗️ Arquitetura

### Arquivo: `lib/authorization.ts`

Contém os helpers de autorização:

```typescript
// Verifica se usuário tem permissão para categoria específica
async function checkRouteAccess(requiredCategory: UserCategory): Promise<void>

// Requer que usuário seja varejista
async function requireRetailer(): Promise<void>

// Requer que usuário seja indústria
async function requireIndustry(): Promise<void>

// Requer apenas autenticação (qualquer tipo)
async function requireAuth()
```

## 🔄 Fluxo de Autorização

```mermaid
graph TD
    A[Usuário acessa rota] --> B{Está autenticado?}
    B -->|Não| C[Redireciona para /auth/login]
    B -->|Sim| D{Categoria correta?}
    D -->|Sim| E[Renderiza página]
    D -->|Não| F[Redireciona para dashboard correto]
    F -->|VAREJISTA| G[/seller]
    F -->|INDUSTRIA| H[/industry]
```

## 📝 Implementação nos Layouts

### Layout Varejista (`seller/layout.tsx`)

```typescript
import { requireRetailer } from "@/lib/authorization";

export default async function DashboardSellerLayout({ children }) {
  // Verifica se é varejista
  await requireRetailer();
  
  return <div>{children}</div>;
}
```

### Layout Indústria (`industry/layout.tsx`)

```typescript
import { requireIndustry } from "@/lib/authorization";

export default async function IndustryLayout({ children }) {
  // Verifica se é indústria
  await requireIndustry();
  
  return <div>{children}</div>;
}
```

### Layout Scanner (`scan/layout.tsx`)

```typescript
import { requireAuth } from "@/lib/authorization";

export default async function ScanLayout({ children }) {
  // Apenas verifica autenticação (ambos podem escanear)
  await requireAuth();
  
  return <div>{children}</div>;
}
```

## 🧪 Cenários de Teste

### Cenário 1: Varejista tenta acessar rota de indústria

```
1. Usuário: varejista@email.com (VAREJISTA)
2. Tenta acessar: /industry
3. Sistema verifica: categoria !== INDUSTRIA
4. Resultado: Redirecionado para /seller
```

### Cenário 2: Indústria tenta acessar rota de varejista

```
1. Usuário: industria@email.com (INDUSTRIA)
2. Tenta acessar: /seller
3. Sistema verifica: categoria !== VAREJISTA
4. Resultado: Redirecionado para /industry
```

### Cenário 3: Usuário não autenticado

```
1. Usuário: Sem autenticação
2. Tenta acessar: /seller ou /industry
3. Sistema verifica: user === null
4. Resultado: Redirecionado para /auth/login
```

### Cenário 4: Ambos acessam scanner

```
1. Usuário: Qualquer categoria autenticada
2. Acessa: /scan
3. Sistema verifica: Apenas autenticação
4. Resultado: Acesso permitido
```

## 🛡️ Camadas de Proteção

### 1️⃣ **Nível de Layout** (Server Components)
- Verificação em `layout.tsx` de cada seção
- Executa no servidor antes de renderizar
- Redireciona automaticamente se não autorizado

### 2️⃣ **Middleware** (Opcional)
- `middleware.ts` na raiz do projeto
- Intercepta requisições antes de chegarem às rotas
- Útil para logging e regras globais

### 3️⃣ **API Routes**
- Verificação em cada endpoint da API
- Garante que dados não sejam expostos
- Retorna 401/403 para não autorizados

## 🔑 Helpers Disponíveis

### `checkRouteAccess(categoria)`
Verifica se o usuário logado tem a categoria requerida.

```typescript
await checkRouteAccess('VAREJISTA'); // Só permite varejistas
await checkRouteAccess('INDUSTRIA');  // Só permite indústrias
```

### `requireRetailer()`
Atalho para verificar se é varejista.

```typescript
await requireRetailer(); // Requer VAREJISTA
```

### `requireIndustry()`
Atalho para verificar se é indústria.

```typescript
await requireIndustry(); // Requer INDUSTRIA
```

### `requireAuth()`
Verifica apenas se está autenticado (qualquer categoria).

```typescript
const user = await requireAuth(); // Retorna dados do usuário
```

## 📊 Matriz de Acesso

| Rota | Varejista | Indústria | Não Autenticado |
|------|-----------|-----------|-----------------|
| `/` | ✅ | ✅ | ✅ |
| `/auth/login` | ✅ | ✅ | ✅ |
| `/auth/register` | ✅ | ✅ | ✅ |
| `/seller` | ✅ | 🔄 → `/industry` | 🔄 → `/auth/login` |
| `/seller/*` | ✅ | 🔄 → `/industry` | 🔄 → `/auth/login` |
| `/industry` | 🔄 → `/seller` | ✅ | 🔄 → `/auth/login` |
| `/industry/*` | 🔄 → `/seller` | ✅ | 🔄 → `/auth/login` |
| `/scan` | ✅ | ✅ | 🔄 → `/auth/login` |

**Legenda:**
- ✅ = Acesso permitido
- 🔄 = Redirecionado automaticamente
- ❌ = Acesso negado

## 🚀 Como Usar em Novas Rotas

### Passo 1: Criar Layout

```typescript
// app/nova-rota/layout.tsx
import { requireRetailer } from "@/lib/authorization";

export default async function NovaRotaLayout({ children }) {
  await requireRetailer(); // ou requireIndustry() ou requireAuth()
  return <div>{children}</div>;
}
```

### Passo 2: Criar Páginas

```typescript
// app/nova-rota/page.tsx
export default function NovaRotaPage() {
  // Layout já verificou permissões
  return <div>Conteúdo protegido</div>;
}
```

## 🔍 Debugging

### Ver usuário atual

```typescript
import { getCurrentUser } from "@/lib/auth";

const user = await getCurrentUser();
console.log(user); // { userId, email, categoria, nome }
```

### Logs de redirecionamento

Adicione logs no `lib/authorization.ts`:

```typescript
export async function checkRouteAccess(requiredCategory: UserCategory) {
  const user = await getCurrentUser();
  
  console.log('Verificando acesso:', {
    usuario: user?.email,
    categoria: user?.categoria,
    requerida: requiredCategory
  });
  
  // ... resto do código
}
```

## 🐛 Troubleshooting

### Loop de redirecionamento
**Problema**: Usuário fica em loop infinito de redirecionamento

**Solução**: Verifique se o `getRedirectUrl()` está retornando a URL correta para a categoria.

### Usuário não autenticado não redireciona
**Problema**: Usuário sem login consegue acessar rotas protegidas

**Solução**: Verifique se o layout está usando `await requireAuth()` ou similar.

### Categoria não reconhecida
**Problema**: Sistema não reconhece categoria do usuário

**Solução**: Verifique se o JWT contém o campo `categoria` corretamente.

## 🔒 Boas Práticas

✅ **Sempre use Server Components** para verificações de autorização
✅ **Proteja no nível de layout** para cobrir todas as sub-rotas
✅ **Use helpers específicos** (`requireRetailer`, `requireIndustry`)
✅ **Teste todos os cenários** (autenticado, não autenticado, categoria errada)
✅ **Adicione comentários** explicando qual categoria pode acessar

❌ **Não faça verificação no client-side** apenas (inseguro)
❌ **Não confie em cookies não assinados**
❌ **Não exponha dados sensíveis** em componentes cliente

## 📚 Referências

- [Auth Helper](../lib/auth.ts)
- [Authorization Helper](../lib/authorization.ts)
- [User Types](../lib/types.ts)
- [Middleware](../middleware.ts)

---

**Sistema de Autorização TradeBox** - Segurança por Categoria de Usuário 🔐

