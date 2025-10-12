import Button from '@/components/Button/Button';
import styles from './page.module.css';
import {BiCartAdd } from "react-icons/bi";
import Table from '@/components/Table/Table';
import ProductList from '@/components/ProductList/ProductList';

export default function Store() {
  return (
    <div className={styles.store_container}>
      <div className={styles.store_content}>
        <div className={styles.store_label}>
          Produtos
        </div>
        <div className={styles.store_table}>
          <ProductList />
        </div>
      </div>
      <div className={styles.store_options}>

        <Button href="#" icon={<BiCartAdd />}>
          Adicionar produto
        </Button>

      </div>
    </div>
  );
}


