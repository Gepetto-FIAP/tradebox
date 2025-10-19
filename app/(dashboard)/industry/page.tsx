import ProfitCard from '@/components/dashboard/ProfitCard/ProfitCard';
import styles from './page.module.css';
import { getCurrentUser } from '@/lib/auth';
import Table from '@/components/ui/Table/Table';
import CardData from '@/components/dashboard/CardData/CardData';
import { BiStoreAlt, BiBasket, BiLineChart, BiDollar } from "react-icons/bi";

export default async function IndustryDashboard() {
  const user = await getCurrentUser();
  const userName = user?.nome?.split(' ')[0] || 'Usuário';


  const totalsByPeriod = {
    '7': { revenue: 35000, cost: 29000 }, // ultimos 7 dias
    '30': { revenue: 52000, cost: 40000 }, // ultimos 30 dias
    '365': { revenue: 154000, cost: 112000 }, // ultimos 365 dias
  };

  // acima está um exemplo de dados para o ProfitCard
  // 1. deverá ser consultado no db todos os produtos relacionados a determinada industria,
  // 2. selecionar tais itens vendidos, pegar a quantidade vendida de tais itens e multiplicar pelo preco unitario.
  // 3. pegar o custo na tabela produto e multiplicar pela quantidade vendida.
  // 4. retornar os dados no formato esperado pelo ProfitCard.


  const trendingSellers = [
    { name: 'Loja A', sales: 15000 },
    { name: 'Loja B', sales: 12000 },
    { name: 'Loja C', sales: 10000 },
    { name: 'Loja D', sales: 8000 },
    { name: 'Loja E', sales: 6000 },
    { name: 'Loja F', sales: 5000 },
    { name: 'Loja G', sales: 4000 },
    { name: 'Loja H', sales: 3000 },
    { name: 'Loja I', sales: 2000 },
    { name: 'Loja J', sales: 1000 },
  ];

  // acima está um exemplo de dados para a tabela de vendedores em alta
  // 1. deverá ser consultado no db todos os vendedores relacionados a determinada industria,
  // 2. selecionar tais vendedores e somar a quantidade de vendas de cada um.
  // 3. retornar os dados no formato esperado pela tabela.

  const columns = [
    {
        key: 'rank',
        header: 'Rank',
        render: (value: number) => `#${value}`
    },
    {
        key: 'name',
        header: 'Vendedor'
    },
    {
        key: 'sales',
        header: 'Faturamento'
    }
];

    const sellersWithRank = trendingSellers.map((seller, index) => ({
        ...seller,
        rank: index + 1
    }));

  return (
    
    <div className={styles.content}>

        <div className={styles.sellers_wrapper}>
          <div className={styles.table_header}>
            Vendedores em alta
          </div>
          <Table columns={columns} data={sellersWithRank} />
        </div>

        
        <div className={styles.profit_wrapper}>
          <ProfitCard totalsByPeriod={totalsByPeriod} />
        </div>

      <div className={styles.cards_data_wrapper}>
        <CardData icon={<BiStoreAlt />} label="Sellers" value={12} badge_value={"+5%"} />
        <CardData icon={<BiBasket />} label="Produtos" value={22} badge_value={"+5%"} />
        <CardData icon={<BiDollar />} label="Faturamento" value={"90k"} badge_value={"+5%"} />
        <CardData icon={<BiLineChart />} label="Campanhas" value={2} badge_value={"+5%"} />
      </div>

    </div>
  );
}
