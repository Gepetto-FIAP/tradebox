import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireVendedor, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';

const oracledb = require('oracledb');

/**
 * GET /api/dashboard/daily-sales
 * Retorna dados de vendas diárias dos últimos 7 dias
 */
export async function GET(request: NextRequest) {
  // Verificar se é vendedor
  const authResult = await requireVendedor();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { vendedorId } = authResult;
  
  let connection;
  
  try {
    connection = await connectOracle();
    
    // Buscar vendas diárias dos últimos 7 dias
    const dailySalesQuery = `
      SELECT 
        TO_CHAR(data_venda, 'YYYY-MM-DD') as dia,
        COUNT(*) as qtd_vendas,
        COALESCE(SUM(valor_total), 0) as valor_total
      FROM vendas
      WHERE vendedor_id = :vendedor_id
        AND status = 'CONCLUIDA'
        AND data_venda >= CURRENT_TIMESTAMP - INTERVAL '7' DAY
      GROUP BY TO_CHAR(data_venda, 'YYYY-MM-DD')
      ORDER BY dia
    `;
    
    const result = await connection.execute(
      dailySalesQuery, 
      { vendedor_id: vendedorId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const dailySales = (result.rows || []).map((row: any) => ({
      dia: row.DIA,
      qtd_vendas: row.QTD_VENDAS || 0,
      valor_total: row.VALOR_TOTAL || 0
    }));
    
    return successResponse({ dailySales });
    
  } catch (error) {
    console.error('Error fetching daily sales data:', error);
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
