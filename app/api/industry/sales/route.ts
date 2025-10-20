import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireIndustria, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';

/**
 * GET /api/industry/sales
 * Lista todas as vendas de produtos da indústria
 * Query params: ?vendedor_id=1&data_inicio=2024-01-01&data_fim=2024-12-31&limit=50
 */
export async function GET(request: NextRequest) {
  // Verificar se é indústria
  const authResult = await requireIndustria();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { industriaId } = authResult;
  const { searchParams } = new URL(request.url);
  
  const vendedor_id = searchParams.get('vendedor_id') 
    ? parseInt(searchParams.get('vendedor_id')!) 
    : undefined;
  const data_inicio = searchParams.get('data_inicio') || undefined;
  const data_fim = searchParams.get('data_fim') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50');
  
  let connection;
  
  try {
    connection = await connectOracle();
    
    let query = `
      SELECT DISTINCT
        v.id,
        v.vendedor_id,
        v.data_venda,
        v.valor_total,
        v.quantidade_itens,
        v.status,
        u.nome as vendedor_nome
      FROM vendas v
      JOIN usuarios u ON v.vendedor_id = u.id
      JOIN itens_venda iv ON v.id = iv.venda_id
      JOIN produtos p ON iv.produto_id = p.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
    `;
    
    const binds: any = { industria_id: industriaId };
    
    if (vendedor_id) {
      query += ` AND v.vendedor_id = :vendedor_id`;
      binds.vendedor_id = vendedor_id;
    }
    
    if (data_inicio) {
      query += ` AND v.data_venda >= TO_TIMESTAMP(:data_inicio, 'YYYY-MM-DD')`;
      binds.data_inicio = data_inicio;
    }
    
    if (data_fim) {
      query += ` AND v.data_venda <= TO_TIMESTAMP(:data_fim, 'YYYY-MM-DD') + INTERVAL '1' DAY`;
      binds.data_fim = data_fim;
    }
    
    query += ` ORDER BY v.data_venda DESC FETCH FIRST :limit ROWS ONLY`;
    binds.limit = limit;
    
    const result = await connection.execute(query, binds);
    
    // Converter rows para formato esperado
    const sales = (result.rows || []).map((row: any) => ({
      id: row[0],
      vendedor_id: row[1],
      data_venda: row[2],
      valor_total: row[3],
      quantidade_itens: row[4],
      status: row[5],
      vendedor_nome: row[6]
    }));
    
    return successResponse({ sales, total: sales.length });
    
  } catch (error) {
    console.error('Error fetching sales:', error);
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

