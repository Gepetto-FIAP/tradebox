'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'retailer' // retailer ou industry
  });

  // Definir cor de fundo baseada no tipo de usuário
  const backgroundGradient = formData.userType === 'retailer' 
    ? 'linear-gradient(135deg, #00384d 0%, #01b5fa 100%)' // Azul escuro para varejista
    : 'linear-gradient(135deg, #01b5fa 0%, #87ceeb 100%)'; // Azul claro para indústria

  const [isLoading, setIsLoading] = useState(false);

  // Verificar se há parâmetro de tipo de usuário na URL
  useEffect(() => {
    const userTypeParam = searchParams.get('userType');
    if (userTypeParam && (userTypeParam === 'retailer' || userTypeParam === 'industry')) {
      setFormData(prev => ({ ...prev, userType: userTypeParam }));
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implementar lógica de autenticação
    console.log('Login data:', formData);
    
    // Simular delay de API
    setTimeout(() => {
      setIsLoading(false);
      // Redirecionar para dashboard correto baseado no tipo de usuário
      const redirectUrl = formData.userType === 'retailer' ? '/seller' : '/industry';
      window.location.href = redirectUrl;
    }, 2000);
  };

  return (
    <div className={styles.container} style={{ background: backgroundGradient }}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Login - TradeBox</h1>
        <p className={styles.subtitle}>
          Acesse sua conta {formData.userType === 'retailer' ? 'de varejista' : 'da indústria'}
        </p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Toggle de Tipo de Usuário */}
          <div className={styles.userTypeToggle}>
            <div className={styles.toggleHeader}>
              <span className={styles.toggleLabel}>Tipo de Conta</span>
            </div>
            <div className={styles.toggleContainer}>
              <button
                type="button"
                onClick={() => setFormData({...formData, userType: 'retailer'})}
                className={`${styles.toggleButton} ${formData.userType === 'retailer' ? styles.active : ''}`}
              >
                <div className={styles.toggleIcon}>🏪</div>
                <div className={styles.toggleText}>
                  <span className={styles.toggleTitle}>Varejista</span>
                  <span className={styles.toggleSubtitle}>Vendas de produtos</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, userType: 'industry'})}
                className={`${styles.toggleButton} ${formData.userType === 'industry' ? styles.active : ''}`}
              >
                <div className={styles.toggleIcon}>🏭</div>
                <div className={styles.toggleText}>
                  <span className={styles.toggleTitle}>Indústria</span>
                  <span className={styles.toggleSubtitle}>Produção de produtos</span>
                </div>
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Sua senha"
              required
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Não tem uma conta?{' '}
            <Link href="/auth/register" className={styles.link}>
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
