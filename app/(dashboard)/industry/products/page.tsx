import BottomNav from '@/components/BottomNav/BottomNav';
import styles from './products.module.css';

export default function IndustryProducts() {
  const products = [
    { id: 1, name: 'Widget A', sku: 'WA-001', status: 'Ativo', production: '1.2K/mês' },
    { id: 2, name: 'Component B', sku: 'CB-002', status: 'Ativo', production: '850/mês' },
    { id: 3, name: 'Part C', sku: 'PC-003', status: 'Pausado', production: '0/mês' },
    { id: 4, name: 'Module D', sku: 'MD-004', status: 'Ativo', production: '2.1K/mês' },
    { id: 5, name: 'Assembly E', sku: 'AE-005', status: 'Ativo', production: '650/mês' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestão de Produtos</h1>
        <button className={styles.addButton}>+ Novo Produto</button>
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total de Produtos</span>
          <span className={styles.summaryValue}>{products.length}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Ativos</span>
          <span className={styles.summaryValue}>{products.filter(p => p.status === 'Ativo').length}</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Produção Total</span>
          <span className={styles.summaryValue}>4.8K/mês</span>
        </div>
      </div>

      <div className={styles.productsList}>
        {products.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productInfo}>
              <h3>{product.name}</h3>
              <p className={styles.sku}>SKU: {product.sku}</p>
            </div>
            <div className={styles.productStats}>
              <span className={`${styles.status} ${product.status === 'Ativo' ? styles.active : styles.paused}`}>
                {product.status}
              </span>
              <span className={styles.production}>{product.production}</span>
            </div>
            <div className={styles.actions}>
              <button className={styles.actionButton}>✏️</button>
              <button className={styles.actionButton}>📊</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 25 }} />
      <BottomNav />
    </div>
  );
}
