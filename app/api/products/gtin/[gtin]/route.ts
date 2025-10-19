import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireVendedor, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';
import { validateGTIN } from '@/lib/validators';

/**
 * GET /api/products/gtin/[gtin]
 * Busca produto por GTIN (código de barras)
 * Usado durante scan para venda ou edição
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gtin: string }> }
) {
  // Verificar se é vendedor
  const authResult = await requireVendedor();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { vendedorId } = authResult;
  
  // Await params (Next.js 15)
  const { gtin } = await params;
  
  // Validar GTIN
  const gtinValidation = validateGTIN(gtin);
  if (!gtinValidation.valid) {
    return errorResponse('GTIN inválido', gtinValidation.error, 400);
  }
  
  let connection;
  
  try {
    connection = await connectOracle();
    
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
        p.estoque,
        p.ativo,
        p.created_at,
        p.updated_at,
        c.nome as categoria_nome,
        u.nome as industria_nome
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN usuarios u ON p.industria_id = u.id
      WHERE p.gtin = :gtin 
        AND p.vendedor_id = :vendedor_id
        AND p.ativo = 'Y'
    `;
    
    const result = await connection.execute(query, {
      gtin,
      vendedor_id: vendedorId
    });
    
    if (!result.rows || result.rows.length === 0) {
      return successResponse({ 
        found: false,
        product: null,
        message: 'Produto não encontrado no seu catálogo'
      });
    }
    
    const row: any = result.rows[0];
    
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
    
    return successResponse({ 
      found: true,
      product 
    });
    
  } catch (error) {
    console.error('Error fetching product by GTIN:', error);
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

