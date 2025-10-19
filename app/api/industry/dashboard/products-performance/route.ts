import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireIndustria, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';
import { validatePeriodo } from '@/lib/validators';

/**
 * GET /api/industry/dashboard/products-performance
 * Retorna performance dos produtos da indústria
 * Query params: ?periodo=30d&limit=10
 */
export async function GET(request: NextRequest) {
  // Verificar se é indústria
  const authResult = await requireIndustria();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { industriaId } = authResult;
  const { searchParams } = new URL(request.url);
  
  const periodo = searchParams.get('periodo') || '30d';
  const limit = parseInt(searchParams.get('limit') || '10');
  
  // Validar período
  const periodoValidation = validatePeriodo(periodo);
  if (!periodoValidation.valid) {
    return errorResponse('Período inválido', periodoValidation.error, 400);
  }
  
  const days = periodoValidation.days!;
  
  let connection;
  
  try {
    connection = await connectOracle();
    
    const query = `
      SELECT 
        p.id as produto_id,
        p.gtin,
        p.nome,
        COUNT(DISTINCT v.vendedor_id) as qtd_vendedores,
        COUNT(DISTINCT v.id) as qtd_vendas,
        SUM(iv.quantidade) as qtd_vendida,
        SUM(iv.subtotal) as receita
      FROM produtos p
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
      GROUP BY p.id, p.gtin, p.nome
      ORDER BY receita DESC
      FETCH FIRST :limit ROWS ONLY
    `;
    
    const result = await connection.execute(query, {
      industria_id: industriaId,
      limit
    });
    
    const products = (result.rows || []).map((row: any) => ({
      produto_id: row[0],
      gtin: row[1],
      nome: row[2],
      qtd_vendedores: row[3],
      qtd_vendas: row[4],
      qtd_vendida: row[5],
      receita: row[6]
    }));
    
    return successResponse({ products });
    
  } catch (error) {
    console.error('Error fetching products performance:', error);
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

