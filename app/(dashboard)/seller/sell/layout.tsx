import styles from './page.module.css';
import Button from '@/components/Button/Button';
import type { ReactNode } from 'react';
import { BiBarcodeReader, BiPlus, BiUpload} from "react-icons/bi";

export default function LayoutSell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.container}> 
      <div className={styles.sell_content}>
        {children}
      </div>
      <div className={styles.sell_options}>
        <Button href="/scan" icon={<BiBarcodeReader/>}>
          Escanear produto
        </Button>

        <Button href="/seller/sell/manual" icon={<BiPlus/>}>
          Inserir manualmente
        </Button>

        <Button href="/seller/sell/bulk" icon={<BiUpload/>}>
          Carregar em massa
        </Button>
      </div>
    </div>
  );
}
