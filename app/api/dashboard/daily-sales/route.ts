import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { requireVendedor, successResponse, handleOracleError } from '@/lib/api-middleware';
const oracledb = require('oracledb');

/**
 * GET /api/dashboard/daily-sales
 * Retorna dados de vendas dos últimos 7 dias (por dia)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireVendedor();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { vendedorId } = authResult;
  
  let connection;
  
  try {
    connection = await connectOracle();
    
    // Buscar vendas dos últimos 7 dias agrupadas por dia
    const query = `
      SELECT 
        TRUNC(v.data_venda) as dia,
        COUNT(*) as qtd_vendas,
        SUM(v.valor_total) as receita,
        SUM(v.quantidade_itens) as qtd_itens
      FROM vendas v
      WHERE v.vendedor_id = :vendedor_id
        AND v.data_venda >= TRUNC(SYSDATE) - 6
        AND v.status = 'CONCLUIDA'
      GROUP BY TRUNC(v.data_venda)
      ORDER BY TRUNC(v.data_venda) ASC
    `;
    
    const result = await connection.execute(
      query,
      { vendedor_id: vendedorId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    // Criar array com todos os últimos 7 dias (mesmo se não tiver vendas)
    const dailySales = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Procurar dados para este dia
      const dayData = (result.rows || []).find((row: any) => {
        const dbDate = new Date(row.DIA);
        const dbDateStr = dbDate.toISOString().split('T')[0];
        return dbDateStr === dateStr;
      });
      
      dailySales.push({
        date: dateStr,
        day: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
        qtd_vendas: dayData ? (dayData as any).QTD_VENDAS : 0,
        receita: dayData ? (dayData as any).RECEITA : 0,
        qtd_itens: dayData ? (dayData as any).QTD_ITENS : 0
      });
    }
    
    return successResponse({ dailySales });
    
  } catch (error) {
    console.error('Error fetching daily sales:', error);
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

