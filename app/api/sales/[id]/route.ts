import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireVendedor, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';
import { validateId } from '@/lib/validators';

/**
 * GET /api/sales/[id]
 * Busca detalhes de uma venda com todos os itens
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Verificar se é vendedor
  const authResult = await requireVendedor();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { vendedorId } = authResult;
  
  // Validar ID
  const idValidation = validateId(params.id);
  if (!idValidation.valid) {
    return errorResponse('ID inválido', idValidation.error, 400);
  }
  
  const saleId = idValidation.id!;
  
  let connection;
  
  try {
    connection = await connectOracle();
    
    // Buscar venda
    const saleQuery = `
      SELECT 
        v.id,
        v.vendedor_id,
        v.cliente_id,
        v.data_venda,
        v.valor_total,
        v.quantidade_itens,
        v.status,
        v.observacoes,
        v.created_at,
        c.nome as cliente_nome
      FROM vendas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.id = :sale_id AND v.vendedor_id = :vendedor_id
    `;
    
    const saleResult = await connection.execute(saleQuery, {
      sale_id: saleId,
      vendedor_id: vendedorId
    });
    
    if (!saleResult.rows || saleResult.rows.length === 0) {
      return errorResponse(
        'Venda não encontrada',
        'A venda não existe ou você não tem permissão para acessá-la',
        404
      );
    }
    
    const saleRow: any = saleResult.rows[0];
    
    const sale = {
      id: saleRow.ID,
      vendedor_id: saleRow.VENDEDOR_ID,
      cliente_id: saleRow.CLIENTE_ID,
      data_venda: saleRow.DATA_VENDA,
      valor_total: saleRow.VALOR_TOTAL,
      quantidade_itens: saleRow.QUANTIDADE_ITENS,
      status: saleRow.STATUS,
      observacoes: saleRow.OBSERVACOES,
      created_at: saleRow.CREATED_AT,
      cliente_nome: saleRow.CLIENTE_NOME
    };
    
    // Buscar itens da venda
    const itemsQuery = `
      SELECT 
        iv.id,
        iv.venda_id,
        iv.produto_id,
        iv.quantidade,
        iv.preco_unitario,
        iv.subtotal,
        iv.created_at,
        p.nome as produto_nome,
        p.gtin as produto_gtin
      FROM itens_venda iv
      JOIN produtos p ON iv.produto_id = p.id
      WHERE iv.venda_id = :sale_id
      ORDER BY iv.id
    `;
    
    const itemsResult = await connection.execute(itemsQuery, { sale_id: saleId });
    
    const items = (itemsResult.rows || []).map((row: any) => ({
      id: row.ID,
      venda_id: row.VENDA_ID,
      produto_id: row.PRODUTO_ID,
      quantidade: row.QUANTIDADE,
      preco_unitario: row.PRECO_UNITARIO,
      subtotal: row.SUBTOTAL,
      created_at: row.CREATED_AT,
      produto_nome: row.PRODUTO_NOME,
      produto_gtin: row.PRODUTO_GTIN
    }));
    
    return successResponse({ sale, items });
    
  } catch (error) {
    console.error('Error fetching sale details:', error);
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

