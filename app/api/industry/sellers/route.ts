import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireIndustria, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';

/**
 * GET /api/industry/sellers
 * Lista vendedores que vendem produtos da indústria
 */
export async function GET(request: NextRequest) {
  // Verificar se é indústria
  const authResult = await requireIndustria();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { industriaId } = authResult;
  
  let connection;
  
  try {
    connection = await connectOracle();
    
    const query = `
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.telefone,
        COUNT(DISTINCT p.id) as qtd_produtos,
        COUNT(DISTINCT v.id) as qtd_vendas,
        COALESCE(SUM(iv.subtotal), 0) as receita_gerada,
        MAX(v.data_venda) as ultima_venda
      FROM usuarios u
      JOIN produtos p ON u.id = p.vendedor_id
      LEFT JOIN itens_venda iv ON p.id = iv.produto_id
      LEFT JOIN vendas v ON iv.venda_id = v.id AND v.status = 'CONCLUIDA'
      WHERE p.industria_id = :industria_id
        AND u.categoria = 'VAREJISTA'
        AND u.ativo = 'Y'
      GROUP BY u.id, u.nome, u.email, u.telefone
      ORDER BY receita_gerada DESC
    `;
    
    const result = await connection.execute(query, { industria_id: industriaId });
    
    // Converter rows para formato esperado
    const sellers = (result.rows || []).map((row: any) => ({
      id: row.ID,
      nome: row.NOME,
      email: row.EMAIL,
      telefone: row.TELEFONE,
      qtd_produtos: row.QTD_PRODUTOS,
      qtd_vendas: row.QTD_VENDAS,
      receita_gerada: row.RECEITA_GERADA,
      ultima_venda: row.ULTIMA_VENDA
    }));
    
    return successResponse({ sellers, total: sellers.length });
    
  } catch (error) {
    console.error('Error fetching sellers:', error);
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

