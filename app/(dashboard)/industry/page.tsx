import styles from './page.module.css';
import BottomNav from '@/components/BottomNav/BottomNav';

export default function IndustryDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard da Indústria</h1>
        <p className={styles.subtitle}>Gerencie sua produção e produtos</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📦</div>
          <div className={styles.statContent}>
            <h3>Produtos Cadastrados</h3>
            <p className={styles.statNumber}>245</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>🏭</div>
          <div className={styles.statContent}>
            <h3>Linhas de Produção</h3>
            <p className={styles.statNumber}>8</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>📈</div>
          <div className={styles.statContent}>
            <h3>Produção Mensal</h3>
            <p className={styles.statNumber}>12.5K</p>
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2>Ações Rápidas</h2>
        <div className={styles.actionGrid}>
          <button className={styles.actionCard}>
            <div className={styles.actionIcon}>➕</div>
            <span>Cadastrar Produto</span>
          </button>
          
          <button className={styles.actionCard}>
            <div className={styles.actionIcon}>📊</div>
            <span>Relatórios</span>
          </button>
          
          <button className={styles.actionCard}>
            <div className={styles.actionIcon}>🏪</div>
            <span>Parceiros Varejistas</span>
          </button>
          
          <button className={styles.actionCard}>
            <div className={styles.actionIcon}>⚙️</div>
            <span>Configurações</span>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
