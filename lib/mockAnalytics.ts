// Mock data para Analytics - Simula dados do banco
import { 
  Venda, 
  ItemVenda, 
  Produto, 
  Campanha, 
  AnalyticsMetrics, 
  VendasPorPeriodo, 
  TopProdutos, 
  CampanhasAnalytics 
} from './types';

// Mock de Produtos
export const mockProdutos: Produto[] = [
  {
    id_produto: 1,
    nome_produto: 'Feijão Carioca 1kg',
    industria_relacionado: 2, // ID da indústria
    varejista_relacionado: 1, // ID do varejista
    gtin: '7891234567890',
    valor: 8.99
  },
  {
    id_produto: 2,
    nome_produto: 'Arroz Integral 1kg',
    industria_relacionado: 2,
    varejista_relacionado: 1,
    gtin: '7891234567891',
    valor: 12.50
  },
  {
    id_produto: 3,
    nome_produto: 'Óleo de Soja 900ml',
    industria_relacionado: 2,
    varejista_relacionado: 1,
    gtin: '7891234567892',
    valor: 6.79
  },
  {
    id_produto: 4,
    nome_produto: 'Açúcar Cristal 1kg',
    industria_relacionado: 2,
    varejista_relacionado: 1,
    gtin: '7891234567893',
    valor: 4.99
  },
  {
    id_produto: 5,
    nome_produto: 'Café Torrado 250g',
    industria_relacionado: 2,
    varejista_relacionado: 1,
    gtin: '7891234567894',
    valor: 15.90
  }
];

// Mock de Vendas (últimos 30 dias)
export const mockVendas: Venda[] = [
  {
    id_venda: 1,
    valor_total_venda: 89.50,
    timestamp: new Date('2024-10-15'),
    varejista: 1
  },
  {
    id_venda: 2,
    valor_total_venda: 156.20,
    timestamp: new Date('2024-10-14'),
    varejista: 1
  },
  {
    id_venda: 3,
    valor_total_venda: 234.80,
    timestamp: new Date('2024-10-13'),
    varejista: 1
  },
  {
    id_venda: 4,
    valor_total_venda: 78.90,
    timestamp: new Date('2024-10-12'),
    varejista: 1
  },
  {
    id_venda: 5,
    valor_total_venda: 189.40,
    timestamp: new Date('2024-10-11'),
    varejista: 1
  }
];

// Mock de Itens de Venda
export const mockItensVenda: ItemVenda[] = [
  {
    id_venda: 1,
    id_produto: 1,
    gtin: '7891234567890',
    valor: 8.99,
    quantidade: 3
  },
  {
    id_venda: 1,
    id_produto: 2,
    gtin: '7891234567891',
    valor: 12.50,
    quantidade: 2
  },
  {
    id_venda: 2,
    id_produto: 3,
    gtin: '7891234567892',
    valor: 6.79,
    quantidade: 5
  },
  {
    id_venda: 2,
    id_produto: 5,
    gtin: '7891234567894',
    valor: 15.90,
    quantidade: 4
  }
];

// Mock de Campanhas
export const mockCampanhas: Campanha[] = [
  {
    id_campanha: 1,
    varejista: 1,
    industria: 2,
    tipo_campanha: 'DESCONTO',
    status: 'ATIVA',
    data_inicio: new Date('2024-10-01'),
    data_fim: new Date('2024-10-31'),
    nome_campanha: 'Outubro Saudável',
    descricao: 'Desconto em produtos básicos da cesta básica'
  },
  {
    id_campanha: 2,
    varejista: 1,
    industria: 2,
    tipo_campanha: 'PROMOCAO',
    status: 'ATIVA',
    data_inicio: new Date('2024-10-10'),
    data_fim: new Date('2024-10-20'),
    nome_campanha: 'Semana do Café',
    descricao: 'Promoção especial em cafés premium'
  },
  {
    id_campanha: 3,
    varejista: 1,
    industria: 2,
    tipo_campanha: 'FIDELIDADE',
    status: 'FINALIZADA',
    data_inicio: new Date('2024-09-01'),
    data_fim: new Date('2024-09-30'),
    nome_campanha: 'Cliente Ouro',
    descricao: 'Programa de pontos para clientes frequentes'
  }
];

// Função para calcular métricas principais
export function getAnalyticsMetrics(): AnalyticsMetrics {
  const totalVendas = mockVendas.length;
  const receitaTotal = mockVendas.reduce((sum, venda) => sum + venda.valor_total_venda, 0);
  const ticketMedio = receitaTotal / totalVendas;
  const produtosVendidos = mockItensVenda.reduce((sum, item) => sum + item.quantidade, 0);
  const campanhasAtivas = mockCampanhas.filter(c => c.status === 'ATIVA').length;
  
  return {
    receita_total: receitaTotal,
    total_vendas: totalVendas,
    crescimento_percentual: 12.5, // Mock - em produção calcular com base no período anterior
    clientes_unicos: 48, // Mock - em produção contar clientes únicos
    produtos_vendidos: produtosVendidos,
    ticket_medio: ticketMedio,
    campanhas_ativas: campanhasAtivas
  };
}

// Função para vendas por período (últimos 7 dias)
export function getVendasPorPeriodo(): VendasPorPeriodo[] {
  const ultimos7Dias = [];
  const hoje = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(data.getDate() - i);
    const dataStr = data.toISOString().split('T')[0];
    
    // Simular vendas para cada dia
    const vendasDoDia = Math.floor(Math.random() * 10) + 1;
    const receitaDoDia = vendasDoDia * (Math.random() * 200 + 50);
    
    ultimos7Dias.push({
      periodo: data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }),
      vendas: vendasDoDia,
      receita: Math.round(receitaDoDia * 100) / 100
    });
  }
  
  return ultimos7Dias;
}

// Função para top produtos
export function getTopProdutos(): TopProdutos[] {
  return mockProdutos.map(produto => {
    const itensVendidos = mockItensVenda.filter(item => item.id_produto === produto.id_produto);
    const quantidadeTotal = itensVendidos.reduce((sum, item) => sum + item.quantidade, 0);
    const receitaTotal = itensVendidos.reduce((sum, item) => sum + (item.valor * item.quantidade), 0);
    
    return {
      id_produto: produto.id_produto,
      nome_produto: produto.nome_produto,
      quantidade_vendida: quantidadeTotal,
      receita_total: receitaTotal,
      gtin: produto.gtin
    };
  }).sort((a, b) => b.quantidade_vendida - a.quantidade_vendida).slice(0, 5);
}

// Função para analytics de campanhas
export function getCampanhasAnalytics(): CampanhasAnalytics {
  const ativas = mockCampanhas.filter(c => c.status === 'ATIVA').length;
  const finalizadas = mockCampanhas.filter(c => c.status === 'FINALIZADA').length;
  
  return {
    campanhas_ativas: ativas,
    campanhas_finalizadas: finalizadas,
    roi_medio: 3.2, // Mock - ROI médio das campanhas
    conversao_media: 8.5 // Mock - Taxa de conversão média
  };
}