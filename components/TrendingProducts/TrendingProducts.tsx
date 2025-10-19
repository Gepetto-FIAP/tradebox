import styles from './TrendingProducts.module.css';
import Table from '../Table/Table';
import TrendingRanking from '../TrendingRanking/TredingRanking';

const trendingProducts = [
    {
        name: "Feijão Carioca 1kg",
        vendas: 95,
    },
    {
        name: "Arroz Integral 1kg",
        vendas: 81,
    },
    {
        name: "Açúcar Cristal 1kg",
        vendas: 79,
    },
    {
        name: "Farinha de Trigo 1kg",
        vendas: 74,
    },
    {
        name: "Café Torrado 250g",
        vendas: 70,
    },
    {
        name: "Macarrão Espaguete 500g",
        vendas: 65,
    },
    {
        name: "Óleo de Soja 900ml",
        vendas: 60,
    },
    {
        name: "Sal Refinado 1kg",   
        vendas: 55,
    },
    {
        name: "Leite Integral 1L",  
        vendas: 50,
    },
    {
        name: "Pão de Forma 500g",
        vendas: 45,
    }
];  
// o objeto acima é temporário, depois buscar do banco de dados
// dados provenientes do db deverao seguir a estrutura acima para funcionar corretamente

const columns = [
    {
        key: 'rank',
        header: 'Rank',
        render: (value: number) => `#${value}`
    },
    {
        key: 'name',
        header: 'Produto'
    },
    {
        key: 'vendas',
        header: 'Vendas'
    }
];

export default function TrendingProducts() {
    const sortedProducts = trendingProducts.sort((a, b) => b.vendas - a.vendas);
    const top3Products = sortedProducts.slice(0, 3);

    const productWithRank = sortedProducts.map((product, index) => ({
        ...product,
        rank: index + 1
    }));

    return (
        <div className={styles.trending_container}>
            <TrendingRanking top3={top3Products} />
            <Table columns={columns} data={productWithRank} />
        </div>
    );
}