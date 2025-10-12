import Table from '../Table/Table';
import styles from './RecentOrders.module.css';

const products = [
    {
        idOrder: 1,
        data: '2023-10-01',
        itens: 3,
        total: 100
    },
    {
        idOrder: 2,
        data: '2023-10-02',
        itens: 1,
        total: 50
    },
    {
        idOrder: 3,
        data: '2023-10-03',
        itens: 2,
        total: 75
    },
    {
        idOrder: 4,
        data: '2023-10-04',
        itens: 1,
        total: 50
    }
];

const columns = [
  {
    key: 'idOrder',
    header: 'Nº',
    render: (value: number) => `#${value}`
  },
  {
    key: 'data',
    header: 'Data'
  },
  {
    key: 'itens',
    header: 'Itens'
  },
  {
    key: 'total',
    header: 'Total'
  }
];

export default function RecentOrders() {
  return <Table columns={columns} data={products} />;

}


