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
 * GET /api/industry/dashboard/sellers-performance
 * Retorna performance dos vendedores
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
        u.id as vendedor_id,
        u.nome as vendedor,
        COUNT(DISTINCT p.id) as qtd_produtos,
        COUNT(DISTINCT v.id) as qtd_vendas,
        SUM(iv.quantidade) as produtos_vendidos,
        SUM(iv.subtotal) as receita
      FROM usuarios u
      JOIN produtos p ON u.id = p.vendedor_id
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
      GROUP BY u.id, u.nome
      ORDER BY receita DESC
      FETCH FIRST :limit ROWS ONLY
    `;
    
    const result = await connection.execute(query, {
      industria_id: industriaId,
      limit
    });
    
    const sellers = (result.rows || []).map((row: any) => ({
      vendedor_id: row.VENDEDOR_ID,
      vendedor: row.VENDEDOR,
      qtd_produtos: row.QTD_PRODUTOS,
      qtd_vendas: row.QTD_VENDAS,
      produtos_vendidos: row.PRODUTOS_VENDIDOS,
      receita: row.RECEITA
    }));
    
    return successResponse({ sellers });
    
  } catch (error) {
    console.error('Error fetching sellers performance:', error);
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

