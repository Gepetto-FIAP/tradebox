import styles from './TrendingRanking.module.css';


interface Object { name: string; vendas: number }
interface Props { top3?: Object[] }

export default function TrendingRanking({ top3 = [] }: Props) {
    const maxVendas = top3.length ? Math.max(...top3.map(p => p.vendas)) : 1;

    return (
        <div className={styles.trending_ranking}>
            {top3?.map((product, index) => (
                <div data-rank={index + 1} key={index} className={styles.trending_ranking_product} style={{ height: `${(product.vendas / maxVendas) * 100}%` }}>
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
    )
}