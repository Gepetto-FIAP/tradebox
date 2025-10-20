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
 * GET /api/dashboard/analytics
 * Retorna dados completos para analytics dashboard
 * Query params: ?periodo=30d
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
    
    // 1. Performance mensal (últimos 12 meses)
    const monthlyQuery = `
      SELECT 
        TO_CHAR(data_venda, 'YYYY-MM') as mes,
        COUNT(*) as qtd_pedidos,
        SUM(valor_total) as receita
      FROM vendas
      WHERE vendedor_id = :vendedor_id
        AND status = 'CONCLUIDA'
        AND data_venda >= ADD_MONTHS(CURRENT_TIMESTAMP, -12)
      GROUP BY TO_CHAR(data_venda, 'YYYY-MM')
      ORDER BY mes
    `;
    
    const monthlyResult = await connection.execute(monthlyQuery, { vendedor_id: vendedorId });
    
    const monthlyPerformance = (monthlyResult.rows || []).map((row: any) => ({
      mes: row.MES,
      qtd_pedidos: row.QTD_PEDIDOS,
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
      WHERE v.vendedor_id = :vendedor_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
      GROUP BY c.id, c.nome
      ORDER BY valor_vendas DESC
    `;
    
    const categoryResult = await connection.execute(categoryQuery, { vendedor_id: vendedorId });
    
    const salesByCategory = (categoryResult.rows || []).map((row: any) => ({
      categoria: row.CATEGORIA,
      qtd_vendas: row.QTD_VENDAS,
      valor_vendas: row.VALOR_VENDAS
    }));
    
    // 3. Top 5 produtos por receita
    const topProductsQuery = `
      SELECT 
        p.id as produto_id,
        p.nome,
        SUM(iv.quantidade) as qtd_vendida,
        SUM(iv.subtotal) as receita
      FROM produtos p
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE v.vendedor_id = :vendedor_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
      GROUP BY p.id, p.nome
      ORDER BY receita DESC
      FETCH FIRST 5 ROWS ONLY
    `;
    
    const topProductsResult = await connection.execute(topProductsQuery, { vendedor_id: vendedorId });
    
    const topProducts = (topProductsResult.rows || []).map((row: any) => ({
      produto_id: row.PRODUTO_ID,
      nome: row.NOME,
      qtd_vendida: row.QTD_VENDIDA,
      receita: row.RECEITA
    }));
    
    // 4. Top parceiros de indústria
    const industryQuery = `
      SELECT 
        u.id as industria_id,
        u.nome as industria,
        COUNT(DISTINCT p.id) as qtd_produtos,
        COUNT(DISTINCT v.id) as qtd_vendas,
        COALESCE(SUM(iv.subtotal), 0) as receita_gerada
      FROM usuarios u
      JOIN produtos p ON u.id = p.industria_id
      LEFT JOIN itens_venda iv ON p.id = iv.produto_id
      LEFT JOIN vendas v ON iv.venda_id = v.id AND v.status = 'CONCLUIDA'
      WHERE p.vendedor_id = :vendedor_id
        AND u.categoria = 'INDUSTRIA'
      GROUP BY u.id, u.nome
      ORDER BY receita_gerada DESC
      FETCH FIRST 5 ROWS ONLY
    `;
    
    const industryResult = await connection.execute(industryQuery, { vendedor_id: vendedorId });
    
    const industryPartners = (industryResult.rows || []).map((row: any) => ({
      industria_id: row.INDUSTRIA_ID,
      industria: row.INDUSTRIA,
      qtd_produtos: row.QTD_PRODUTOS,
      qtd_vendas: row.QTD_VENDAS,
      receita_gerada: row.RECEITA_GERADA
    }));
    
    return successResponse({
      monthlyPerformance,
      salesByCategory,
      topProducts,
      industryPartners
    });
    
  } catch (error) {
    console.error('Error fetching analytics data:', error);
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

