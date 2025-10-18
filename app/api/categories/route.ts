import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleOracleError } from '@/lib/api-middleware';

/**
 * GET /api/categories
 * Lista todas as categorias ativas
 */
export async function GET(request: NextRequest) {
  // Verificar autenticação
  const authResult = await requireAuth();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { searchParams } = new URL(request.url);
  const ativo = searchParams.get('ativo') || 'Y';
  
  let connection;
  
  try {
    connection = await connectOracle();
    
    const query = `
      SELECT 
        id,
        nome,
        descricao,
        ativo,
        created_at,
        updated_at
      FROM categorias
      WHERE ativo = :ativo
      ORDER BY nome
    `;
    
    const result = await connection.execute(query, { ativo });
    
    // Converter rows para formato esperado
    const categories = (result.rows || []).map((row: any) => ({
      id: row.ID,
      nome: row.NOME,
      descricao: row.DESCRICAO,
      ativo: row.ATIVO,
      created_at: row.CREATED_AT,
      updated_at: row.UPDATED_AT
    }));
    
    return successResponse({ categories });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    return handleOracleError(error);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

