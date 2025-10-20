import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireVendedor, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';
import { validateProductData, validatePagination } from '@/lib/validators';

/**
 * GET /api/products
 * Lista produtos do vendedor com filtros opcionais
 * Query params: ?search=termo&categoria_id=1&page=1&limit=20&ativo=Y
 */
export async function GET(request: NextRequest) {
  // Verificar se é vendedor
  const authResult = await requireVendedor();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { vendedorId } = authResult;
  const { searchParams } = new URL(request.url);
  
  const search = searchParams.get('search') || undefined;
  const categoria_id = searchParams.get('categoria_id') 
    ? parseInt(searchParams.get('categoria_id')!) 
    : undefined;
  const ativo = (searchParams.get('ativo') || 'Y') as 'Y' | 'N';
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
        u.nome as industria_nome
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN usuarios u ON p.industria_id = u.id
      WHERE p.vendedor_id = :vendedor_id
        AND p.ativo = :ativo
    `;
    
    const binds: any = { vendedor_id: vendedorId, ativo };
    
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
    
    query += ` ORDER BY p.created_at DESC`;
    
    // Adicionar paginação
    query += ` OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`;
    binds.offset = offset;
    binds.limit = limit;
    
    const result = await connection.execute(query, binds);
    
    // Query para contar total
    let countQuery = `
      SELECT COUNT(*) as total
      FROM produtos p
      WHERE p.vendedor_id = :vendedor_id
        AND p.ativo = :ativo
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
      industria_nome: row.INDUSTRIA_NOME
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

/**
 * POST /api/products
 * Cria um novo produto
 * Body: { gtin, nome, descricao?, preco_base, estoque?, categoria_id?, industria_id? }
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
    
    // Validar dados
    const validation = validateProductData(body);
    if (!validation.valid) {
      return errorResponse('Dados inválidos', validation.error, 400);
    }
    
    const { 
      gtin, 
      nome, 
      descricao, 
      preco_base, 
      estoque = 0, 
      categoria_id, 
      industria_id 
    } = body;
    
    connection = await connectOracle();
    
    // Verificar se GTIN já existe para este vendedor
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM produtos
      WHERE vendedor_id = :vendedor_id AND gtin = :gtin
    `;
    
    const checkResult = await connection.execute(checkQuery, {
      vendedor_id: vendedorId,
      gtin
    });
    
    const count = (checkResult.rows?.[0] as any)?.COUNT || 0;
    if (count > 0) {
      return errorResponse(
        'GTIN duplicado',
        'Você já possui um produto cadastrado com este código de barras',
        400
      );
    }
    
    // Se industria_id fornecida, verificar se é INDUSTRIA
    if (industria_id) {
      const checkIndustryQuery = `
        SELECT COUNT(*) as count
        FROM usuarios
        WHERE id = :industria_id AND categoria = 'INDUSTRIA' AND ativo = 'Y'
      `;
      
      const industryResult = await connection.execute(checkIndustryQuery, {
        industria_id
      });
      
      const industryCount = (industryResult.rows?.[0] as any)?.COUNT || 0;
      if (industryCount === 0) {
        return errorResponse(
          'Indústria inválida',
          'A indústria selecionada não existe ou não está ativa',
          400
        );
      }
    }
    
    // Inserir produto
    const insertQuery = `
      INSERT INTO produtos (
        vendedor_id,
        industria_id,
        categoria_id,
        gtin,
        nome,
        descricao,
        preco_base,
        estoque,
        ativo
      ) VALUES (
        :vendedor_id,
        :industria_id,
        :categoria_id,
        :gtin,
        :nome,
        :descricao,
        :preco_base,
        :estoque,
        'Y'
      ) RETURNING id INTO :id
    `;
    
    const binds = {
      vendedor_id: vendedorId,
      industria_id: industria_id || null,
      categoria_id: categoria_id || null,
      gtin,
      nome,
      descricao: descricao || null,
      preco_base,
      estoque,
      id: { type: require('oracledb').NUMBER, dir: require('oracledb').BIND_OUT }
    };
    
    const insertResult = await connection.execute(insertQuery, binds, { autoCommit: true });
    const productId = (insertResult.outBinds as any)?.id?.[0];
    
    // Buscar produto criado com joins
    const selectQuery = `
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
        u.nome as industria_nome
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN usuarios u ON p.industria_id = u.id
      WHERE p.id = :product_id
    `;
    
    const selectResult = await connection.execute(selectQuery, { product_id: productId });
    const row: any = selectResult.rows?.[0];
    
    const product = {
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
      industria_nome: row.INDUSTRIA_NOME
    };
    
    return successResponse(
      { product },
      'Produto cadastrado com sucesso',
      201
    );
    
  } catch (error) {
    console.error('Error creating product:', error);
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

