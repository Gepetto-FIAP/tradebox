// Tipos para autenticação do TradeBox

export type UserCategory = 'retailer' | 'industry';
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

