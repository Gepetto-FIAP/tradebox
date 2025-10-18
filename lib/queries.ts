import { connectOracle } from './db';

/**
 * Busca produtos do vendedor com filtros opcionais
 */
export async function getProductsByVendedor(
  vendedorId: number,
  filters: {
    search?: string;
    categoria_id?: number;
    ativo?: 'Y' | 'N';
    page?: number;
    limit?: number;
  } = {}
) {
  const connection = await connectOracle();
  
  try {
    const { search, categoria_id, ativo = 'Y', page = 1, limit = 20 } = filters;
    const offset = (page - 1) * limit;
    
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
    
    return {
      products: result.rows || [],
      total
    };
  } finally {
    await connection.close();
  }
}

/**
 * Busca produto por ID (verifica ownership do vendedor)
 */
export async function getProductById(productId: number, vendedorId: number) {
  const connection = await connectOracle();
  
  try {
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
    
    return result.rows?.[0] || null;
  } finally {
    await connection.close();
  }
}

/**
 * Busca produto por GTIN do vendedor
 */
export async function getProductByGTIN(gtin: string, vendedorId: number) {
  const connection = await connectOracle();
  
  try {
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
    
    return result.rows?.[0] || null;
  } finally {
    await connection.close();
  }
}

/**
 * Busca vendas do vendedor com filtros
 */
