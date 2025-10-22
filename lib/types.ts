// Tipos para autenticação do TradeBox

export type UserCategory = 'VAREJISTA' | 'INDUSTRIA';
export type PersonType = 'PF' | 'PJ';
export type UserType = 'retailer' | 'industry';

export interface User {
  id: number;
  email: string;
  nome: string;
  categoria: UserCategory;
  tipo_pessoa: PersonType;
  documento: string;
  telefone?: string;
  endereco?: string;
  ativo: 'Y' | 'N';
  created_at: Date;
  updated_at: Date;
}

export interface AuthPayload {
  userId: number;
  email: string;
  categoria: UserCategory;
  nome: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nome: string;
  categoria: UserCategory;
  tipo_pessoa: PersonType;
  documento: string;
  telefone?: string;
  endereco?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: number;
    email: string;
    nome: string;
    categoria: UserCategory;
  };
  redirectUrl?: string;
}

// Tipos para Analytics e Banco de Dados
export interface Venda {
  id_venda: number;
  valor_total_venda: number;
  timestamp: Date;
  varejista: number; // ID do usuário varejista
}

export interface ItemVenda {
  id_venda: number;
  id_produto: number;
  gtin: string;
  valor: number;
  quantidade: number;
}

export interface Produto {
  id_produto: number;
  nome_produto: string;
  industria_relacionado: number; // ID do usuário indústria
  varejista_relacionado: number; // ID do usuário varejista
  gtin: string;
  valor: number;
}

export interface Campanha {
  id_campanha: number;
  varejista: number; // ID do usuário varejista
  industria: number; // ID do usuário indústria
  tipo_campanha: 'DESCONTO' | 'PROMOCAO' | 'LANCAMENTO' | 'FIDELIDADE';
  status: 'ATIVA' | 'PAUSADA' | 'FINALIZADA' | 'PLANEJADA';
  data_inicio: Date;
  data_fim?: Date;
  nome_campanha: string;
  descricao?: string;
}

// Tipos para Analytics Dashboard
export interface AnalyticsMetrics {
  receita_total: number;
  total_vendas: number;
  crescimento_percentual: number;
  clientes_unicos: number;
  produtos_vendidos: number;
  ticket_medio: number;
  campanhas_ativas: number;
}

export interface VendasPorPeriodo {
  periodo: string;
  vendas: number;
  receita: number;
}

export interface TopProdutos {
  id_produto: number;
  nome_produto: string;
  quantidade_vendida: number;
  receita_total: number;
  gtin: string;
}

export interface CampanhasAnalytics {
  campanhas_ativas: number;
  campanhas_finalizadas: number;
  roi_medio: number;
  conversao_media: number;
}

// ==========================================
// Tipos para Produtos e Vendas
// ==========================================

export type SaleStatus = 'CONCLUIDA' | 'CANCELADA' | 'PENDENTE';

export interface Category {
  id: number;
  nome: string;
  descricao?: string;
  ativo: 'Y' | 'N';
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  vendedor_id: number;
  industria_id?: number;
  categoria_id?: number;
  gtin: string;
  nome: string;
  descricao?: string;
  preco_base: number;
  preco_custo: number;  // Preço de custo pago à indústria
  estoque: number;
  ativo: 'Y' | 'N';
  created_at: Date;
  updated_at: Date;
}

export interface ProductWithDetails extends Product {
  vendedor_nome?: string;
  industria_nome?: string;
  categoria_nome?: string;
  // Campos calculados de margem
  lucro_unitario?: number;      // preco_base - preco_custo
  margem_percentual?: number;   // ((preco_base - preco_custo) / preco_custo) * 100
}

export interface Customer {
  id: number;
  vendedor_id: number;
  nome: string;
  documento?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  ativo: 'Y' | 'N';
  created_at: Date;
  updated_at: Date;
}

