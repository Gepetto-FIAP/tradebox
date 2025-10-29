import { connectOracle } from './db';
import oracledb from 'oracledb';

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
        p.preco_custo,
        p.preco_base - p.preco_custo as lucro_unitario,
        CASE 
          WHEN p.preco_custo > 0 THEN 
            ROUND(((p.preco_base - p.preco_custo) / p.preco_custo * 100), 2)
          ELSE 0 
        END as margem_percentual,
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
        p.preco_custo,
        p.preco_base - p.preco_custo as lucro_unitario,
        CASE 
          WHEN p.preco_custo > 0 THEN 
            ROUND(((p.preco_base - p.preco_custo) / p.preco_custo * 100), 2)
          ELSE 0 
        END as margem_percentual,
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

// ==========================================
// QUERIES PARA INDÚSTRIA
// ==========================================

/**
 * Busca produtos da indústria
 */
export async function getProductsByIndustria(
  industriaId: number,
  filters: {
    search?: string;
    categoria_id?: number;
    page?: number;
    limit?: number;
  } = {}
) {
  const connection = await connectOracle();
  
  try {
    const { search, categoria_id, page = 1, limit = 20 } = filters;
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
        p.preco_custo,
        p.preco_base - p.preco_custo as lucro_unitario,
        CASE 
          WHEN p.preco_custo > 0 THEN 
            ROUND(((p.preco_base - p.preco_custo) / p.preco_custo * 100), 2)
          ELSE 0 
        END as margem_percentual,
        p.estoque,
        p.ativo,
        p.created_at,
        p.updated_at,
        c.nome as categoria_nome,
        u.nome as vendedor_nome,
        COUNT(DISTINCT v.id) as qtd_vendas
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      LEFT JOIN usuarios u ON p.vendedor_id = u.id
      LEFT JOIN itens_venda iv ON p.id = iv.produto_id
      LEFT JOIN vendas v ON iv.venda_id = v.id AND v.status = 'CONCLUIDA'
      WHERE p.industria_id = :industria_id
        AND p.ativo = 'Y'
    `;
    
    const binds: any = { industria_id: industriaId };
    
    if (search) {
      query += ` AND (UPPER(p.nome) LIKE :search OR p.gtin LIKE :search_gtin)`;
      binds.search = `%${search.toUpperCase()}%`;
      binds.search_gtin = `%${search}%`;
    }
    
    if (categoria_id) {
      query += ` AND p.categoria_id = :categoria_id`;
      binds.categoria_id = categoria_id;
    }
    
    query += ` 
      GROUP BY p.id, p.vendedor_id, p.industria_id, p.categoria_id, p.gtin, 
               p.nome, p.descricao, p.preco_base, p.estoque, p.ativo, 
               p.created_at, p.updated_at, c.nome, u.nome
      ORDER BY p.created_at DESC
      OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY
    `;
    binds.offset = offset;
    binds.limit = limit;
    
    const result = await connection.execute(query, binds);
    
    // Query para contar total
    let countQuery = `
      SELECT COUNT(DISTINCT p.id) as total
      FROM produtos p
      WHERE p.industria_id = :industria_id
        AND p.ativo = 'Y'
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
 * Busca vendedores que vendem produtos da indústria
 */
export async function getSellersByIndustria(industriaId: number) {
  const connection = await connectOracle();
  
  try {
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
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

/**
 * Busca vendas de produtos da indústria
 */
export async function getSalesByIndustria(
  industriaId: number,
  filters: {
    vendedor_id?: number;
    data_inicio?: string;
    data_fim?: string;
    limit?: number;
  } = {}
) {
  const connection = await connectOracle();
  
  try {
    const { vendedor_id, data_inicio, data_fim, limit = 50 } = filters;
    
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
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

/**
 * Busca métricas do dashboard da indústria
 */
export async function getIndustryDashboardMetrics(industriaId: number, days: number = 30) {
  const connection = await connectOracle();
  
  try {
    // Total de produtos cadastrados com a indústria
    const productsQuery = `
      SELECT COUNT(*) as total_produtos
      FROM produtos
      WHERE industria_id = :industria_id
        AND ativo = 'Y'
    `;
    
    const productsResult = await connection.execute(productsQuery, { industria_id: industriaId });
    const productsData: any = productsResult.rows?.[0] || {};
    
    // Total de vendedores ativos
    const sellersQuery = `
      SELECT COUNT(DISTINCT p.vendedor_id) as total_vendedores
      FROM produtos p
      WHERE p.industria_id = :industria_id
        AND p.ativo = 'Y'
    `;
    
    const sellersResult = await connection.execute(sellersQuery, { industria_id: industriaId });
    const sellersData: any = sellersResult.rows?.[0] || {};
    
    // Vendas e faturamento no período
    const salesQuery = `
      SELECT 
        COUNT(DISTINCT v.id) as total_vendas,
        COALESCE(SUM(iv.subtotal), 0) as receita_gerada
      FROM vendas v
      JOIN itens_venda iv ON v.id = iv.venda_id
      JOIN produtos p ON iv.produto_id = p.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
    `;
    
    const salesResult = await connection.execute(salesQuery, { industria_id: industriaId });
    const salesData: any = salesResult.rows?.[0] || {};
    
    // Produtos mais vendidos
    const topProductQuery = `
      SELECT 
        p.nome,
        SUM(iv.quantidade) as qtd_vendida
      FROM produtos p
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
      GROUP BY p.id, p.nome
      ORDER BY qtd_vendida DESC
      FETCH FIRST 1 ROWS ONLY
    `;
    
    const topProductResult = await connection.execute(topProductQuery, { industria_id: industriaId });
    const topProductData: any = topProductResult.rows?.[0] || {};
    
    return {
      total_produtos: productsData.TOTAL_PRODUTOS || 0,
      total_vendedores: sellersData.TOTAL_VENDEDORES || 0,
      total_vendas: salesData.TOTAL_VENDAS || 0,
      receita_gerada: salesData.RECEITA_GERADA || 0,
      produto_mais_vendido: topProductData.NOME || 'Nenhum',
      qtd_vendida_top: topProductData.QTD_VENDIDA || 0
    };
  } finally {
    await connection.close();
  }
}

/**
 * Busca performance de vendedores para a indústria
 */
export async function getSellersPerformance(industriaId: number, days: number = 30, limit: number = 10) {
  const connection = await connectOracle();
  
  try {
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
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

/**
 * Busca performance de produtos da indústria
 */
export async function getProductsPerformance(industriaId: number, days: number = 30, limit: number = 10) {
  const connection = await connectOracle();
  
  try {
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
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

/**
 * Busca analytics completos da indústria
 */
export async function getIndustryAnalytics(industriaId: number, days: number = 30) {
  const connection = await connectOracle();
  
  try {
    // Performance mensal
    const monthlyQuery = `
      SELECT 
        TO_CHAR(v.data_venda, 'YYYY-MM') as mes,
        COUNT(DISTINCT v.id) as qtd_vendas,
        SUM(iv.subtotal) as receita
      FROM vendas v
      JOIN itens_venda iv ON v.id = iv.venda_id
      JOIN produtos p ON iv.produto_id = p.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= ADD_MONTHS(CURRENT_TIMESTAMP, -12)
      GROUP BY TO_CHAR(v.data_venda, 'YYYY-MM')
      ORDER BY mes
    `;
    
    const monthlyResult = await connection.execute(monthlyQuery, { industria_id: industriaId });
    
    // Vendas por categoria
    const categoryQuery = `
      SELECT 
        c.nome as categoria,
        COUNT(DISTINCT v.id) as qtd_vendas,
        SUM(iv.subtotal) as valor_vendas
      FROM categorias c
      JOIN produtos p ON c.id = p.categoria_id
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${days}' DAY
      GROUP BY c.id, c.nome
      ORDER BY valor_vendas DESC
    `;
    
    const categoryResult = await connection.execute(categoryQuery, { industria_id: industriaId });
    
    // Distribuição geográfica (por vendedor - assumindo que vendedor tem localização)
    const regionQuery = `
      SELECT 
        COUNT(DISTINCT p.vendedor_id) as qtd_vendedores,
        COUNT(DISTINCT v.id) as qtd_vendas,
        SUM(iv.subtotal) as receita
      FROM produtos p
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE p.industria_id = :industria_id
        AND v.status = 'CONCLUIDA'
    `;
    
    const regionResult = await connection.execute(regionQuery, { industria_id: industriaId });
    
    return {
      monthlyPerformance: monthlyResult.rows || [],
      salesByCategory: categoryResult.rows || [],
      distribution: regionResult.rows?.[0] || {}
    };
  } finally {
    await connection.close();
  }
}

// ==========================================
// Queries de Margem e Lucro
// ==========================================

/**
 * Busca produtos mais lucrativos do vendedor
 */
export async function getProfitableProducts(
  vendedorId: number,
  filters: {
    periodo_dias?: number;
    limit?: number;
  } = {}
) {
  const connection = await connectOracle();
  
  try {
    const { periodo_dias = 30, limit = 10 } = filters;
    
    const query = `
      SELECT 
        p.id as produto_id,
        p.nome,
        p.gtin,
        COUNT(DISTINCT v.id) as qtd_vendas,
        SUM(iv.quantidade) as qtd_vendida,
        SUM(iv.subtotal) as receita_total,
        SUM(p.preco_custo * iv.quantidade) as custo_total,
        SUM(iv.subtotal - (p.preco_custo * iv.quantidade)) as lucro_total,
        ROUND(
          CASE 
            WHEN SUM(iv.subtotal) > 0 THEN
              SUM(iv.subtotal - (p.preco_custo * iv.quantidade)) / SUM(iv.subtotal) * 100
            ELSE 0
          END,
          2
        ) as margem_media
      FROM produtos p
      JOIN itens_venda iv ON p.id = iv.produto_id
      JOIN vendas v ON iv.venda_id = v.id
      WHERE v.vendedor_id = :vendedor_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${periodo_dias}' DAY
      GROUP BY p.id, p.nome, p.gtin
      ORDER BY lucro_total DESC
      FETCH FIRST :limit ROWS ONLY
    `;
    
    const result = await connection.execute(query, {
      vendedor_id: vendedorId,
      limit
    });
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

/**
 * Análise de lucro por venda
 */
export async function getProfitAnalysisBySale(
  vendedorId: number,
  filters: {
    periodo_dias?: number;
    limit?: number;
  } = {}
) {
  const connection = await connectOracle();
  
  try {
    const { periodo_dias = 30, limit = 50 } = filters;
    
    const query = `
      SELECT 
        v.id as venda_id,
        v.data_venda,
        SUM(iv.subtotal) as receita_total,
        SUM(p.preco_custo * iv.quantidade) as custo_total,
        SUM(iv.subtotal - (p.preco_custo * iv.quantidade)) as lucro_total,
        ROUND(
          CASE 
            WHEN SUM(iv.subtotal) > 0 THEN
              SUM(iv.subtotal - (p.preco_custo * iv.quantidade)) / SUM(iv.subtotal) * 100
            ELSE 0
          END,
          2
        ) as margem_percentual
      FROM vendas v
      JOIN itens_venda iv ON v.id = iv.venda_id
      JOIN produtos p ON iv.produto_id = p.id
      WHERE v.vendedor_id = :vendedor_id
        AND v.status = 'CONCLUIDA'
        AND v.data_venda >= CURRENT_TIMESTAMP - INTERVAL '${periodo_dias}' DAY
      GROUP BY v.id, v.data_venda
      ORDER BY v.data_venda DESC
      FETCH FIRST :limit ROWS ONLY
    `;
    
    const result = await connection.execute(query, {
      vendedor_id: vendedorId,
      limit
    });
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

/**
 * Análise de margem por indústria (para o vendedor)
 */
export async function getMarginByIndustry(vendedorId: number) {
  const connection = await connectOracle();
  
  try {
    const query = `
      SELECT 
        u.nome as industria,
        COUNT(DISTINCT p.id) as qtd_produtos,
        ROUND(
          AVG(
            CASE 
              WHEN p.preco_custo > 0 THEN 
                ((p.preco_base - p.preco_custo) / p.preco_custo * 100)
              ELSE 0 
            END
          ),
          2
        ) as margem_media,
        COALESCE(SUM(iv.subtotal), 0) as receita_gerada,
        COALESCE(SUM(p.preco_custo * iv.quantidade), 0) as custo_total,
        COALESCE(SUM(iv.subtotal - (p.preco_custo * iv.quantidade)), 0) as lucro_total
      FROM usuarios u
      JOIN produtos p ON u.id = p.industria_id
      LEFT JOIN itens_venda iv ON p.id = iv.produto_id
      LEFT JOIN vendas v ON iv.venda_id = v.id AND v.status = 'CONCLUIDA'
      WHERE p.vendedor_id = :vendedor_id
        AND p.ativo = 'Y'
      GROUP BY u.id, u.nome
      ORDER BY lucro_total DESC
    `;
    
    const result = await connection.execute(query, { vendedor_id: vendedorId });
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

/**
 * Produtos com margem baixa (alerta)
 */
export async function getLowMarginProducts(
  vendedorId: number,
  filters: {
    margem_minima?: number;
    limit?: number;
  } = {}
) {
  const connection = await connectOracle();
  
  try {
    const { margem_minima = 20, limit = 20 } = filters;
    
    const query = `
      SELECT 
        p.id as produto_id,
        p.nome,
        p.preco_custo,
        p.preco_base,
        (p.preco_base - p.preco_custo) as lucro_unitario,
        ROUND(
          CASE 
            WHEN p.preco_custo > 0 THEN
              ((p.preco_base - p.preco_custo) / p.preco_custo * 100)
            ELSE 0
          END,
          2
        ) as margem_percentual
      FROM produtos p
      WHERE p.vendedor_id = :vendedor_id
        AND p.ativo = 'Y'
        AND p.preco_custo > 0
        AND ((p.preco_base - p.preco_custo) / p.preco_custo * 100) < :margem_minima
      ORDER BY margem_percentual ASC
      FETCH FIRST :limit ROWS ONLY
    `;
    
    const result = await connection.execute(query, {
      vendedor_id: vendedorId,
      margem_minima,
      limit
    });
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

/**
 * Sugestão de preço de custo (para indústria)
 * Produtos com margem baixa que podem precisar de ajuste
 */
export async function getPriceSuggestions(
  industriaId: number,
  filters: {
    margem_maxima?: number;
    margem_alvo?: number;
    limit?: number;
  } = {}
) {
  const connection = await connectOracle();
  
  try {
    const { margem_maxima = 15, margem_alvo = 25, limit = 20 } = filters;
    
    const query = `
      SELECT 
        p.id as produto_id,
        p.nome,
        p.gtin,
        v.nome as vendedor,
        p.preco_custo as preco_custo_atual,
        p.preco_base,
        ROUND(
          CASE 
            WHEN p.preco_custo > 0 THEN
              ((p.preco_base - p.preco_custo) / p.preco_custo * 100)
            ELSE 0
          END,
          2
        ) as margem_atual,
        ROUND(p.preco_base / (1 + :margem_alvo / 100), 2) as preco_custo_sugerido,
        :margem_alvo as margem_alvo
      FROM produtos p
      JOIN usuarios v ON p.vendedor_id = v.id
      WHERE p.industria_id = :industria_id
        AND p.ativo = 'Y'
        AND p.preco_custo > 0
        AND ((p.preco_base - p.preco_custo) / p.preco_custo * 100) < :margem_maxima
      ORDER BY margem_atual ASC
      FETCH FIRST :limit ROWS ONLY
    `;
    
    const result = await connection.execute(query, {
      industria_id: industriaId,
      margem_maxima,
      margem_alvo,
      limit
    }, {
      outFormat: oracledb.OUT_FORMAT_OBJECT
    });
    
    return result.rows || [];
  } finally {
    await connection.close();
  }
}

