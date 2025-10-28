import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireVendedor, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';
import { validatePeriodo } from '@/lib/validators';

const oracledb = require('oracledb');

/**
 * GET /api/dashboard/trending
 * Retorna produtos mais vendidos (trending)
 * Query params: ?periodo=30d&limit=10
 */
export async function GET(request: NextRequest) {
  // Verificar se é vendedor
  const authResult = await requireVendedor();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { vendedorId } = authResult;
  const { searchParams } = new URL(request.url);
  
  const periodo = searchParams.get('periodo') || '30d';
  const limit = parseInt(searchParams.get('limit') || '10');
  
  // Validar período
  const periodoValidation = validatePeriodo(periodo);
  if (!periodoValidation.valid) {
    return errorResponse('Período inválido', periodoValidation.error, 400);
  }
  
  const days = periodoValidation.days!;
  
  let connection;
  
  try {
    connection = await connectOracle();
    
    const query = `
      SELECT 
        p.id as produto_id,
        p.nome,
        SUM(iv.quantidade) as vendas
      FROM produtos p
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE v.vendedor_id = :vendedor_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
      GROUP BY p.id, p.nome
      ORDER BY vendas DESC
      FETCH FIRST :limit ROWS ONLY
    `;
    
    const result = await connection.execute(
      query, 
      {
        vendedor_id: vendedorId,
        limit
      },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const products = (result.rows || []).map((row: any) => ({
      produto_id: row.PRODUTO_ID,
      nome: row.NOME,
      vendas: row.VENDAS
    }));
    
    return successResponse({ products });
    
  } catch (error) {
    console.error('Error fetching trending products:', error);
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

