"use client";

import { useState } from "react";
import styles from './page.module.css';
import PerformanceChart from '@/components/dashboard/PerformanceChart/PerformanceChart';
import { BiBell , BiLike, BiDislike  } from 'react-icons/bi';
import Button from "@/components/ui/Button/Button";

const PERIODS = [
  { label: "Últimos 7 dias", value: "7d" },
  { label: "Últimos 30 dias", value: "30d" },
  { label: "Últimos 90 dias", value: "90d" },
];

const insights = [
  {
    id: 1,
    title: "O seller A vende o produto X 39% mais que a média",
    text: "Isso indica que o seller A está se destacando na venda do produto X em comparação com outros sellers."
  },
  {
    id: 2,
    title: "O produto Y teve um aumento de 25% nas vendas na última semana",
    text: "Esse aumento pode ser atribuído a uma campanha de marketing eficaz ou a uma mudança na demanda do mercado."
  },
  {
    id: 3,
    title: "O seller B está com um estoque baixo do produto Z",
    text: "Recomenda-se entrar em contato com o seller B para evitar rupturas de estoque e perda de vendas."
  },
  {
    id: 4,
    title: "O produto W tem uma margem de lucro de 45%",
    text: "Esse produto é altamente lucrativo e deve ser promovido para maximizar os ganhos."
  },
  {
    id: 5,
    title: "O seller C teve uma queda de 15% nas vendas no último mês",
    text: "É importante investigar as causas dessa queda e implementar estratégias para recuperar as vendas."
  },
  {
    id: 6,
    title: "O seller D teve um aumento de 20% nas vendas no último mês",  
    text: "Parabéns ao seller D pelo excelente desempenho! Continue assim para manter o crescimento."
  }
];

export default function IndustryAnalytics() {
  const [periodoProducts, setPeriodoProducts] = useState("30d");
  const [periodoSellers, setPeriodoSellers] = useState("30d");

  return (
    <div className={styles.content}>
      <div className={styles.product_chart_wrapper}>
        <div className={styles.chart_header}>
          <div className={styles.chart_label}>
            Desempenho dos Produtos
          </div>

          <select value={periodoProducts} onChange={e => setPeriodoProducts(e.target.value)}>
            {PERIODS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

        </div>

        <div className={styles.bar_chart}>
          <PerformanceChart 
          periodo={periodoProducts}
          limit={12}
          dataKey="products" 
          apiPath="/api/industry/dashboard/products-performance" 
          borderColor="#01b5fa" 
          bgColor="#01b5fa30" />
        </div>
      </div>

      <div className={styles.sellers_chart_wrapper}>
        
        <div className={styles.chart_header}>
          <div className={styles.chart_label}>
            Desempenho dos Vendedores
          </div>

          <select value={periodoSellers} onChange={e => setPeriodoSellers(e.target.value)}>
            {PERIODS.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

        </div>
        
        <div className={styles.bar_chart}>
          <PerformanceChart 
          periodo={periodoSellers}
          limit={12}
          dataKey="sellers" 
          apiPath="/api/industry/dashboard/sellers-performance" 
          borderColor="#01b5fa60" 
          bgColor="#01b5fa10" />
        </div>

      </div>

      <div className={styles.ai_insights_wrapper}>
        <div className={styles.chart_label}>
          Insights de IA
        </div>

        <div className={styles.ai_insights}>
          {insights.map(insight => (
            <div key={insight.id} className={styles.ai_insight}>
              <div className={styles.ai_insight_icon}>
                <BiBell /> 
              </div>

              <div className={styles.ai_insight_content}>
                <div className={styles.ai_insight_title}>
                  {insight.title}
                </div>
                <div className={styles.ai_insight_text}>
                  {insight.text}
                </div>
              </div>

              <div className={styles.ai_insight_actions}>
                <div className={styles.ai_insight_action}>
                  <BiLike />
                </div>
                <div className={styles.ai_insight_action}>
                  <BiDislike/>
                </div>
              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}