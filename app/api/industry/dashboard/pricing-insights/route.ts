import { NextRequest, NextResponse } from 'next/server';
import { requireIndustria } from '@/lib/api-middleware';
import { connectOracle } from '@/lib/db';
import oracledb from 'oracledb';
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

    // Buscar sugestões de preço (produtos com baixa margem)
    const suggestions = await getPriceSuggestions(industriaId, {
      margem_maxima,
      margem_alvo,
      limit
    });

    // Buscar TODOS os produtos para calcular margem média geral
    const connection = await connectOracle();
    let margem_media_geral = 0;
    
    try {
      const allProductsQuery = `
        SELECT 
          p.preco_custo,
          p.preco_base
        FROM produtos p
        WHERE p.industria_id = :industria_id
          AND p.ativo = 'Y'
          AND p.preco_custo > 0
          AND p.preco_base > 0
      `;
      
      const allResult = await connection.execute(allProductsQuery, { industria_id: industriaId }, {
        outFormat: oracledb.OUT_FORMAT_OBJECT
      });
      
      if (allResult.rows && allResult.rows.length > 0) {
        const totalMargin = (allResult.rows as any[]).reduce((acc, row) => {
          const margin = ((row.PRECO_BASE - row.PRECO_CUSTO) / row.PRECO_CUSTO) * 100;
          return acc + margin;
        }, 0);
        
        margem_media_geral = totalMargin / allResult.rows.length;
      }
    } finally {
      await connection.close();
    }

    // Calcular estatísticas
    const total_produtos_baixa_margem = suggestions.length;

    return NextResponse.json({
      success: true,
      insights: {
        total_produtos_baixa_margem,
        margem_media_atual: Math.round(margem_media_geral * 100) / 100,
        margem_alvo,
        sugestoes: suggestions.map((row: any) => ({
          produto_id: row.PRODUTO_ID || row.produto_id,
          nome: row.NOME || row.nome,
          gtin: row.GTIN || row.gtin,
          vendedor: row.VENDEDOR || row.vendedor,
          preco_custo_atual: row.PRECO_CUSTO_ATUAL || row.preco_custo_atual,
          preco_base: row.PRECO_BASE || row.preco_base,
          margem_atual: row.MARGEM_ATUAL || row.margem_atual,
          preco_custo_sugerido: row.PRECO_CUSTO_SUGERIDO || row.preco_custo_sugerido,
          margem_alvo: row.MARGEM_ALVO || row.margem_alvo,
          reducao_necessaria: Math.round(((row.PRECO_CUSTO_ATUAL || row.preco_custo_atual) - (row.PRECO_CUSTO_SUGERIDO || row.preco_custo_sugerido)) * 100) / 100
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

