'use client';

import { useState } from 'react';
import styles from './page.module.css';
import Button from '@/components/ui/Button/Button';
import ManualSaleModal from '@/components/dashboard/ManualSaleModal/ManualSaleModal';
import BulkSaleUpload from '@/components/dashboard/BulkSaleUpload/BulkSaleUpload';
import type { ReactNode } from 'react';
import { BiBarcodeReader, BiPlus, BiUpload} from "react-icons/bi";

export default function LayoutSell({ children }: { children: ReactNode }) {
  const [showManualSaleModal, setShowManualSaleModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);

  const handleSaleComplete = () => {
    // Recarregar a página para atualizar o histórico
    window.location.reload();
  };

  return (
    <div className={styles.container}> 
      <div className={styles.sell_content}>
        {children}
      </div>
      <div className={styles.sell_options}>
        <Button href="/scan" icon={<BiBarcodeReader/>}>
          Escanear produto
        </Button>

        <Button 
          onClick={() => setShowManualSaleModal(true)} 
          icon={<BiPlus/>}
        >
          Inserir manualmente
        </Button>

        <Button 
          onClick={() => setShowBulkUploadModal(true)} 
          icon={<BiUpload/>}
        >
          Carregar em massa
        </Button>
      </div>

      <ManualSaleModal
        isOpen={showManualSaleModal}
        onClose={() => setShowManualSaleModal(false)}
        onSaleComplete={handleSaleComplete}
      />

      <BulkSaleUpload
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        onSaleComplete={handleSaleComplete}
      />
    </div>
  );
}
