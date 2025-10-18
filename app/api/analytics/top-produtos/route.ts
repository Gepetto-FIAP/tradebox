import { NextResponse } from 'next/server';
import { connectOracle, isDatabaseConfigured } from '@/lib/db';
import { getTopProdutos } from '@/lib/mockAnalytics';

export async function GET(request: Request) {
  try {
    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const limite = parseInt(searchParams.get('limite') || '5');
    const periodo = searchParams.get('periodo') || '30d'; // 7d, 30d, 90d
    
    // Calcular número de dias baseado no período
    const dias = periodo === '7d' ? 7 : periodo === '90d' ? 90 : 30;
    
    // Verificar se o banco está configurado
    if (isDatabaseConfigured()) {
      console.log(`🔗 Buscando top ${limite} produtos do banco (${dias} dias)...`);
      
      const connection = await connectOracle();
      
      // Query para top produtos
      const topProdutosQuery = `
        SELECT 
          p.id_produto,
          p.nome_produto,
          p.gtin,
          SUM(iv.quantidade) as quantidade_vendida,
          SUM(iv.valor * iv.quantidade) as receita_total
        FROM produtos p
        INNER JOIN item_venda iv ON p.id_produto = iv.id_produto
        INNER JOIN vendas v ON iv.id_venda = v.id_venda
        WHERE v.data_venda >= CURRENT_DATE - INTERVAL '${dias}' DAY
        GROUP BY p.id_produto, p.nome_produto, p.gtin
        ORDER BY quantidade_vendida DESC
        LIMIT ${limite}
      `;

      const result = await connection.execute(topProdutosQuery);
      
      if (result.rows && result.rows.length > 0) {
        const topProdutos = result.rows.map((row: any) => ({
          id_produto: Number(row[0]),
          nome_produto: row[1],
          gtin: row[2],
          quantidade_vendida: Number(row[3] || 0),
          receita_total: Number(row[4] || 0)
        }));

        console.log(`✅ Top produtos obtidos do banco (${topProdutos.length} produtos)`);
        await connection.close();
        return NextResponse.json(topProdutos);
      }
      
      await connection.close();
    }

    // Fallback para dados mock
    console.log(`🎭 Usando dados mock para top ${limite} produtos`);
    const mockTopProdutos = getTopProdutos();
    
    // Aplicar limite aos dados mock
    const produtosLimitados = mockTopProdutos.slice(0, limite);
    
    return NextResponse.json(produtosLimitados, {
      headers: {
        'X-Data-Source': 'mock',
        'X-Limit': limite.toString(),
        'X-Period': periodo
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar top produtos:', error);
    
    // Em caso de erro, sempre retorna dados mock
    const mockTopProdutos = getTopProdutos();
    
    return NextResponse.json(mockTopProdutos.slice(0, 5), {
      status: 200,
      headers: {
        'X-Data-Source': 'mock-fallback'
      }
    });
  }
}

// Endpoint específico para Oracle
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const limite = body.limite || 5;
    const periodo = body.periodo || '30d';
    const dias = periodo === '7d' ? 7 : periodo === '90d' ? 90 : 30;
    
    if (isDatabaseConfigured()) {
      console.log(`🔗 Buscando top produtos Oracle (${limite} produtos, ${dias} dias)...`);
      
      const connection = await connectOracle();
      
      // Query específica para Oracle (sem LIMIT, usar ROWNUM)
      const topProdutosQueryOracle = `
        SELECT * FROM (
          SELECT 
            p.id_produto,
            p.nome_produto,
            p.gtin,
            SUM(iv.quantidade) as quantidade_vendida,
            SUM(iv.valor * iv.quantidade) as receita_total
          FROM produtos p
          INNER JOIN item_venda iv ON p.id_produto = iv.id_produto
          INNER JOIN vendas v ON iv.id_venda = v.id_venda
          WHERE v.data_venda >= SYSDATE - ${dias}
          GROUP BY p.id_produto, p.nome_produto, p.gtin
          ORDER BY SUM(iv.quantidade) DESC
        )
        WHERE ROWNUM <= ${limite}
      `;

      const result = await connection.execute(topProdutosQueryOracle);
      
      if (result.rows && result.rows.length > 0) {
        const topProdutos = result.rows.map((row: any) => ({
          id_produto: Number(row[0]),
          nome_produto: row[1],
          gtin: row[2],
          quantidade_vendida: Number(row[3] || 0),
          receita_total: Number(row[4] || 0)
        }));

        await connection.close();
        return NextResponse.json(topProdutos);
      }
      
      await connection.close();
    }

    // Fallback
    const mockTopProdutos = getTopProdutos();
    return NextResponse.json(mockTopProdutos.slice(0, limite));
    
  } catch (error) {
    console.error('❌ Erro Oracle top produtos:', error);
    const mockTopProdutos = getTopProdutos();
    return NextResponse.json(mockTopProdutos.slice(0, 5), { status: 200 });
  }
}

// Endpoint para buscar detalhes de um produto específico
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const idProduto = body.id_produto;
    
    if (!idProduto) {
      return NextResponse.json({ error: 'ID do produto é obrigatório' }, { status: 400 });
    }
    
    if (isDatabaseConfigured()) {
      console.log(`🔗 Buscando detalhes do produto ${idProduto}...`);
      
      const connection = await connectOracle();
      
      const produtoQuery = `
        SELECT 
          p.id_produto,
          p.nome_produto,
          p.gtin,
          p.valor,
          SUM(iv.quantidade) as quantidade_total_vendida,
          SUM(iv.valor * iv.quantidade) as receita_total,
          COUNT(DISTINCT v.id_venda) as numero_vendas
        FROM produtos p
        LEFT JOIN item_venda iv ON p.id_produto = iv.id_produto
        LEFT JOIN vendas v ON iv.id_venda = v.id_venda
        WHERE p.id_produto = :id_produto
        GROUP BY p.id_produto, p.nome_produto, p.gtin, p.valor
      `;

      const result = await connection.execute(produtoQuery, [idProduto]);
      
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0] as any;
        const produtoDetalhes = {
          id_produto: Number(row[0]),
          nome_produto: row[1],
          gtin: row[2],
          valor: Number(row[3]),
          quantidade_total_vendida: Number(row[4] || 0),
          receita_total: Number(row[5] || 0),
          numero_vendas: Number(row[6] || 0)
        };

        await connection.close();
        return NextResponse.json(produtoDetalhes);
      }
      
      await connection.close();
    }

    // Fallback para mock
    const mockTopProdutos = getTopProdutos();
    const produto = mockTopProdutos.find(p => p.id_produto === idProduto);
    
    if (produto) {
      return NextResponse.json(produto);
    } else {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }
    
  } catch (error) {
    console.error('❌ Erro ao buscar detalhes do produto:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}