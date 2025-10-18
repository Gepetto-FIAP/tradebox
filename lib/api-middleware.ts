import { NextResponse } from 'next/server';
import { getCurrentUser } from './auth';
import { AuthPayload } from './types';

/**
 * Middleware para verificar autenticação
 * Retorna o usuário autenticado ou response de erro
 */
export async function requireAuth(): Promise<{ user: AuthPayload } | NextResponse> {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Não autenticado', message: 'Faça login para continuar' },
      { status: 401 }
    );
  }
  
  return { user };
}

/**
 * Middleware para verificar se usuário é vendedor (VAREJISTA)
 */
export async function requireVendedor(): Promise<{ vendedorId: number } | NextResponse> {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  const { user } = authResult;
  
  if (user.categoria !== 'VAREJISTA') {
    return NextResponse.json(
      { success: false, error: 'Acesso negado', message: 'Apenas vendedores podem acessar este recurso' },
      { status: 403 }
    );
  }
  
  return { vendedorId: user.userId };
}

/**
 * Extrai vendedor_id do usuário autenticado
 */
export async function getVendedorId(): Promise<number | null> {
  const user = await getCurrentUser();
  
  if (!user || user.categoria !== 'VAREJISTA') {
    return null;
  }
  
  return user.userId;
}

/**
 * Cria response de erro padronizado
 */
export function errorResponse(
  error: string, 
  message?: string, 
  status: number = 400
): NextResponse {
  return NextResponse.json(
    { success: false, error, message },
    { status }
  );
}

/**
 * Cria response de sucesso padronizado
 */
export function successResponse(
  data: any, 
  message?: string, 
  status: number = 200
): NextResponse {
  return NextResponse.json(
    { success: true, ...data, message },
    { status }
  );
}

/**
 * Trata erros do Oracle e retorna response apropriado
 */
export function handleOracleError(error: any): NextResponse {
  console.error('Oracle error:', error);
  
  const errorCode = error.errorNum || error.code;
  
  // ORA-00001: Unique constraint violation
  if (errorCode === 1) {
    return errorResponse(
      'Registro duplicado',
      'Já existe um registro com estes dados',
      400
    );
  }
  
  // ORA-02292: Integrity constraint (child record found)
  if (errorCode === 2292) {
    return errorResponse(
      'Operação não permitida',
      'Não é possível deletar este registro pois existem registros relacionados',
      400
    );
  }
  
  // ORA-02291: Parent key not found
  if (errorCode === 2291) {
    return errorResponse(
      'Referência inválida',
      'O registro referenciado não existe',
      400
    );
  }
  
  // Erro genérico
  return errorResponse(
    'Erro no banco de dados',
    process.env.NODE_ENV === 'development' ? error.message : 'Erro ao processar operação',
    500
  );
}

