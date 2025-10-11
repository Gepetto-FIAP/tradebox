import styles from './TrendingProducts.module.css';

const trendingProducts = [
    {
        name: "Feijão Carioca 1kg",
        vendas: 100,
    },
    {
        name: "Arroz Integral 1kg",
        vendas: 85,
    },
    {
        name: "Açúcar Cristal 1kg",
        vendas: 75,
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
];  // esse objeto é temporário, depois buscar do banco de dados

export default function TrendingProducts() {
    const sortedProducts = trendingProducts.sort((a, b) => b.vendas - a.vendas)
    const top3Products = sortedProducts.slice(0, 3);
    
    return (
        <div className={styles.trending_container}>
            <div className={styles.trending_ranking}>
                {top3Products.map((product, index) => (
                    <div data-rank={index + 1} key={index} className={styles.trending_ranking_product} style={{ height: `${(product.vendas / sortedProducts[0].vendas) * 100}%` }}>
                        <div className={styles.trending_ranking_circle}>
                            <span>
                                #{index + 1}
                            </span>
                            <div className={styles.trending_ranking_circle_product_name}>
                                {product.name}
                            </div>
                        </div>
                        <div className={styles.trending_ranking_bar}> 
                            <p>{product.vendas}</p>
                            <span>vendas</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.trending_table_wrapper}>

                <div className={styles.trending_table}>
                    <div className={`${styles.trending_table_row} ${styles.trending_table_header}`}>
                        <div className={styles.trending_table_col}>
                            Rank
                        </div>
                        <div className={styles.trending_table_col}>
                            Produto
                        </div>
                        <div className={styles.trending_table_col}>
                            Vendas
                        </div>
                    </div>

                    <div className={styles.trending_table_body}>
                        {sortedProducts.map((product, index) => (
                            <div key={index} className={styles.trending_table_row}>
                                <div className={styles.trending_table_col}>
                                    #{index + 1}
                                </div>
                                <div className={styles.trending_table_col}>
                                    {product.name}
                                </div>
                                <div className={styles.trending_table_col}>
                                    {product.vendas}
                                </div>
                            </div>
                        ))}
                    </div>



                </div>
            </div>
        </div>
    );
}