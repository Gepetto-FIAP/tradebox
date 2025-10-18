import { NextResponse } from 'next/server';
import { connectOracle, isDatabaseConfigured } from '@/lib/db';
import { getAnalyticsMetrics } from '@/lib/mockAnalytics';

export async function GET() {
  try {
    // Verificar se o banco está configurado
    if (isDatabaseConfigured()) {
      console.log('🔗 Buscando métricas do banco de dados...');
      
      const connection = await connectOracle();
      
      // Query para métricas principais
      const metricsQuery = `
        WITH vendas_stats AS (
          SELECT 
            COUNT(*) as total_vendas,
            SUM(total_venda) as receita_total,
            AVG(total_venda) as ticket_medio,
            COUNT(DISTINCT id_usuario) as clientes_unicos
          FROM vendas 
          WHERE data_venda >= CURRENT_DATE - INTERVAL '30' DAY
        ),
        produtos_vendidos AS (
          SELECT SUM(quantidade) as produtos_vendidos
          FROM item_venda iv
          JOIN vendas v ON iv.id_venda = v.id_venda
          WHERE v.data_venda >= CURRENT_DATE - INTERVAL '30' DAY
        ),
        crescimento AS (
          SELECT 
            COALESCE(
              ((SUM(CASE WHEN data_venda >= CURRENT_DATE - INTERVAL '7' DAY THEN total_venda ELSE 0 END) - 
                SUM(CASE WHEN data_venda >= CURRENT_DATE - INTERVAL '14' DAY 
                         AND data_venda < CURRENT_DATE - INTERVAL '7' DAY THEN total_venda ELSE 0 END)) /
               NULLIF(SUM(CASE WHEN data_venda >= CURRENT_DATE - INTERVAL '14' DAY 
                              AND data_venda < CURRENT_DATE - INTERVAL '7' DAY THEN total_venda ELSE 0 END), 0) * 100), 0
            ) as crescimento_percentual
          FROM vendas
          WHERE data_venda >= CURRENT_DATE - INTERVAL '14' DAY
        )
        SELECT 
          vs.total_vendas,
          vs.receita_total,
          vs.ticket_medio,
          vs.clientes_unicos,
          pv.produtos_vendidos,
          ROUND(c.crescimento_percentual, 1) as crescimento_percentual
        FROM vendas_stats vs
        CROSS JOIN produtos_vendidos pv
        CROSS JOIN crescimento c
      `;

      const result = await connection.execute(metricsQuery);
      const row = result.rows?.[0] as any;
      
      if (row) {
        const metrics = {
          total_vendas: Number(row[0] || 0),
          receita_total: Number(row[1] || 0),
          ticket_medio: Number(row[2] || 0),
          clientes_unicos: Number(row[3] || 0),
          produtos_vendidos: Number(row[4] || 0),
          crescimento_percentual: Number(row[5] || 0)
        };

        console.log('✅ Métricas obtidas do banco:', metrics);
        await connection.close();
        return NextResponse.json(metrics);
      }
      
      await connection.close();
    }

    // Fallback para dados mock
    console.log('🎭 Usando dados mock para métricas');
    const mockMetrics = getAnalyticsMetrics();
    
    return NextResponse.json(mockMetrics, {
      headers: {
        'X-Data-Source': 'mock'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar métricas:', error);
    
    // Em caso de erro, sempre retorna dados mock
    const mockMetrics = getAnalyticsMetrics();
    
    return NextResponse.json(mockMetrics, {
      status: 200, // Não falha, retorna mock
      headers: {
        'X-Data-Source': 'mock-fallback'
      }
    });
  }
}

// Endpoint para forçar uso de dados mock (útil para desenvolvimento)
export async function POST() {
  try {
    console.log('🎭 Retornando dados mock (forçado)');
    const mockMetrics = getAnalyticsMetrics();
    
    return NextResponse.json(mockMetrics, {
      headers: {
        'X-Data-Source': 'mock-forced'
      }
    });
  } catch (error) {
    console.error('❌ Erro ao retornar dados mock:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}