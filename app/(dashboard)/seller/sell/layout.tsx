import styles from './page.module.css';
import Button from '@/components/ui/Button/Button';
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

        <Button href="#" icon={<BiPlus/>}>
          Inserir manualmente
        </Button>

        <Button href="#" icon={<BiUpload/>}>
          Carregar em massa
        </Button>
      </div>
    </div>
  );
}
