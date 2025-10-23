import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleOracleError } from '@/lib/api-middleware';
const oracledb = require('oracledb');

/**
 * GET /api/industries
 * Lista todos os usuários do tipo INDUSTRIA
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
        email,
        nome,
        categoria,
        tipo_pessoa,
        documento,
        telefone,
        endereco,
        ativo,
        created_at
      FROM usuarios
      WHERE categoria = 'INDUSTRIA'
        AND ativo = :ativo
      ORDER BY nome
    `;
    
    const result = await connection.execute(
      query, 
      { ativo },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    // Converter rows para formato esperado
    const industries = (result.rows || []).map((row: any) => ({
      id: row.ID,
      email: row.EMAIL,
      nome: row.NOME,
      categoria: row.CATEGORIA,
      tipo_pessoa: row.TIPO_PESSOA,
      documento: row.DOCUMENTO,
      telefone: row.TELEFONE,
      endereco: row.ENDERECO,
      ativo: row.ATIVO,
      created_at: row.CREATED_AT
    }));
    
    return successResponse({ industries });
    
  } catch (error) {
    console.error('Error fetching industries:', error);
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

