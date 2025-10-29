import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import oracledb from 'oracledb';
import { 
  requireIndustria, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';
import { validatePeriodo } from '@/lib/validators';

/**
 * GET /api/industry/dashboard/metrics
 * Retorna métricas principais do dashboard da indústria
 * Query params: ?periodo=7d (7d, 30d, 90d, 1y)
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
    
    // Total de produtos cadastrados com a indústria (período atual)
    const productsQuery = `
      SELECT COUNT(*) as total_produtos
      FROM produtos
      WHERE industria_id = :industria_id
        AND ativo = 'Y'
    `;
    
    const productsResult = await connection.execute(productsQuery, { industria_id: industriaId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    const productsData: any = productsResult.rows?.[0] || {};
    
    // Total de produtos no período anterior
    const productsPrevQuery = `
      SELECT COUNT(*) as total_produtos
      FROM produtos
      WHERE industria_id = :industria_id
        AND ativo = 'Y'
        AND created_at < CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
    `;
    
    const productsPrevResult = await connection.execute(productsPrevQuery, { industria_id: industriaId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    const productsPrevData: any = productsPrevResult.rows?.[0] || {};
    
    // Total de vendedores ativos (período atual)
    const sellersQuery = `
      SELECT COUNT(DISTINCT p.vendedor_id) as total_vendedores
      FROM produtos p
      WHERE p.industria_id = :industria_id
        AND p.ativo = 'Y'
    `;
    
    const sellersResult = await connection.execute(sellersQuery, { industria_id: industriaId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    const sellersData: any = sellersResult.rows?.[0] || {};
    
    // Total de vendedores ativos no período anterior
    const sellersPrevQuery = `
      SELECT COUNT(DISTINCT p.vendedor_id) as total_vendedores
      FROM produtos p
      WHERE p.industria_id = :industria_id
        AND p.ativo = 'Y'
        AND p.created_at < CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
    `;
    
    const sellersPrevResult = await connection.execute(sellersPrevQuery, { industria_id: industriaId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    const sellersPrevData: any = sellersPrevResult.rows?.[0] || {};
    
    // Vendas e faturamento no período atual
    const salesQuery = `
      SELECT 
        COUNT(DISTINCT v.id) as total_vendas,
        COALESCE(SUM(iv.subtotal), 0) as receita_gerada
      FROM vendas v
      JOIN itens_venda iv ON v.id = iv.venda_id
      JOIN produtos p ON iv.produto_id = p.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
    `;
    
    const salesResult = await connection.execute(salesQuery, { industria_id: industriaId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    const salesData: any = salesResult.rows?.[0] || {};
    
    // Vendas e faturamento no período anterior
    const salesPrevQuery = `
      SELECT 
        COUNT(DISTINCT v.id) as total_vendas,
        COALESCE(SUM(iv.subtotal), 0) as receita_gerada
      FROM vendas v
      JOIN itens_venda iv ON v.id = iv.venda_id
      JOIN produtos p ON iv.produto_id = p.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${days * 2}' DAY
        AND v.data_venda < CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
    `;
    
    const salesPrevResult = await connection.execute(salesPrevQuery, { industria_id: industriaId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    const salesPrevData: any = salesPrevResult.rows?.[0] || {};
    
    // Produto mais vendido no período atual
    const topProductQuery = `
      SELECT 
        p.nome,
        SUM(iv.quantidade) as qtd_vendida
      FROM produtos p
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
      GROUP BY p.id, p.nome
      ORDER BY qtd_vendida DESC
      FETCH FIRST 1 ROWS ONLY
    `;
    
    const topProductResult = await connection.execute(topProductQuery, { industria_id: industriaId }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    const topProductData: any = topProductResult.rows?.[0] || {};
    
    // Calcular crescimento percentual
    const calcGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };
    
    const currentProducts = productsData.TOTAL_PRODUTOS || 0;
    const previousProducts = productsPrevData.TOTAL_PRODUTOS || 0;
    const currentSellers = sellersData.TOTAL_VENDEDORES || 0;
    const previousSellers = sellersPrevData.TOTAL_VENDEDORES || 0;
    const currentRevenue = salesData.RECEITA_GERADA || 0;
    const previousRevenue = salesPrevData.RECEITA_GERADA || 0;
    
    const metrics = {
      total_produtos: currentProducts,
      total_produtos_anterior: previousProducts,
      crescimento_produtos: calcGrowth(currentProducts, previousProducts),
      
      total_vendedores: currentSellers,
      total_vendedores_anterior: previousSellers,
      crescimento_vendedores: calcGrowth(currentSellers, previousSellers),
      
      total_vendas: salesData.TOTAL_VENDAS || 0,
      receita_gerada: currentRevenue,
      receita_gerada_anterior: previousRevenue,
      crescimento_receita: calcGrowth(currentRevenue, previousRevenue),
      
      produto_mais_vendido: topProductData.NOME || 'Nenhum',
      qtd_vendida_top: topProductData.QTD_VENDIDA || 0
    };
    
    return successResponse({ metrics });
    
  } catch (error) {
    console.error('Error fetching industry metrics:', error);
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

