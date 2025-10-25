'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button/Button';
import Modal from '@/components/ui/Modal/Modal';
import AddProductForm from '@/components/dashboard/AddProductForm/AddProductForm';
import styles from './page.module.css';
import { BiCartAdd } from "react-icons/bi";
import ProductList from '@/components/dashboard/ProductListSeller/ProductList';

export default function Store() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleOpenModal() {
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsModalOpen(false);
  }

  function handleSuccess() {
    setIsModalOpen(false);
    // Força re-render da lista de produtos
    setRefreshKey(prev => prev + 1);
  }

  return (
    <div className={styles.store_container}>
      <div className={styles.store_content}>
        <div className={styles.store_label}>
          Produtos
        </div>
        <div className={styles.store_table}>
          <ProductList key={refreshKey} />
        </div>
      </div>
      <div className={styles.store_options}>
        <Button onClick={handleOpenModal} icon={<BiCartAdd />}>
          Adicionar produto
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Adicionar Novo Produto"
      >
        <AddProductForm
          onSuccess={handleSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}
