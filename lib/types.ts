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
  estoque: number;
  ativo: 'Y' | 'N';
  created_at: Date;
  updated_at: Date;
}

export interface ProductWithDetails extends Product {
  vendedor_nome?: string;
  industria_nome?: string;
  categoria_nome?: string;
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

