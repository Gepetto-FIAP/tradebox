import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireVendedor, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';
import { validateSaleData } from '@/lib/validators';

/**
 * GET /api/sales
 * Lista vendas do vendedor com filtros
 * Query params: ?status=CONCLUIDA&data_inicio=2024-01-01&data_fim=2024-12-31&limit=50
 */
export async function GET(request: NextRequest) {
  // Verificar se é vendedor
  const authResult = await requireVendedor();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { vendedorId } = authResult;
  const { searchParams } = new URL(request.url);
  
  const status = searchParams.get('status') || undefined;
  const data_inicio = searchParams.get('data_inicio') || undefined;
  const data_fim = searchParams.get('data_fim') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50');
  
  let connection;
  
  try {
    connection = await connectOracle();
    
    let query = `
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
      WHERE v.vendedor_id = :vendedor_id
    `;
    
    const binds: any = { vendedor_id: vendedorId };
    
    if (status) {
      query += ` AND v.status = :status`;
      binds.status = status;
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
      cliente_id: row[2],
      data_venda: row[3],
      valor_total: row[4],
      quantidade_itens: row[5],
      status: row[6],
      observacoes: row[7],
      created_at: row[8],
      cliente_nome: row[9]
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

/**
 * POST /api/sales
 * Cria uma nova venda com itens
 * Body: { cliente_id?, itens: [{produto_id, quantidade, preco_unitario}], observacoes? }
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
    const validation = validateSaleData(body);
    if (!validation.valid) {
      return errorResponse('Dados inválidos', validation.error, 400);
    }
    
    const { cliente_id, itens, observacoes } = body;
    
    connection = await connectOracle();
    
    // Verificar se todos os produtos pertencem ao vendedor
    const productIds = itens.map((item: any) => item.produto_id);
    const placeholders = productIds.map((_: any, i: number) => `:pid${i}`).join(',');
    
    const checkProductsQuery = `
      SELECT id FROM produtos
      WHERE id IN (${placeholders})
        AND vendedor_id = :vendedor_id
        AND ativo = 'Y'
    `;
    
    const checkBinds: any = { vendedor_id: vendedorId };
    productIds.forEach((id: number, i: number) => {
      checkBinds[`pid${i}`] = id;
    });
    
    const checkResult = await connection.execute(checkProductsQuery, checkBinds);
    
    if (!checkResult.rows || checkResult.rows.length !== productIds.length) {
      return errorResponse(
        'Produtos inválidos',
        'Um ou mais produtos não existem ou não pertencem a você',
        400
      );
    }
    
    // Calcular totais
    let valor_total = 0;
    let quantidade_itens = 0;
    
    for (const item of itens) {
      const subtotal = item.quantidade * item.preco_unitario;
      valor_total += subtotal;
      quantidade_itens += item.quantidade;
    }
    
    // Iniciar transação
    // Inserir venda
    const insertSaleQuery = `
      INSERT INTO vendas (
        vendedor_id,
        cliente_id,
        valor_total,
        quantidade_itens,
        status,
        observacoes
      ) VALUES (
        :vendedor_id,
        :cliente_id,
        :valor_total,
        :quantidade_itens,
        'CONCLUIDA',
        :observacoes
      ) RETURNING id INTO :id
    `;
    
    const saleBinds = {
      vendedor_id: vendedorId,
      cliente_id: cliente_id || null,
      valor_total,
      quantidade_itens,
      observacoes: observacoes || null,
      id: { type: require('oracledb').NUMBER, dir: require('oracledb').BIND_OUT }
    };
    
    const saleResult = await connection.execute(insertSaleQuery, saleBinds);
    const vendaId = (saleResult.outBinds as any)?.id?.[0];
    
    // Inserir itens da venda
    for (const item of itens) {
      const insertItemQuery = `
        INSERT INTO itens_venda (
          venda_id,
          produto_id,
          quantidade,
          preco_unitario
        ) VALUES (
          :venda_id,
          :produto_id,
          :quantidade,
          :preco_unitario
        )
      `;
      
      await connection.execute(insertItemQuery, {
        venda_id: vendaId,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario
      });
    }
    
    // Commit da transação
    await connection.commit();
    
    return successResponse(
      { 
        venda_id: vendaId,
        valor_total,
        quantidade_itens
      },
      'Venda realizada com sucesso',
      201
    );
    
  } catch (error) {
    console.error('Error creating sale:', error);
    
    // Rollback em caso de erro
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back:', rollbackError);
      }
    }
    
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

