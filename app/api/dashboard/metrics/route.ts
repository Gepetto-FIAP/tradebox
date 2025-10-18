import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireVendedor, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';
import { validatePeriodo } from '@/lib/validators';

/**
 * GET /api/dashboard/metrics
 * Retorna métricas principais do dashboard
 * Query params: ?periodo=7d (7d, 30d, 90d, 1y)
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
  
  // Validar período
  const periodoValidation = validatePeriodo(periodo);
  if (!periodoValidation.valid) {
    return errorResponse('Período inválido', periodoValidation.error, 400);
  }
  
  const days = periodoValidation.days!;
  
  let connection;
  
  try {
    connection = await connectOracle();
    
    // Total de vendas e faturamento no período
    const salesQuery = `
      SELECT 
        COUNT(*) as total_vendas,
        COALESCE(SUM(valor_total), 0) as faturamento
      FROM vendas
      WHERE vendedor_id = :vendedor_id
        AND status = 'CONCLUIDA'
        AND data_venda >= CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
    `;
    
    const salesResult = await connection.execute(salesQuery, { vendedor_id: vendedorId });
    const salesData: any = salesResult.rows?.[0] || {};
    
    // Vendas nos últimos 7 dias
    const vendas7dQuery = `
      SELECT COALESCE(SUM(valor_total), 0) as vendas_7d
      FROM vendas
      WHERE vendedor_id = :vendedor_id
        AND status = 'CONCLUIDA'
        AND data_venda >= CURRENT_TIMESTAMP - INTERVAL '7' DAY
    `;
    
    const vendas7dResult = await connection.execute(vendas7dQuery, { vendedor_id: vendedorId });
    const vendas7dData: any = vendas7dResult.rows?.[0] || {};
    
    // Total de produtos
    const productsQuery = `
      SELECT COUNT(*) as total_produtos
      FROM produtos
      WHERE vendedor_id = :vendedor_id
        AND ativo = 'Y'
    `;
    
    const productsResult = await connection.execute(productsQuery, { vendedor_id: vendedorId });
    const productsData: any = productsResult.rows?.[0] || {};
    
    // Produtos com estoque baixo
    const lowStockQuery = `
      SELECT COUNT(*) as produtos_estoque_baixo
      FROM produtos
      WHERE vendedor_id = :vendedor_id
        AND ativo = 'Y'
        AND estoque < 10
    `;
    
    const lowStockResult = await connection.execute(lowStockQuery, { vendedor_id: vendedorId });
    const lowStockData: any = lowStockResult.rows?.[0] || {};
    
    const metrics = {
      total_vendas: salesData.TOTAL_VENDAS || 0,
      faturamento: salesData.FATURAMENTO || 0,
      vendas_7d: vendas7dData.VENDAS_7D || 0,
      total_produtos: productsData.TOTAL_PRODUTOS || 0,
      produtos_estoque_baixo: lowStockData.PRODUTOS_ESTOQUE_BAIXO || 0
    };
    
    return successResponse({ metrics });
    
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
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

