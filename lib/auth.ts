import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { AuthPayload, UserCategory } from './types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'seu-secret-super-secreto-mude-isso-em-producao'
);

const COOKIE_NAME = 'tradebox_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

/**
 * Cria um token JWT para o usuário
 */
export async function createToken(payload: AuthPayload): Promise<string> {
  console.log('🔐 [AUTH] Criando token JWT com payload:', payload);
  console.log('🔐 [AUTH] Categoria no payload:', payload.categoria);
  console.log('🔐 [AUTH] Tipo da categoria:', typeof payload.categoria);
  
  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  console.log('✅ [AUTH] Token criado com sucesso');
  return token;
}

/**
 * Verifica e decodifica um token JWT
 */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    console.log('🔐 [AUTH] Verificando token JWT...');
    console.log('🔐 [AUTH] Token (primeiros 20 chars):', token.substring(0, 20));
    
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    console.log('✅ [AUTH] Token válido! Payload:', payload);
    return payload as unknown as AuthPayload;
  } catch (error) {
    console.error('❌ [AUTH] Token inválido ou expirado:', error);
    if (error instanceof Error) {
      console.error('❌ [AUTH] Mensagem de erro:', error.message);
    }
    return null;
  }
}

/**
 * Define o cookie de autenticação
 */
export async function setAuthCookie(token: string): Promise<void> {
  console.log('[AUTH] Definindo cookie de autenticação...');
  console.log('[AUTH] Token:', token.substring(0, 20) + '...');
  
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  
  console.log('[AUTH] Cookie definido com nome:', COOKIE_NAME);
}

/**
 * Remove o cookie de autenticação
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Obtém o usuário autenticado atual a partir do cookie
 */
export async function getCurrentUser(): Promise<AuthPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    
    console.log('🍪 [AUTH] Cookie encontrado:', token ? 'SIM' : 'NÃO');
    console.log('🍪 [AUTH] Nome do cookie:', COOKIE_NAME);
    
    if (!token) {
      console.log('❌ [AUTH] Nenhum token encontrado no cookie');
      return null;
    }
    
    const user = await verifyToken(token);
    
    if (!user) {
      console.log('❌ [AUTH] Token inválido - retornando null');
      return null;
    }
    
    // Validar estrutura do payload
    if (!user.userId || !user.email || !user.categoria) {
      console.error('❌ [AUTH] Payload incompleto:', user);
      return null;
    }
    
    // Garantir que categoria é um valor válido
    if (user.categoria !== 'retailer' && user.categoria !== 'industry') {
      console.error('❌ [AUTH] Categoria inválida:', user.categoria);
      return null;
    }
    
    console.log('✅ [AUTH] Usuário válido:', {
      userId: user.userId,
      email: user.email,
      categoria: user.categoria,
      nome: user.nome
    });
    
    return user;
  } catch (error) {
    console.error('❌ [AUTH] Erro ao obter usuário atual:', error);
    return null;
  }
}

/**
 * Retorna a URL de redirecionamento baseada na categoria do usuário
 */
export function getRedirectUrl(categoria: UserCategory): string {
  return categoria === 'VAREJISTA' ? '/seller' : '/industry';
}

/**
 * Converte categoria do banco para userType do frontend
 */
export function categoriaToUserType(categoria: UserCategory): 'retailer' | 'industry' {
  return categoria === 'VAREJISTA' ? 'retailer' : 'industry';
}

/**
 * Converte userType do frontend para categoria do banco
 */
export function userTypeToCategoria(userType: 'retailer' | 'industry'): UserCategory {
  return userType === 'retailer' ? 'VAREJISTA' : 'INDUSTRIA';
}

