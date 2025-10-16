import { NextRequest, NextResponse } from 'next/server';
import { connectOracle } from '@/lib/db';

const oracledb = require('oracledb');

export async function GET(request: NextRequest) {
  let connection;
  
  try {
    // TODO: Implementar autenticação
    // const user = await getCurrentUser();
    // if (!user || user.categoria !== 'industry') {
    //   return NextResponse.json({ success: false, message: 'Acesso negado' }, { status: 403 });
    // }

    // Conectar ao banco
    connection = await connectOracle();

    // TODO: Queries para analytics da indústria
    /*
    // 1. Summary/KPIs
    const summaryQuery = `
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        SUM(iv.valor_total) as total_revenue,
        COUNT(DISTINCT v.varejista) as active_retailers,
        COUNT(v.id) as total_sales
      FROM produtos p
      LEFT JOIN item_venda iv ON p.gtin = iv.gtin
      LEFT JOIN vendas v ON iv.id_venda = v.id
      WHERE p.industria_relacionada = :industria_id
        AND v.timestamp_venda >= SYSDATE - 30
    `;

    // 2. Vendas por dia (últimos 7 dias)
    const salesByDayQuery = `
      SELECT 
        TO_CHAR(v.timestamp_venda, 'MM/DD') as date,
        COUNT(v.id) as sales,
        SUM(iv.valor_total) as revenue
      FROM vendas v
      JOIN item_venda iv ON v.id = iv.id_venda
      JOIN produtos p ON iv.gtin = p.gtin
      WHERE p.industria_relacionada = :industria_id
        AND v.timestamp_venda >= SYSDATE - 7
      GROUP BY TO_CHAR(v.timestamp_venda, 'MM/DD')
      ORDER BY TO_CHAR(v.timestamp_venda, 'MM/DD')
    `;

    // 3. Top produtos
    const topProductsQuery = `
      SELECT 
        p.nome_produto as name,
        COUNT(iv.id) as sales,
        SUM(iv.valor_total) as revenue
      FROM produtos p
      JOIN item_venda iv ON p.gtin = iv.gtin
      JOIN vendas v ON iv.id_venda = v.id
      WHERE p.industria_relacionada = :industria_id
        AND v.timestamp_venda >= SYSDATE - 30
      GROUP BY p.nome_produto
      ORDER BY COUNT(iv.id) DESC
      ROWNUM <= 4
    `;

    // 4. Vendas por varejista
    const salesByRetailerQuery = `
      SELECT 
        u.nome as retailer,
        COUNT(v.id) as sales,
        SUM(iv.valor_total) as revenue
      FROM usuarios u
      JOIN vendas v ON u.id = v.varejista
      JOIN item_venda iv ON v.id = iv.id_venda
      JOIN produtos p ON iv.gtin = p.gtin
      WHERE p.industria_relacionada = :industria_id
        AND v.timestamp_venda >= SYSDATE - 30
        AND u.categoria = 'retailer'
      GROUP BY u.nome
      ORDER BY COUNT(v.id) DESC
      ROWNUM <= 4
    `;

    // Executar queries
    const summaryResult = await connection.execute(summaryQuery, { industria_id: user.id });
    const salesByDayResult = await connection.execute(salesByDayQuery, { industria_id: user.id });
    const topProductsResult = await connection.execute(topProductsQuery, { industria_id: user.id });
    const salesByRetailerResult = await connection.execute(salesByRetailerQuery, { industria_id: user.id });

    const data = {
      summary: {
        totalProducts: summaryResult.rows[0]?.TOTAL_PRODUCTS || 0,
        totalRevenue: summaryResult.rows[0]?.TOTAL_REVENUE || 0,
        activeRetailers: summaryResult.rows[0]?.ACTIVE_RETAILERS || 0,
        totalSales: summaryResult.rows[0]?.TOTAL_SALES || 0
      },
      salesByDay: salesByDayResult.rows.map(row => ({
        date: row.DATE,
        sales: row.SALES,
        revenue: row.REVENUE
      })),
      topProducts: topProductsResult.rows.map(row => ({
        name: row.NAME,
        sales: row.SALES,
        revenue: row.REVENUE
      })),
      salesByRetailer: salesByRetailerResult.rows.map(row => ({
        retailer: row.RETAILER,
        sales: row.SALES,
        revenue: row.REVENUE
      }))
    };
    */

    // Mock data para desenvolvimento
    const data = {
      summary: {
        totalProducts: 245,
        totalRevenue: 41789,
        activeRetailers: 32,
        totalSales: 1847
      },
      salesByDay: [
        { date: '10/10', sales: 120, revenue: 4500 },
        { date: '10/11', sales: 145, revenue: 5200 },
        { date: '10/12', sales: 98, revenue: 3800 },
        { date: '10/13', sales: 167, revenue: 6100 },
        { date: '10/14', sales: 134, revenue: 4900 },
        { date: '10/15', sales: 189, revenue: 7200 }
      ],
      topProducts: [
        { name: 'Widget Premium', sales: 234, revenue: 12500 },
        { name: 'Widget Standard', sales: 189, revenue: 8900 },
        { name: 'Widget Eco', sales: 145, revenue: 6700 },
        { name: 'Widget Pro', sales: 98, revenue: 5600 }
      ],
      salesByRetailer: [
        { retailer: 'SuperMercado ABC', sales: 89, revenue: 4200 },
        { retailer: 'Loja Premium', sales: 67, revenue: 3800 },
        { retailer: 'Rede Varejo', sales: 123, revenue: 5900 },
        { retailer: 'Mercado Central', sales: 45, revenue: 2100 }
      ]
    };

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar conexão:', err);
      }
    }
  }
}