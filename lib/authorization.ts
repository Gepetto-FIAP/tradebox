import { redirect } from 'next/navigation';
import { getCurrentUser, getRedirectUrl } from './auth';
import { UserCategory } from './types';
import { headers } from 'next/headers';

/**
 * Verifica se o usuário tem permissão para acessar uma rota específica
 */
export async function checkRouteAccess(requiredCategory: UserCategory): Promise<void> {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('referer') || 'unknown';
  
  console.log('🌐 [AUTHORIZATION] URL atual:', pathname);
  console.log('[AUTHORIZATION] Verificando acesso à rota:', requiredCategory);
  const user = await getCurrentUser();

  console.log('[AUTHORIZATION] Usuário atual:', user);

  // Se não está autenticado, redireciona para login
  if (!user) {
    console.log('[AUTHORIZATION] Usuário não autenticado - redirecionando para /auth/login');
    redirect('/auth/login');
  }

  console.log('[AUTHORIZATION] Categoria do usuário:', user.categoria);
  console.log('[AUTHORIZATION] Categoria requerida:', requiredCategory);
  console.log('[AUTHORIZATION] Comparação (===):', user.categoria === requiredCategory);
  console.log('[AUTHORIZATION] Tipo da categoria do usuário:', typeof user.categoria);
  console.log('[AUTHORIZATION] Tipo da categoria requerida:', typeof requiredCategory);

  // Se é categoria diferente da requerida, redireciona para dashboard correto
  if (user.categoria !== requiredCategory) {
    const redirectUrl = getRedirectUrl(user.categoria);
    console.log('⚠️ [AUTHORIZATION] Categoria incorreta! Redirecionando para:', redirectUrl);
    console.log('⚠️ [AUTHORIZATION] Isso pode causar loop se o redirect for para a mesma página!');
    redirect(redirectUrl);
  }

  console.log('[AUTHORIZATION] Acesso permitido!');
}

/**
 * Verifica se o usuário é varejista
 */
export async function requireRetailer(): Promise<void> {
  await checkRouteAccess('retailer');
}

/**
 * Verifica se o usuário é indústria
 */
export async function requireIndustry(): Promise<void> {
  await checkRouteAccess('industry');
}

/**
 * Obtém o usuário atual e garante que está autenticado
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }
  
  return user;
}

