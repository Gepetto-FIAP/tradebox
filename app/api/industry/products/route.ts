import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireIndustria, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';
import { validatePagination } from '@/lib/validators';

/**
 * GET /api/industry/products
 * Lista produtos associados à indústria
 * Query params: ?search=termo&categoria_id=1&page=1&limit=20
 */
export async function GET(request: NextRequest) {
  // Verificar se é indústria
  const authResult = await requireIndustria();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { industriaId } = authResult;
  const { searchParams } = new URL(request.url);
  
  const search = searchParams.get('search') || undefined;
  const categoria_id = searchParams.get('categoria_id') 
    ? parseInt(searchParams.get('categoria_id')!) 
    : undefined;
  const { page, limit } = validatePagination(
    searchParams.get('page') || undefined,
    searchParams.get('limit') || undefined
  );
  
  let connection;
  
  try {
    connection = await connectOracle();
    
    const offset = (page - 1) * limit;
    
    // Construir query
    let query = `
      SELECT 
        p.id,
        p.vendedor_id,
        p.industria_id,
        p.categoria_id,
        p.gtin,
        p.nome,
        p.descricao,
        p.preco_base,
        p.estoque,
        p.ativo,
        p.created_at,
        p.updated_at,
        c.nome as categoria_nome,
        u.nome as vendedor_nome,
        COUNT(DISTINCT v.id) as qtd_vendas
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN usuarios u ON p.vendedor_id = u.id
      LEFT JOIN itens_venda iv ON p.id = iv.produto_id
      LEFT JOIN vendas v ON iv.venda_id = v.id AND v.status = 'CONCLUIDA'
      WHERE p.industria_id = :industria_id
        AND p.ativo = 'Y'
    `;
    
    const binds: any = { industria_id: industriaId };
    
    // Adicionar filtro de busca
    if (search) {
      query += ` AND (UPPER(p.nome) LIKE :search OR p.gtin LIKE :search_gtin)`;
      binds.search = `%${search.toUpperCase()}%`;
      binds.search_gtin = `%${search}%`;
    }
    
    // Adicionar filtro de categoria
    if (categoria_id) {
      query += ` AND p.categoria_id = :categoria_id`;
      binds.categoria_id = categoria_id;
    }
    
    query += ` 
      GROUP BY p.id, p.vendedor_id, p.industria_id, p.categoria_id, p.gtin, 
               p.nome, p.descricao, p.preco_base, p.estoque, p.ativo, 
               p.created_at, p.updated_at, c.nome, u.nome
      ORDER BY p.created_at DESC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;
    binds.offset = offset;
    binds.limit = limit;
    
    const result = await connection.execute(query, binds);
    
    // Query para contar total
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM produtos p
      WHERE p.industria_id = :industria_id
        AND p.ativo = 'Y'
    `;
    
    if (search) {
      countQuery += ` AND (UPPER(p.nome) LIKE :search OR p.gtin LIKE :search_gtin)`;
    }
    
    if (categoria_id) {
      countQuery += ` AND p.categoria_id = :categoria_id`;
    }
    
    const countResult = await connection.execute(countQuery, binds);
    const total = (countResult.rows?.[0] as any)?.TOTAL || 0;
    
    // Converter rows para formato esperado
    const products = (result.rows || []).map((row: any) => ({
      id: row.ID,
      vendedor_id: row.VENDEDOR_ID,
      industria_id: row.INDUSTRIA_ID,
      categoria_id: row.CATEGORIA_ID,
      gtin: row.GTIN,
      nome: row.NOME,
      descricao: row.DESCRICAO,
      preco_base: row.PRECO_BASE,
      estoque: row.ESTOQUE,
      ativo: row.ATIVO,
      created_at: row.CREATED_AT,
      updated_at: row.UPDATED_AT,
      categoria_nome: row.CATEGORIA_NOME,
      vendedor_nome: row.VENDEDOR_NOME,
      qtd_vendas: row.QTD_VENDAS
    }));
    
    return successResponse({ products, total, page, limit });
    
  } catch (error) {
    console.error('Error fetching products:', error);
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