export async function getSalesByVendedor(
  vendedorId: number,
  filters: {
    status?: string;
    data_inicio?: string;
    data_fim?: string;
    limit?: number;
  } = {}
) {
  const connection = await connectOracle();
  
  try {
    const { status, data_inicio, data_fim, limit = 50 } = filters;
    
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
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

/**
 * Busca detalhes de uma venda com itens
 */
export async function getSaleWithItems(saleId: number, vendedorId: number) {
  const connection = await connectOracle();
  
  try {
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
      return null;
    }
    
    const sale = saleResult.rows[0];
    
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
    
    return {
      sale,
      items: itemsResult.rows || []
    };
  } finally {
    await connection.close();
  }
}

/**
 * Busca produtos mais vendidos (trending)
 */
export async function getTrendingProducts(vendedorId: number, days: number = 30, limit: number = 10) {
  const connection = await connectOracle();
  
  try {
    const query = `
      SELECT 
        p.id as produto_id,
        p.nome,
        SUM(iv.quantidade) as vendas
      FROM produtos p
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE v.vendedor_id = :vendedor_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL ':days' DAY
      GROUP BY p.id, p.nome
      ORDER BY vendas DESC
      FETCH FIRST :limit ROWS ONLY
    `;
    
    const result = await connection.execute(query, {
      vendedor_id: vendedorId,
      days,
      limit
    });
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

/**
 * Busca vendas por categoria
 */
export async function getSalesByCategory(vendedorId: number, days: number = 30) {
  const connection = await connectOracle();
  
  try {
    const query = `
      SELECT 
        c.nome as categoria,
        COUNT(DISTINCT v.id) as qtd_vendas,
        SUM(iv.subtotal) as valor_vendas
      FROM categorias c
      JOIN produtos p ON c.id = p.categoria_id
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE v.vendedor_id = :vendedor_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL ':days' DAY
      GROUP BY c.id, c.nome
      ORDER BY valor_vendas DESC
    `;
    
    const result = await connection.execute(query, {
      vendedor_id: vendedorId,
      days
    });
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

/**
 * Busca top produtos por receita
 */
export async function getTopProducts(vendedorId: number, days: number = 30, limit: number = 5) {
  const connection = await connectOracle();
  
  try {
    const query = `
      SELECT 
        p.id as produto_id,
        p.nome,
        SUM(iv.quantidade) as qtd_vendida,
        SUM(iv.subtotal) as receita
      FROM produtos p
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE v.vendedor_id = :vendedor_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL ':days' DAY
      GROUP BY p.id, p.nome
      ORDER BY receita DESC
      FETCH FIRST :limit ROWS ONLY
    `;
    
    const result = await connection.execute(query, {
      vendedor_id: vendedorId,
      days,
      limit
    });
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

/**
 * Busca parceiros de indústria
 */
export async function getIndustryPartners(vendedorId: number) {
  const connection = await connectOracle();
  
  try {
    const query = `
      SELECT 
        u.id as industria_id,
        u.nome as industria,
        COUNT(DISTINCT p.id) as qtd_produtos,
        COUNT(DISTINCT v.id) as qtd_vendas,
        COALESCE(SUM(iv.subtotal), 0) as receita_gerada
      FROM usuarios u
      JOIN produtos p ON u.id = p.industria_id
      LEFT JOIN itens_venda iv ON p.id = iv.produto_id
      LEFT JOIN vendas v ON iv.venda_id = v.id AND v.status = 'CONCLUIDA'
      WHERE p.vendedor_id = :vendedor_id
        AND u.categoria = 'INDUSTRIA'
      GROUP BY u.id, u.nome
      ORDER BY receita_gerada DESC
      FETCH FIRST 5 ROWS ONLY
    `;
    
    const result = await connection.execute(query, {
      vendedor_id: vendedorId
    });
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

/**
 * Busca métricas do dashboard
 */
export async function getDashboardMetrics(vendedorId: number, days: number = 30) {
  const connection = await connectOracle();
  
  try {
    // Total de vendas e faturamento no período
    const salesQuery = `
      SELECT 
        COUNT(*) as total_vendas,
        COALESCE(SUM(valor_total), 0) as faturamento
      FROM vendas
      WHERE vendedor_id = :vendedor_id
        AND status = 'CONCLUIDA'
        AND data_venda >= CURRENT_TIMESTAMP - INTERVAL ':days' DAY
    `;
    
    const salesResult = await connection.execute(salesQuery, { vendedor_id: vendedorId, days });
    const salesData: any = salesResult.rows?.[0] || {};
    
    // Vendas nos últimos 7 dias
    const vendas7dQuery = `
      SELECT COALESCE(SUM(valor_total), 0) as vendas_7d
      FROM vendas
      WHERE vendedor_id = :vendedor_id
        AND status = 'CONCLUIDA'
        AND data_venda >= CURRENT_TIMESTAMP - INTERVAL '7' DAY
    `;
    
    const vendas7dResult = await connection.execute(vendas7dQuery, { vendedor_id: vendedorId });
    const vendas7d: any = vendas7dResult.rows?.[0] || {};
    
    // Total de produtos
    const productsQuery = `
      SELECT COUNT(*) as total_produtos
      FROM produtos
      WHERE vendedor_id = :vendedor_id
        AND ativo = 'Y'
    `;
    
    const productsResult = await connection.execute(productsQuery, { vendedor_id: vendedorId });
    const productsData: any = productsResult.rows?.[0] || {};
    
    // Produtos com estoque baixo
    const lowStockQuery = `
      SELECT COUNT(*) as produtos_estoque_baixo
      FROM produtos
      WHERE vendedor_id = :vendedor_id
        AND ativo = 'Y'
        AND estoque < 10
    `;
    
    const lowStockResult = await connection.execute(lowStockQuery, { vendedor_id: vendedorId });
    const lowStockData: any = lowStockResult.rows?.[0] || {};
    
    return {
      total_vendas: salesData.TOTAL_VENDAS || 0,
      faturamento: salesData.FATURAMENTO || 0,
      vendas_7d: vendas7d.VENDAS_7D || 0,
      total_produtos: productsData.TOTAL_PRODUTOS || 0,
      produtos_estoque_baixo: lowStockData.PRODUTOS_ESTOQUE_BAIXO || 0
    };
  } finally {
    await connection.close();
  }
}

/**
 * Busca performance mensal
 */
export async function getMonthlyPerformance(vendedorId: number) {
  const connection = await connectOracle();
  
  try {
    const query = `
      SELECT 
        TO_CHAR(data_venda, 'YYYY-MM') as mes,
        COUNT(*) as qtd_pedidos,
        SUM(valor_total) as receita
      FROM vendas
      WHERE vendedor_id = :vendedor_id
        AND status = 'CONCLUIDA'
        AND data_venda >= ADD_MONTHS(CURRENT_TIMESTAMP, -12)
      GROUP BY TO_CHAR(data_venda, 'YYYY-MM')
      ORDER BY mes
    `;
    
    const result = await connection.execute(query, { vendedor_id: vendedorId });
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

