import { redirect } from 'next/navigation';
import { getCurrentUser, getRedirectUrl } from './auth';
import { UserCategory } from './types';

/**
 * Verifica se o usuário tem permissão para acessar uma rota específica
 */
export async function checkRouteAccess(requiredCategory: UserCategory): Promise<void> {
  const user = await getCurrentUser();

  // Se não está autenticado, redireciona para login
  if (!user) {
    redirect('/auth/login');
  }

  // Se é categoria diferente da requerida, redireciona para dashboard correto
  if (user.categoria !== requiredCategory) {
    redirect(getRedirectUrl(user.categoria));
  }
}

/**
 * Verifica se o usuário é varejista
 */
export async function requireRetailer(): Promise<void> {
  await checkRouteAccess('VAREJISTA');
}

/**
 * Verifica se o usuário é indústria
 */
export async function requireIndustry(): Promise<void> {
  await checkRouteAccess('INDUSTRIA');
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