export interface Sale {
  id: number;
  vendedor_id: number;
  cliente_id?: number;
  data_venda: Date;
  valor_total: number;
  quantidade_itens: number;
  status: SaleStatus;
  observacoes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SaleWithDetails extends Sale {
  vendedor_nome?: string;
  cliente_nome?: string;
}

export interface SaleItem {
  id: number;
  venda_id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
  created_at: Date;
}

export interface SaleItemWithProduct extends SaleItem {
  produto_nome?: string;
  produto_gtin?: string;
}

// ==========================================
// Tipos para Requests/Responses da API
// ==========================================

export interface CreateProductRequest {
  gtin: string;
  nome: string;
  descricao?: string;
  preco_base: number;
  preco_custo?: number;  // Opcional no cadastro inicial
  estoque?: number;
  categoria_id?: number;
  industria_id?: number;
}

export interface UpdateProductRequest {
  nome?: string;
  descricao?: string;
  preco_base?: number;
  estoque?: number;
  categoria_id?: number;
  industria_id?: number;
  ativo?: 'Y' | 'N';
  // preco_custo não está aqui - vendedor não pode alterar
}

// Novo: Request específico para indústria atualizar preço de custo
export interface UpdatePrecoCustoRequest {
  preco_custo: number;
}

export interface CreateSaleItemRequest {
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
}

export interface CreateSaleRequest {
  cliente_id?: number;
  itens: CreateSaleItemRequest[];
  observacoes?: string;
}

export interface CreateSaleResponse {
  success: boolean;
  message?: string;
  venda_id?: number;
  valor_total?: number;
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  product?: ProductWithDetails;
}

export interface ProductListResponse {
  success: boolean;
  message?: string;
  products?: ProductWithDetails[];
  total?: number;
}

export interface SaleResponse {
  success: boolean;
  message?: string;
  sale?: SaleWithDetails;
  items?: SaleItemWithProduct[];
}

export interface SaleListResponse {
  success: boolean;
  message?: string;
  sales?: SaleWithDetails[];
  total?: number;
}

// ==========================================
// Tipos para Dashboard Analytics
// ==========================================

export interface DashboardMetrics {
  total_vendas: number;
  faturamento: number;
  total_produtos: number;
  produtos_estoque_baixo: number;
  vendas_7d: number;
}

export interface TrendingProduct {
  produto_id: number;
  nome: string;
  vendas: number;
}

export interface SalesByCategory {
  categoria: string;
  qtd_vendas: number;
  valor_vendas: number;
}

export interface TopProduct {
  produto_id: number;
  nome: string;
  qtd_vendida: number;
  receita: number;
}

export interface MonthlyPerformance {
  mes: string;
  qtd_pedidos: number;
  receita: number;
}

export interface IndustryPartner {
  industria_id: number;
  industria: string;
  qtd_produtos: number;
  qtd_vendas: number;
  receita_gerada: number;
}

// ==========================================
// Tipos para Análises de Margem e Lucro
// ==========================================

export interface ProfitableProduct {
  produto_id: number;
  nome: string;
  gtin: string;
  qtd_vendas: number;
  qtd_vendida: number;
  receita_total: number;
  custo_total: number;
  lucro_total: number;
  margem_media: number;
}

export interface ProfitAnalysisBySale {
  venda_id: number;
  data_venda: Date;
  receita_total: number;
  custo_total: number;
  lucro_total: number;
  margem_percentual: number;
}

export interface MarginByIndustry {
  industria: string;
  qtd_produtos: number;
  margem_media: number;
  receita_gerada: number;
  custo_total: number;
  lucro_total: number;
}

export interface LowMarginAlert {
  produto_id: number;
  nome: string;
  preco_custo: number;
  preco_base: number;
  lucro_unitario: number;
  margem_percentual: number;
}

export interface PriceSuggestion {
  produto_id: number;
  nome: string;
  gtin: string;
  vendedor: string;
  preco_custo_atual: number;
  preco_base: number;
  margem_atual: number;
  preco_custo_sugerido: number;  // Para margem alvo
  margem_alvo: number;
}

