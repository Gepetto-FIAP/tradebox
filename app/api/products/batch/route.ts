import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireVendedor, 
  successResponse, 
  errorResponse 
} from '@/lib/api-middleware';

const oracledb = require('oracledb');

/**
 * POST /api/products/batch
 * Busca múltiplos produtos por GTIN em uma única requisição
 * Body: { gtins: string[] }
 */
export async function POST(request: NextRequest) {
  // Verificar se é vendedor
  const authResult = await requireVendedor();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { vendedorId } = authResult;
  
  let connection;
  
  try {
    const body = await request.json();
    const { gtins } = body;
    
    if (!gtins || !Array.isArray(gtins) || gtins.length === 0) {
      return errorResponse(
        'Dados inválidos',
        'É necessário fornecer um array de GTINs',
        400
      );
    }
    
    // Limitar a 100 GTINs por requisição
    if (gtins.length > 100) {
      return errorResponse(
        'Limite excedido',
        'Máximo de 100 GTINs por requisição',
        400
      );
    }
    
    connection = await connectOracle();
    
    // Construir query com placeholders dinâmicos
    const placeholders = gtins.map((_: any, i: number) => `:gtin${i}`).join(',');
    
    const query = `
      SELECT 
        p.id,
        p.vendedor_id,
        p.industria_id,
        p.categoria_id,
        p.gtin,
        p.nome,
        p.descricao,
        p.preco_base,
        p.preco_custo,
        p.estoque,
        p.ativo,
        p.created_at,
        p.updated_at,
        c.nome as categoria_nome,
        u.nome as industria_nome
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN usuarios u ON p.industria_id = u.id
      WHERE p.gtin IN (${placeholders})
        AND p.vendedor_id = :vendedor_id
        AND p.ativo = 'Y'
      ORDER BY p.gtin, p.created_at DESC
    `;
    
    // Criar objeto de binds
    const binds: any = { vendedor_id: vendedorId };
    gtins.forEach((gtin: string, i: number) => {
      binds[`gtin${i}`] = gtin.trim();
    });
    
    const result = await connection.execute(
      query, 
      binds,
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    // Agrupar produtos por GTIN
    const results: { [key: string]: any[] } = {};
    const foundGtins = new Set<string>();
    
    if (result.rows && result.rows.length > 0) {
      (result.rows as any[]).forEach((row: any) => {
        const product = {
          id: row.ID,
          vendedor_id: row.VENDEDOR_ID,
          industria_id: row.INDUSTRIA_ID,
          categoria_id: row.CATEGORIA_ID,
          gtin: row.GTIN,
          nome: row.NOME,
          descricao: row.DESCRICAO,
          preco_base: row.PRECO_BASE,
          preco_custo: row.PRECO_CUSTO,
          estoque: row.ESTOQUE,
          ativo: row.ATIVO,
          created_at: row.CREATED_AT,
          updated_at: row.UPDATED_AT,
          categoria_nome: row.CATEGORIA_NOME,
          industria_nome: row.INDUSTRIA_NOME
        };
        
        if (!results[product.gtin]) {
          results[product.gtin] = [];
        }
        results[product.gtin].push(product);
        foundGtins.add(product.gtin);
      });
    }
    
    // Identificar GTINs não encontrados
    const notFound = gtins.filter((gtin: string) => !foundGtins.has(gtin.trim()));
    
    return successResponse({
      results,
      not_found: notFound,
      summary: {
        total_requested: gtins.length,
        found: foundGtins.size,
        not_found: notFound.length
      }
    });
    
  } catch (error: any) {
    console.error('Erro ao buscar produtos em lote:', error);
    return errorResponse(
      'Erro interno',
      'Erro ao buscar produtos',
      500
    );
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Erro ao fechar conexão:', error);
      }
    }
  }
}

