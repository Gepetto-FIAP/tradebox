import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireIndustria, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';
import { validatePeriodo } from '@/lib/validators';

/**
 * GET /api/industry/dashboard/analytics
 * Retorna dados completos de analytics para indústria
 * Query params: ?periodo=30d
 */
export async function GET(request: NextRequest) {
  // Verificar se é indústria
  const authResult = await requireIndustria();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { industriaId } = authResult;
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
    
    // 1. Performance mensal (últimos 12 meses)
    const monthlyQuery = `
      SELECT 
        TO_CHAR(v.data_venda, 'YYYY-MM') as mes,
        COUNT(DISTINCT v.id) as qtd_vendas,
        SUM(iv.subtotal) as receita
      FROM vendas v
      JOIN itens_venda iv ON v.id = iv.venda_id
      JOIN produtos p ON iv.produto_id = p.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= ADD_MONTHS(CURRENT_TIMESTAMP, -12)
      GROUP BY TO_CHAR(v.data_venda, 'YYYY-MM')
      ORDER BY mes
    `;
    
    const monthlyResult = await connection.execute(monthlyQuery, { industria_id: industriaId });
    
    const monthlyPerformance = (monthlyResult.rows || []).map((row: any) => ({
      mes: row.MES,
      qtd_vendas: row.QTD_VENDAS,
      receita: row.RECEITA
    }));
    
    // 2. Vendas por categoria
    const categoryQuery = `
      SELECT 
        c.nome as categoria,
        COUNT(DISTINCT v.id) as qtd_vendas,
        SUM(iv.subtotal) as valor_vendas
      FROM categorias c
      JOIN produtos p ON c.id = p.categoria_id
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
      GROUP BY c.id, c.nome
      ORDER BY valor_vendas DESC
    `;
    
    const categoryResult = await connection.execute(categoryQuery, { industria_id: industriaId });
    
    const salesByCategory = (categoryResult.rows || []).map((row: any) => ({
      categoria: row.CATEGORIA,
      qtd_vendas: row.QTD_VENDAS,
      valor_vendas: row.VALOR_VENDAS
    }));
    
    // 3. Distribuição de vendedores
    const distributionQuery = `
      SELECT 
        COUNT(DISTINCT p.vendedor_id) as qtd_vendedores,
        COUNT(DISTINCT v.id) as qtd_vendas,
        SUM(iv.subtotal) as receita
      FROM produtos p
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
    `;
    
    const distributionResult = await connection.execute(distributionQuery, { industria_id: industriaId });
    const distribution: any = distributionResult.rows?.[0] || {};
    
    // 4. Top vendedores (últimos 30 dias)
    const topSellersQuery = `
      SELECT 
        u.nome as vendedor,
        SUM(iv.subtotal) as receita
      FROM usuarios u
      JOIN produtos p ON u.id = p.vendedor_id
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '30' DAY
      GROUP BY u.id, u.nome
      ORDER BY receita DESC
      FETCH FIRST 5 ROWS ONLY
    `;
    
    const topSellersResult = await connection.execute(topSellersQuery, { industria_id: industriaId });
    
    const topSellers = (topSellersResult.rows || []).map((row: any) => ({
      vendedor: row.VENDEDOR,
      receita: row.RECEITA
    }));
    
    return successResponse({
      monthlyPerformance,
      salesByCategory,
      distribution: {
        qtd_vendedores: distribution.QTD_VENDEDORES || 0,
        qtd_vendas: distribution.QTD_VENDAS || 0,
        receita: distribution.RECEITA || 0
      },
      topSellers
    });
    
  } catch (error) {
    console.error('Error fetching industry analytics:', error);
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

