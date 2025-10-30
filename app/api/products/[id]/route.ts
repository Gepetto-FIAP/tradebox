import { NextRequest } from 'next/server';
import { connectOracle } from '@/lib/db';
import { 
  requireVendedor, 
  successResponse, 
  errorResponse, 
  handleOracleError 
} from '@/lib/api-middleware';
import { validateId, validateUpdateProductData } from '@/lib/validators';
const oracledb = require('oracledb');

/**
 * GET /api/products/[id]
 * Busca produto por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar se é vendedor
  const authResult = await requireVendedor();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { vendedorId } = authResult;
  
  // Await params (Next.js 15)
  const { id } = await params;
  
  // Validar ID
  const idValidation = validateId(id);
  if (!idValidation.valid) {
    return errorResponse('ID inválido', idValidation.error, 400);
  }
  
  const productId = idValidation.id!;
  
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
      WHERE p.id = :product_id AND p.vendedor_id = :vendedor_id
    `;
    
    const result = await connection.execute(query, {
      product_id: productId,
      vendedor_id: vendedorId
    });
    
    if (!result.rows || result.rows.length === 0) {
      return errorResponse(
        'Produto não encontrado',
        'O produto não existe ou você não tem permissão para acessá-lo',
        404
      );
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
    
    return successResponse({ product });
    
  } catch (error) {
    console.error('Error fetching product:', error);
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
 * PATCH /api/products/[id]
 * Atualiza produto
 * Body: { nome?, descricao?, preco_base?, estoque?, categoria_id?, industria_id?, ativo? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar se é vendedor
  const authResult = await requireVendedor();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { vendedorId } = authResult;
  
  // Await params (Next.js 15)
  const { id } = await params;
  
  // Validar ID
  const idValidation = validateId(id);
  if (!idValidation.valid) {
    return errorResponse('ID inválido', idValidation.error, 400);
  }
  
  const productId = idValidation.id!;
  
  let connection;
  
  try {
    const body = await request.json();
    
    // Validar dados
    const validation = validateUpdateProductData(body);
    if (!validation.valid) {
      return errorResponse('Dados inválidos', validation.error, 400);
    }
    
    connection = await connectOracle();
    
    // Verificar se produto existe e pertence ao vendedor
    const checkQuery = `
      SELECT id, gtin, industria_id FROM produtos
      WHERE id = :product_id AND vendedor_id = :vendedor_id
    `;
    
    const checkResult = await connection.execute(checkQuery, {
      product_id: productId,
      vendedor_id: vendedorId
    }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    if (!checkResult.rows || checkResult.rows.length === 0) {
      return errorResponse(
        'Produto não encontrado',
        'O produto não existe ou você não tem permissão para editá-lo',
        404
      );
    }
    
    const currentProduct: any = checkResult.rows[0];
    
    // Se industria_id está sendo alterada, verificar unicidade GTIN + INDUSTRIA
    const currentIndustryId = currentProduct.INDUSTRIA_ID === null ? null : currentProduct.INDUSTRIA_ID;
    const newIndustryId = body.industria_id === null ? null : (body.industria_id === undefined ? undefined : body.industria_id);
    
    // Só validar se a indústria está realmente mudando
    const isIndustryChanging = body.industria_id !== undefined && 
                                (currentIndustryId !== newIndustryId);
    
    if (isIndustryChanging) {
      const checkDuplicateQuery = `
        SELECT COUNT(*) as count
        FROM produtos
        WHERE vendedor_id = :vendedor_id 
          AND gtin = :gtin
          AND id != :product_id
          AND (
            (industria_id = :industria_id AND :industria_id IS NOT NULL)
            OR (industria_id IS NULL AND :industria_id IS NULL)
          )
      `;
      
      const duplicateResult = await connection.execute(
        checkDuplicateQuery, 
        { 
          vendedor_id: vendedorId, 
          gtin: currentProduct.GTIN,
          product_id: productId,
          industria_id: newIndustryId
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      const count = (duplicateResult.rows?.[0] as any)?.COUNT || 0;
      if (count > 0) {
        const industryMsg = newIndustryId 
          ? 'desta indústria' 
          : 'sem indústria associada';
        return errorResponse(
          'Produto duplicado',
          `Você já possui este produto (GTIN: ${currentProduct.GTIN}) cadastrado ${industryMsg}. Não é possível ter o mesmo GTIN cadastrado duas vezes para a mesma indústria.`,
          400
        );
      }
    }
    
    // Se industria_id fornecida, verificar se é INDUSTRIA
    if (body.industria_id !== undefined && body.industria_id !== null) {
      const checkIndustryQuery = `
        SELECT COUNT(*) as count
        FROM usuarios
        WHERE id = :industria_id AND categoria = 'INDUSTRIA' AND ativo = 'Y'
      `;
      
      const industryResult = await connection.execute(checkIndustryQuery, {
        industria_id: body.industria_id
      }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      
      const industryCount = (industryResult.rows?.[0] as any)?.COUNT || 0;
      if (industryCount === 0) {
        return errorResponse(
          'Indústria inválida',
          'A indústria selecionada não existe ou não está ativa',
          400
        );
      }
    }
    
    // Construir query de update dinamicamente
    const updates: string[] = [];
    const binds: any = { product_id: productId, vendedor_id: vendedorId };
    
    if (body.nome !== undefined) {
      updates.push('nome = :nome');
      binds.nome = body.nome;
    }
    
    if (body.descricao !== undefined) {
      updates.push('descricao = :descricao');
      binds.descricao = body.descricao;
    }
    
    if (body.preco_base !== undefined) {
      updates.push('preco_base = :preco_base');
      binds.preco_base = body.preco_base;
    }
    
    if (body.estoque !== undefined) {
      updates.push('estoque = :estoque');
      binds.estoque = body.estoque;
    }
    
    if (body.categoria_id !== undefined) {
      updates.push('categoria_id = :categoria_id');
      binds.categoria_id = body.categoria_id;
    }
    
    if (body.industria_id !== undefined) {
      updates.push('industria_id = :industria_id');
      binds.industria_id = body.industria_id;
    }
    
    if (body.ativo !== undefined) {
      updates.push('ativo = :ativo');
      binds.ativo = body.ativo;
    }
    
    const updateQuery = `
      UPDATE produtos
      SET ${updates.join(', ')}
      WHERE id = :product_id AND vendedor_id = :vendedor_id
    `;
    
    await connection.execute(updateQuery, binds, { autoCommit: true });
    
    // Buscar produto atualizado
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
      'Produto atualizado com sucesso'
    );
    
  } catch (error) {
    console.error('Error updating product:', error);
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
 * DELETE /api/products/[id]
 * Deleta produto (soft delete se houver vendas, hard delete caso contrário)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verificar se é vendedor
  const authResult = await requireVendedor();
  if (authResult instanceof Response) {
    return authResult;
  }
  
  const { vendedorId } = authResult;
  
  // Await params (Next.js 15)
  const { id } = await params;
  
  // Validar ID
  const idValidation = validateId(id);
  if (!idValidation.valid) {
    return errorResponse('ID inválido', idValidation.error, 400);
  }
  
  const productId = idValidation.id!;
  
  let connection;
  
  try {
    connection = await connectOracle();
    
    // Verificar se produto existe e pertence ao vendedor
    const checkQuery = `
      SELECT id, nome FROM produtos
      WHERE id = :product_id AND vendedor_id = :vendedor_id
    `;
    
    const checkResult = await connection.execute(checkQuery, {
      product_id: productId,
      vendedor_id: vendedorId
    }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    if (!checkResult.rows || checkResult.rows.length === 0) {
      return errorResponse(
        'Produto não encontrado',
        'O produto não existe ou você não tem permissão para deletá-lo',
        404
      );
    }
    
    const productName = (checkResult.rows[0] as any).NOME;
    
    // Verificar se existem vendas relacionadas ao produto
    const checkSalesQuery = `
      SELECT COUNT(*) as count FROM itens_venda
      WHERE produto_id = :product_id
    `;
    
    const salesResult = await connection.execute(checkSalesQuery, {
      product_id: productId
    }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    
    const salesCount = (salesResult.rows?.[0] as any)?.COUNT || 0;
    
    if (salesCount > 0) {
      // Se houver vendas relacionadas, fazer SOFT DELETE (marcar como inativo e zerar estoque)
      const softDeleteQuery = `
        UPDATE produtos
        SET ativo = 'N', estoque = 0, updated_at = CURRENT_TIMESTAMP
        WHERE id = :product_id AND vendedor_id = :vendedor_id
      `;
      
      await connection.execute(softDeleteQuery, {
        product_id: productId,
        vendedor_id: vendedorId
      }, { autoCommit: true });
      
      return successResponse(
        { 
          tipo_remocao: 'soft_delete',
          vendas_relacionadas: salesCount
        },
        `Produto "${productName}" desativado com sucesso. O produto possui ${salesCount} venda(s) relacionada(s), foi marcado como inativo e seu estoque foi zerado para preservar o histórico.`
      );
    } else {
      // Se não houver vendas, pode fazer HARD DELETE (remoção permanente)
      const deleteQuery = `
        DELETE FROM produtos
        WHERE id = :product_id AND vendedor_id = :vendedor_id
      `;
      
      await connection.execute(deleteQuery, {
        product_id: productId,
        vendedor_id: vendedorId
      }, { autoCommit: true });
      
      return successResponse(
        { tipo_remocao: 'hard_delete' },
        `Produto "${productName}" removido permanentemente com sucesso`
      );
    }
    
  } catch (error) {
    console.error('Error deleting product:', error);
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

