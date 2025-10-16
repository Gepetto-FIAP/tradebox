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
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifica e decodifica um token JWT
 */
export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Define o cookie de autenticação
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
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
    
    if (!token) {
      return null;
    }
    
    return await verifyToken(token);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Retorna a URL de redirecionamento baseada na categoria do usuário
 */
export function getRedirectUrl(categoria: UserCategory): string {
  return categoria === 'retailer' ? '/seller' : '/industry';
}

/**
 * Converte categoria do banco para userType do frontend
 */
export function categoriaToUserType(categoria: UserCategory): 'retailer' | 'industry' {
  return categoria === 'retailer' ? 'retailer' : 'industry';
}

/**
 * Converte userType do frontend para categoria do banco
 */
export function userTypeToCategoria(userType: 'retailer' | 'industry'): UserCategory {
  return userType === 'retailer' ? 'retailer' : 'industry';
}

