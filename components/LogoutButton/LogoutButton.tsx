'use client';

import { useState } from 'react';
import { BiLogOut } from 'react-icons/bi';
import styles from './LogoutButton.module.css';

interface LogoutButtonProps {
  variant?: 'icon' | 'text' | 'full';
  className?: string;
}

export default function LogoutButton({ variant = 'full', className = '' }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;
    
    const confirmLogout = window.confirm('Deseja realmente sair?');
    if (!confirmLogout) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Redirecionar para a página de login
        window.location.href = '/auth/login';
      } else {
        alert(data.message || 'Erro ao fazer logout');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Erro ao fazer logout. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`${styles.logoutButton} ${styles[variant]} ${className}`}
      title="Sair da conta"
    >
      <BiLogOut className={styles.icon} />
      
      {(variant === 'full' || variant === 'text') && (
        <span className={styles.text}>
          {isLoading ? 'Saindo...' : 'Sair'}
        </span>
      )}
    </button>
  );
}

