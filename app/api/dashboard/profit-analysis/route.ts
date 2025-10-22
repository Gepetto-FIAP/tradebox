import { NextRequest, NextResponse } from 'next/server';
import { requireVendedor } from '@/lib/api-middleware';
import { 
  getProfitableProducts, 
  getProfitAnalysisBySale, 
  getMarginByIndustry,
  getLowMarginProducts 
} from '@/lib/queries';

/**
 * GET /api/dashboard/profit-analysis
 * Retorna análises detalhadas de lucro e margem
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const authResult = await requireVendedor();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { vendedorId } = authResult;
    const { searchParams } = new URL(request.url);

    // Parâmetros opcionais
    const periodo_dias = parseInt(searchParams.get('periodo_dias') || '30', 10);
    const limit_produtos = parseInt(searchParams.get('limit_produtos') || '10', 10);
    const limit_vendas = parseInt(searchParams.get('limit_vendas') || '20', 10);
    const margem_minima = parseInt(searchParams.get('margem_minima') || '20', 10);

    // Buscar dados em paralelo
    const [
      profitableProducts,
      profitAnalysisBySale,
      marginByIndustry,
      lowMarginProducts
    ] = await Promise.all([
      getProfitableProducts(vendedorId, { periodo_dias, limit: limit_produtos }),
      getProfitAnalysisBySale(vendedorId, { periodo_dias, limit: limit_vendas }),
      getMarginByIndustry(vendedorId),
      getLowMarginProducts(vendedorId, { margem_minima, limit: 10 })
    ]);

    // Calcular métricas agregadas
    const totalLucro = profitableProducts.reduce((acc: number, row: any) => 
      acc + (row.LUCRO_TOTAL || 0), 0
    );

    const totalReceita = profitableProducts.reduce((acc: number, row: any) => 
      acc + (row.RECEITA_TOTAL || 0), 0
    );

    const margemGlobal = totalReceita > 0 
      ? Math.round((totalLucro / totalReceita * 100) * 100) / 100 
      : 0;

    return NextResponse.json({
      success: true,
      periodo_dias,
      resumo: {
        lucro_total: Math.round(totalLucro * 100) / 100,
        receita_total: Math.round(totalReceita * 100) / 100,
        margem_global: margemGlobal,
        produtos_baixa_margem: lowMarginProducts.length
      },
      produtos_lucrativos: profitableProducts.map((row: any) => ({
        produto_id: row.PRODUTO_ID,
        nome: row.NOME,
        gtin: row.GTIN,
        qtd_vendas: row.QTD_VENDAS,
        qtd_vendida: row.QTD_VENDIDA,
        receita_total: row.RECEITA_TOTAL,
        custo_total: row.CUSTO_TOTAL,
        lucro_total: row.LUCRO_TOTAL,
        margem_media: row.MARGEM_MEDIA
      })),
      analise_vendas: profitAnalysisBySale.map((row: any) => ({
        venda_id: row.VENDA_ID,
        data_venda: row.DATA_VENDA,
        receita_total: row.RECEITA_TOTAL,
        custo_total: row.CUSTO_TOTAL,
        lucro_total: row.LUCRO_TOTAL,
        margem_percentual: row.MARGEM_PERCENTUAL
      })),
      margem_por_industria: marginByIndustry.map((row: any) => ({
        industria: row.INDUSTRIA,
        qtd_produtos: row.QTD_PRODUTOS,
        margem_media: row.MARGEM_MEDIA,
        receita_gerada: row.RECEITA_GERADA,
        custo_total: row.CUSTO_TOTAL,
        lucro_total: row.LUCRO_TOTAL
      })),
      alertas_margem_baixa: lowMarginProducts.map((row: any) => ({
        produto_id: row.PRODUTO_ID,
        nome: row.NOME,
        preco_custo: row.PRECO_CUSTO,
        preco_base: row.PRECO_BASE,
        lucro_unitario: row.LUCRO_UNITARIO,
        margem_percentual: row.MARGEM_PERCENTUAL
      }))
    });

  } catch (error: any) {
    console.error('Erro ao buscar análise de lucro:', error);

    return NextResponse.json(
      { success: false, error: 'Erro ao buscar análise de lucro', message: error.message },
      { status: 500 }
    );
  }
}

