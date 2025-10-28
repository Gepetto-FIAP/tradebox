'use client';

import { useState, useEffect } from 'react';
import styles from './TrendingProducts.module.css';
import Table from '../../../ui/Table/Table';
import TrendingRanking from '../../Others/TrendingRanking/TredingRanking';

interface TrendingProduct {
  produto_id: number;
  nome: string;
  vendas: number;
}

const columns = [
    {
        key: 'rank',
        header: 'Rank',
        render: (value: number) => `#${value}`
    },
    {
        key: 'nome',
        header: 'Produto'
    },
    {
        key: 'vendas',
        header: 'Vendas'
    }
];

export default function TrendingProducts() {
    const [products, setProducts] = useState<TrendingProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchTrendingProducts = async () => {
            try {
                setLoading(true);
                setError('');
                
                const response = await fetch('/api/dashboard/trending?periodo=30d&limit=10');
                const data = await response.json();
                
                if (data.success && data.products) {
                    setProducts(data.products);
                } else {
                    setError('Erro ao carregar produtos');
                }
            } catch (error) {
                console.error('Erro ao buscar produtos em alta:', error);
                setError('Erro ao conectar com o servidor');
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingProducts();
    }, []);

    if (loading) {
        return <div className={styles.trending_container}>Carregando...</div>;
    }

    if (error) {
        return <div className={styles.trending_container}>{error}</div>;
    }

    if (products.length === 0) {
        return <div className={styles.trending_container}>Nenhum produto vendido ainda.</div>;
    }

    const sortedProducts = [...products].sort((a, b) => b.vendas - a.vendas);
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