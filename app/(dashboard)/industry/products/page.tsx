import styles from './page.module.css';
import ProductListIndustry from '@/components/dashboard/ProductListIndustry/ProductListIndustry';

export default function IndustryProducts() {
  return (
    <div className={styles.content}>
      <div className={styles.products}>
        <div className={styles.table_header}>
          Produtos do setor
        </div>
        <div className={styles.products_table}>
          <ProductListIndustry />
        </div>
      </div>
    </div>
  );
}
