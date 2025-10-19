import { NextRequest, NextResponse } from 'next/server';
import { requireIndustria } from '@/lib/api-middleware';
import { getLowMarginProducts, getPriceSuggestions } from '@/lib/queries';

/**
 * GET /api/industry/dashboard/pricing-insights
 * Retorna insights de preços e sugestões de ajustes
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e autorização
    const authResult = await requireIndustria();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { industriaId } = authResult;
    const { searchParams } = new URL(request.url);

    // Parâmetros opcionais
    const margem_maxima = parseInt(searchParams.get('margem_maxima') || '15', 10);
    const margem_alvo = parseInt(searchParams.get('margem_alvo') || '25', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Buscar sugestões de preço
    const suggestions = await getPriceSuggestions(industriaId, {
      margem_maxima,
      margem_alvo,
      limit
    });

    // Calcular estatísticas
    const total_produtos_baixa_margem = suggestions.length;
    const margem_media_atual = suggestions.length > 0
      ? suggestions.reduce((acc: number, row: any) => acc + (row.MARGEM_ATUAL || 0), 0) / suggestions.length
      : 0;

    return NextResponse.json({
      success: true,
      insights: {
        total_produtos_baixa_margem,
        margem_media_atual: Math.round(margem_media_atual * 100) / 100,
        margem_alvo,
        sugestoes: suggestions.map((row: any) => ({
          produto_id: row.PRODUTO_ID,
          nome: row.NOME,
          gtin: row.GTIN,
          vendedor: row.VENDEDOR,
          preco_custo_atual: row.PRECO_CUSTO_ATUAL,
          preco_base: row.PRECO_BASE,
          margem_atual: row.MARGEM_ATUAL,
          preco_custo_sugerido: row.PRECO_CUSTO_SUGERIDO,
          margem_alvo: row.MARGEM_ALVO,
          reducao_necessaria: Math.round((row.PRECO_CUSTO_ATUAL - row.PRECO_CUSTO_SUGERIDO) * 100) / 100
        }))
      }
    });

  } catch (error: any) {
    console.error('Erro ao buscar pricing insights:', error);

    return NextResponse.json(
      { success: false, error: 'Erro ao buscar insights de preços', message: error.message },
      { status: 500 }
    );
  }
}

