import { CreateProductRequest, UpdateProductRequest, CreateSaleRequest } from './types';

/**
 * Valida dados de criação de produto
 */
export function validateProductData(data: any): { valid: boolean; error?: string } {
  const { gtin, nome, preco_base, estoque } = data;
  
  // GTIN obrigatório
  if (!gtin || typeof gtin !== 'string') {
    return { valid: false, error: 'GTIN é obrigatório' };
  }
  
  // Validar formato GTIN (8, 12, 13 ou 14 dígitos)
  const gtinValidation = validateGTIN(gtin);
  if (!gtinValidation.valid) {
    return gtinValidation;
  }
  
  // Nome obrigatório
  if (!nome || typeof nome !== 'string' || nome.trim().length === 0) {
    return { valid: false, error: 'Nome do produto é obrigatório' };
  }
  
  if (nome.length > 255) {
    return { valid: false, error: 'Nome do produto não pode ter mais de 255 caracteres' };
  }
  
  // Preço base obrigatório e não-negativo
  if (preco_base === undefined || preco_base === null) {
    return { valid: false, error: 'Preço base é obrigatório' };
  }
  
  const preco = parseFloat(preco_base);
  if (isNaN(preco) || preco < 0) {
    return { valid: false, error: 'Preço base deve ser um número não-negativo' };
  }
  
  // Estoque opcional, mas se fornecido deve ser não-negativo
  if (estoque !== undefined && estoque !== null) {
    const estoqueNum = parseInt(estoque);
    if (isNaN(estoqueNum) || estoqueNum < 0) {
      return { valid: false, error: 'Estoque deve ser um número não-negativo' };
    }
  }
  
  // Validar descricao se fornecida
  if (data.descricao && data.descricao.length > 1000) {
    return { valid: false, error: 'Descrição não pode ter mais de 1000 caracteres' };
  }
  
  return { valid: true };
}

/**
 * Valida dados de atualização de produto
 */
export function validateUpdateProductData(data: any): { valid: boolean; error?: string } {
  // Pelo menos um campo deve ser fornecido
  const allowedFields = ['nome', 'descricao', 'preco_base', 'estoque', 'categoria_id', 'industria_id', 'ativo'];
  const hasField = allowedFields.some(field => data[field] !== undefined);
  
  if (!hasField) {
    return { valid: false, error: 'Nenhum campo para atualizar foi fornecido' };
  }
  
  // Validar nome se fornecido
  if (data.nome !== undefined) {
    if (typeof data.nome !== 'string' || data.nome.trim().length === 0) {
      return { valid: false, error: 'Nome inválido' };
    }
    if (data.nome.length > 255) {
      return { valid: false, error: 'Nome não pode ter mais de 255 caracteres' };
    }
  }
  
  // Validar preço se fornecido
  if (data.preco_base !== undefined) {
    const preco = parseFloat(data.preco_base);
    if (isNaN(preco) || preco < 0) {
      return { valid: false, error: 'Preço base deve ser um número não-negativo' };
    }
  }
  
  // Validar estoque se fornecido
  if (data.estoque !== undefined) {
    const estoque = parseInt(data.estoque);
    if (isNaN(estoque) || estoque < 0) {
      return { valid: false, error: 'Estoque deve ser um número não-negativo' };
    }
  }
  
  // Validar descricao se fornecida
  if (data.descricao !== undefined && data.descricao && data.descricao.length > 1000) {
    return { valid: false, error: 'Descrição não pode ter mais de 1000 caracteres' };
  }
  
  // Validar ativo se fornecido
  if (data.ativo !== undefined && !['Y', 'N'].includes(data.ativo)) {
    return { valid: false, error: 'Ativo deve ser Y ou N' };
  }
  
  return { valid: true };
}

/**
 * Valida formato do GTIN
 */
export function validateGTIN(gtin: string): { valid: boolean; error?: string } {
  // Remover espaços
  const cleanGtin = gtin.trim();
  
  // GTIN deve ter 8, 12, 13 ou 14 dígitos
  if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(cleanGtin)) {
    return { 
      valid: false, 
      error: 'GTIN deve conter 8, 12, 13 ou 14 dígitos numéricos' 
    };
  }
  
  return { valid: true };
}

/**
 * Valida dados de criação de venda
 */
export function validateSaleData(data: any): { valid: boolean; error?: string } {
  const { itens } = data;
  
  // Itens obrigatórios
  if (!itens || !Array.isArray(itens)) {
    return { valid: false, error: 'Itens da venda são obrigatórios' };
  }
  
  // Deve ter pelo menos 1 item
  if (itens.length === 0) {
    return { valid: false, error: 'A venda deve ter pelo menos um item' };
  }
  
  // Validar cada item
  for (let i = 0; i < itens.length; i++) {
    const item = itens[i];
    
    // Produto ID obrigatório
    if (!item.produto_id || typeof item.produto_id !== 'number') {
      return { valid: false, error: `Item ${i + 1}: produto_id é obrigatório` };
    }
    
    // Quantidade obrigatória e maior que zero
    if (!item.quantidade || typeof item.quantidade !== 'number' || item.quantidade <= 0) {
      return { valid: false, error: `Item ${i + 1}: quantidade deve ser maior que zero` };
    }
    
    // Preço unitário obrigatório e não-negativo
    if (item.preco_unitario === undefined || item.preco_unitario === null) {
      return { valid: false, error: `Item ${i + 1}: preço unitário é obrigatório` };
    }
    
    const preco = parseFloat(item.preco_unitario);
    if (isNaN(preco) || preco < 0) {
      return { valid: false, error: `Item ${i + 1}: preço unitário deve ser não-negativo` };
    }
  }
  
  // Validar observações se fornecidas
  if (data.observacoes && data.observacoes.length > 1000) {
    return { valid: false, error: 'Observações não podem ter mais de 1000 caracteres' };
  }
  
  return { valid: true };
}

/**
 * Valida período para queries de dashboard
 */
export function validatePeriodo(periodo: string): { valid: boolean; error?: string; days?: number } {
  const validPeriodos: { [key: string]: number } = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
    '1y': 365
  };
  
  if (!validPeriodos[periodo]) {
    return { 
      valid: false, 
      error: 'Período inválido. Valores aceitos: 7d, 30d, 90d, 1y' 
    };
  }
  
  return { valid: true, days: validPeriodos[periodo] };
}

/**
 * Sanitiza e valida parâmetros de paginação
 */
export function validatePagination(page?: string, limit?: string): { page: number; limit: number } {
  const pageNum = parseInt(page || '1');
  const limitNum = parseInt(limit || '20');
  
  return {
    page: isNaN(pageNum) || pageNum < 1 ? 1 : pageNum,
    limit: isNaN(limitNum) || limitNum < 1 || limitNum > 100 ? 20 : limitNum
  };
}

/**
 * Valida se um ID é um número válido
 */
export function validateId(id: any): { valid: boolean; error?: string; id?: number } {
  const idNum = parseInt(id);
  
  if (isNaN(idNum) || idNum < 1) {
    return { valid: false, error: 'ID inválido' };
  }
  
  return { valid: true, id: idNum };
}

