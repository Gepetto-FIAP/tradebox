'use client';

import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend, ScriptableContext } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend);
ChartJS.defaults.font.family = "'Urbanist', 'Helvetica', 'Arial', sans-serif";
ChartJS.defaults.font.size = 14;
ChartJS.defaults.font.weight = 'bold';

type ProductApiItem = {
  produto_id?: number;
  gtin?: string;
  nome?: string;
  qtd_vendedores?: number;
  qtd_vendas?: number;
  qtd_vendida?: number;
  receita?: number;
  vendedor_id?: number;
  vendedor?: string;
  qtd_produtos?: number;
  produtos_vendidos?: number;
};

type Props = {
    borderColor?: string;
    bgColor?: string;
    periodo?: string; // ex: '30d'
    limit?: number;
    apiPath?: string;
    dataKey?: 'products' | 'sellers'; 
};

export default function Chart(
    {
        borderColor,
        bgColor,
        periodo = '30d',
        limit = 10,
        apiPath = '/api/industry/dashboard/products-performance',
        dataKey = 'products'
    } : Props ) 
    {
        const [items, setItems] = useState<ProductApiItem[]>([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState<string | null>(null);

        useEffect(() => {
            let mounted = true;
            setLoading(true);
            setError(null);

            const url = `${apiPath}?periodo=${encodeURIComponent(periodo)}&limit=${encodeURIComponent(String(limit))}`;

            fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (!mounted) return;
                const list = Array.isArray(data?.[dataKey]) ? data[dataKey] : [];
                setItems(list);
            })
            .catch(err => {
                if (!mounted) return;
                setError(String(err));
                setItems([]);
            })
            .finally(() => {
                if (!mounted) return;
                setLoading(false);
            });

            return () => { mounted = false; };
        }, [apiPath, periodo, limit, dataKey]);

        // Adapta labels e valores conforme dataKey
        let labels: string[] = [];
        let receita: number[] = [];
        let qtdVendida: number[] = [];

        if (dataKey === 'products') {
            labels = items.map(p => p.nome ?? '');
            receita = items.map(p => Number(p.receita ?? 0));
            qtdVendida = items.map(p => Number(p.qtd_vendida ?? 0));
        } else if (dataKey === 'sellers') {
            labels = items.map(p => p.vendedor ?? '');
            receita = items.map(p => Number(p.receita ?? 0));
            qtdVendida = items.map(p => Number(p.produtos_vendidos ?? 0));
        }
        
        const data = {
            labels,
            datasets: [
            {
                label: 'Receita',
                data: receita,
                borderWidth: 1,
                borderColor: borderColor || "#fff",
                backgroundColor: bgColor || "#fff",
                borderRadius: 8,
                maxBarThickness: 120
            },
            ],
        };

        const options = {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: true },
                title: { display: false },
            },
            scales: {
                x: { 
                    display: true, 
                    grid: { display: false },
                    ticks: { 
                        color: '#fff',
                        font: {weight: 300, size: 16}
                    },
                },
                y: { 
                    display: true,
                    grid: { display: false },
                    ticks: { 
                        color: '#fff',
                        font: {weight: 100, size: 14}
                    },
                },
            },
        };

        if (loading) return <div>{'Carregando gráfico...'}</div>;
        if (error) return <div>{`Erro: ${error}`}</div>;
        if (!items.length) return <div>{'Sem dados para o período.'}</div>;
        
        return <Bar data={data} options={options} />;
}