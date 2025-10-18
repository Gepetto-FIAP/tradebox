# 📊 Seller Analytics - Documentação

## Estrutura de Arquivos

```
seller/analytics/
├── page.tsx                 # Componente principal da página
├── analytics.module.css     # Estilos responsivos
├── chartConfigs.ts          # Configurações dos gráficos
├── useAnalyticsData.ts      # Hook customizado para fetch de dados
└── README.md               # Esta documentação
```

## 🎯 Responsabilidades de Cada Arquivo

### **page.tsx**
- **Propósito**: Componente React principal que renderiza a página
- **Responsabilidades**:
  - Renderizar layout (métricas + gráficos)
  - Consumir hook `useAnalyticsData`
  - Preparar dados para visualização
  - Gerenciar estado de loading
- **Não faz**:
  - ❌ Fetch de dados (delegado ao hook)
  - ❌ Configurações de gráficos (delegado ao chartConfigs)

### **useAnalyticsData.ts**
- **Propósito**: Hook customizado para gerenciar dados da API
- **Responsabilidades**:
  - Fazer requisições às 3 APIs de analytics
  - Gerenciar estados (loading, data)
  - Implementar fallback para dados mock
  - Fornecer função de refetch
- **Vantagens**:
  - ✅ Reutilizável em outros componentes
  - ✅ Testes isolados
  - ✅ Lógica centralizada

### **chartConfigs.ts**
- **Propósito**: Configurações centralizadas dos gráficos Chart.js
- **Contém**:
  - Cores da aplicação (`CHART_COLORS`)
  - Opções dos gráficos Line, Bar e Doughnut
  - Funções para criar datasets
  - **Legendas visíveis** em Line e Bar charts
  - **Eixos X e Y visíveis** com labels e grid
- **Vantagens**:
  - ✅ Fácil manutenção de cores/estilos
  - ✅ Reutilização de configurações
  - ✅ Separação de concerns
  - ✅ Melhor visualização dos dados

### **analytics.module.css**
- **Propósito**: Estilos CSS responsivos
- **Estrutura**:
  - Seções organizadas com comentários
  - Mobile-first approach
  - 7 breakpoints progressivos (700px → 3200px+)
  - Uso de `clamp()` para escalabilidade fluida

## 📦 Dependências

### APIs
- `GET /api/analytics/metrics` - Métricas principais
- `GET /api/analytics/vendas-periodo?periodo=7d` - Vendas por período
- `GET /api/analytics/top-produtos?limite=5&periodo=30d` - Top produtos

### Bibliotecas
- **Chart.js** + **react-chartjs-2**: Renderização de gráficos
- **React Icons**: Ícones (BiDollar, BiCart, BiUser, BiRefresh)

### Componentes
- **CardData**: Card de métricas reutilizável

### Responsividade
- **< 700px**: 1 coluna (mobile)
- **700px - 899px**: 2 colunas (tablet)
- **900px - 1399px**: 2 colunas (desktop)
- **1400px - 1799px**: 3 colunas
- **1800px+**: 4 colunas (widescreen)

## 🔄 Fluxo de Dados

```
useAnalyticsData Hook
        ↓
  Fetch APIs (parallel)
        ↓
   ┌────┴────┐
   ↓         ↓
Success   Error
   ↓         ↓
 State    Fallback (mock)
   ↓
Component (page.tsx)
   ↓
chartConfigs.ts (create datasets)
   ↓
Chart.js Components
```

## 🚀 Como Adicionar um Novo Gráfico

1. **Adicionar configuração** em `chartConfigs.ts`:
```typescript
export const newChartOptions: ChartOptions<'bar'> = {
  // ... configurações
};

export const createNewChartData = (data: Type[]) => ({
  labels: data.map(/* ... */),
  datasets: [/* ... */]
});
```

2. **Adicionar à API** (se necessário):
```typescript
// useAnalyticsData.ts
const newDataRes = await fetch('/api/analytics/new-endpoint');
```

3. **Renderizar** em `page.tsx`:
```tsx
const newData = createNewChartData(apiData);

<div className={styles.chartCard}>
  <h3>Novo Gráfico</h3>
  <div className={styles.chartContainer}>
    <Bar data={newData} options={newChartOptions} />
  </div>
</div>
```

## 🧪 Testabilidade

Agora é fácil testar cada parte:

```typescript
// Testar fetch isoladamente
import { useAnalyticsData } from './useAnalyticsData';

// Testar configurações de gráficos
import { createVendasChartData } from './chartConfigs';

// Mock do hook no componente
jest.mock('./useAnalyticsData');
```

## 📝 Convenções

- **Nomes de arquivos**: camelCase para utils, PascalCase para componentes
- **Exports**: Named exports para utils, default para componentes
- **Comentários**: Seções bem delimitadas com `/* ======= */`
- **Tipagem**: TypeScript estrito em todos os arquivos

## 🔧 Manutenção

### Para mudar cores globais:
→ Edite `CHART_COLORS` em `chartConfigs.ts`

### Para ajustar responsividade:
→ Edite breakpoints em `analytics.module.css`

### Para adicionar/remover APIs:
→ Modifique `useAnalyticsData.ts`

### Para alterar layout dos gráficos:
→ Ajuste grid no JSX de `page.tsx`

---

**Última atualização**: Outubro 2025  
**Versão**: 2.0 (Refatorado)
