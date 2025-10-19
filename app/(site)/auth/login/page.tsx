'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import styles from './login.module.css';

 function LoginPage() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'retailer' // retailer ou industry
  });

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
    
    try {
      console.log('[LOGIN] Enviando requisição de login...');
      
      // Chamar API de login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // IMPORTANTE: Inclui cookies na requisição
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log('[LOGIN] Resposta da API:', data);

      if (data.success) {
        console.log('[LOGIN] Login bem-sucedido! Redirecionando para:', data.redirectUrl);
        
        // Aguardar um pouco para garantir que o cookie foi setado
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Redirecionar para o dashboard correto baseado na categoria do usuário
        window.location.href = data.redirectUrl || '/seller';
      } else {
        console.error('[LOGIN] Erro no login:', data.message);
        alert(data.message || 'Erro ao realizar login');
      }
    } catch (error) {
      console.error('[LOGIN] Erro na requisição:', error);
      alert('Erro ao realizar login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className={styles.container} >
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

const Page = () => {
    return (
        <Suspense>
            <LoginPage />
        </Suspense>
    )
}

export default Page