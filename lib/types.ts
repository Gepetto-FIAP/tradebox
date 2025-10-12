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

export interface JWTPayload {
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

