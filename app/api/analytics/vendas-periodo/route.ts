import { NextResponse } from 'next/server';
import { connectOracle, isDatabaseConfigured } from '@/lib/db';
import { getVendasPorPeriodo } from '@/lib/mockAnalytics';

export async function GET(request: Request) {
  try {
    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get('periodo') || '7d'; // 7d, 30d, 90d
    
    // Calcular número de dias baseado no período
    const dias = periodo === '30d' ? 30 : periodo === '90d' ? 90 : 7;
    
    // Verificar se o banco está configurado
    if (isDatabaseConfigured()) {
      console.log(`🔗 Buscando vendas por período do banco (${dias} dias)...`);
      
      const connection = await connectOracle();
      
      // Query para vendas por período
      const vendasQuery = `
        SELECT 
          TO_CHAR(data_venda, 'DD/MM') as periodo,
          COUNT(*) as vendas,
          COALESCE(SUM(total_venda), 0) as receita
        FROM vendas 
        WHERE data_venda >= CURRENT_DATE - INTERVAL '${dias}' DAY
        GROUP BY TO_CHAR(data_venda, 'DD/MM'), DATE(data_venda)
        ORDER BY DATE(data_venda)
      `;

      const result = await connection.execute(vendasQuery);
      
      if (result.rows && result.rows.length > 0) {
        const vendasPeriodo = result.rows.map((row: any) => ({
          periodo: row[0],
          vendas: Number(row[1] || 0),
          receita: Number(row[2] || 0)
        }));

        console.log(`✅ Vendas por período obtidas do banco (${vendasPeriodo.length} registros)`);
        await connection.close();
        return NextResponse.json(vendasPeriodo);
      }
      
      await connection.close();
    }

    // Fallback para dados mock
    console.log('🎭 Usando dados mock para vendas por período');
    const mockVendas = getVendasPorPeriodo();
    
    // Ajustar dados mock baseado no período solicitado
    let vendasAjustadas = mockVendas;
    if (periodo === '30d') {
      // Gerar mais dados para 30 dias
      vendasAjustadas = Array.from({ length: 30 }, (_, i) => {
        const data = new Date();
        data.setDate(data.getDate() - (29 - i));
        return {
          periodo: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          vendas: Math.floor(Math.random() * 15) + 1,
          receita: Math.floor(Math.random() * 3000) + 500
        };
      });
    } else if (periodo === '90d') {
      // Gerar dados semanais para 90 dias
      vendasAjustadas = Array.from({ length: 13 }, (_, i) => {
        const data = new Date();
        data.setDate(data.getDate() - (12 - i) * 7);
        return {
          periodo: `Sem ${i + 1}`,
          vendas: Math.floor(Math.random() * 50) + 10,
          receita: Math.floor(Math.random() * 10000) + 2000
        };
      });
    }
    
    return NextResponse.json(vendasAjustadas, {
      headers: {
        'X-Data-Source': 'mock',
        'X-Period': periodo
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar vendas por período:', error);
    
    // Em caso de erro, sempre retorna dados mock
    const mockVendas = getVendasPorPeriodo();
    
    return NextResponse.json(mockVendas, {
      status: 200,
      headers: {
        'X-Data-Source': 'mock-fallback'
      }
    });
  }
}

// Endpoint específico para Oracle (diferente sintaxe de datas)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const periodo = body.periodo || '7d';
    const dias = periodo === '30d' ? 30 : periodo === '90d' ? 90 : 7;
    
    if (isDatabaseConfigured()) {
      console.log(`🔗 Buscando vendas Oracle com sintaxe específica (${dias} dias)...`);
      
      const connection = await connectOracle();
      
      // Query específica para Oracle
      const vendasQueryOracle = `
        SELECT 
          TO_CHAR(data_venda, 'DD/MM') as periodo,
          COUNT(*) as vendas,
          NVL(SUM(total_venda), 0) as receita
        FROM vendas 
        WHERE data_venda >= SYSDATE - ${dias}
        GROUP BY TO_CHAR(data_venda, 'DD/MM'), TRUNC(data_venda)
        ORDER BY TRUNC(data_venda)
      `;

      const result = await connection.execute(vendasQueryOracle);
      
      if (result.rows && result.rows.length > 0) {
        const vendasPeriodo = result.rows.map((row: any) => ({
          periodo: row[0],
          vendas: Number(row[1] || 0),
          receita: Number(row[2] || 0)
        }));

        await connection.close();
        return NextResponse.json(vendasPeriodo);
      }
      
      await connection.close();
    }

    // Fallback
    const mockVendas = getVendasPorPeriodo();
    return NextResponse.json(mockVendas);
    
  } catch (error) {
    console.error('❌ Erro Oracle vendas por período:', error);
    const mockVendas = getVendasPorPeriodo();
    return NextResponse.json(mockVendas, { status: 200 });
  }
}