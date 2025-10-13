'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './register.module.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    document: '', // CPF ou CNPJ
    documentType: 'cpf', // cpf ou cnpj
    userType: 'retailer' // retailer ou industry
  });

  // Definir cor de fundo baseada no tipo de usuário
  const backgroundGradient = formData.userType === 'retailer' 
    ? 'linear-gradient(135deg, #00384d 0%, #01b5fa 100%)' // Azul escuro para varejista
    : 'linear-gradient(135deg, #01b5fa 0%, #87ceeb 100%)'; // Azul claro para indústria

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const newData = {
      ...formData,
      [e.target.name]: e.target.value
    };

    // Se mudou para indústria, forçar CNPJ
    if (e.target.name === 'userType' && e.target.value === 'industry') {
      newData.documentType = 'cnpj';
    }

    setFormData(newData);
  };

  const formatDocument = (value: string, type: string) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '');
    
    if (type === 'cpf') {
      // Formato CPF: 123.456.789-01
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // Formato CNPJ: 12.345.678/0001-90
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    // Formato: (11) 99999-9999
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatDocument(value, formData.documentType);
    setFormData({
      ...formData,
      document: formatted
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatPhone(value);
    setFormData({
      ...formData,
      phone: formatted
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    setIsLoading(true);
    
    try {
      // Mapear userType para categoria do banco
      const categoria = formData.userType === 'retailer' ? 'VAREJISTA' : 'INDUSTRIA';
      const tipo_pessoa = formData.documentType === 'cpf' ? 'PF' : 'PJ';
      
      // Chamar API de registro
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          nome: formData.name,
          categoria,
          tipo_pessoa,
          documento: formData.document.replace(/\D/g, ''), // Remove formatação
          telefone: formData.phone.replace(/\D/g, ''),
          endereco: formData.address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || 'Cadastro realizado com sucesso!');
        // Redirecionar para o dashboard correto
        window.location.href = data.redirectUrl || '/seller';
      } else {
        alert(data.message || 'Erro ao realizar cadastro');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Erro ao realizar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container} style={{ background: backgroundGradient }}>
      <div className={styles.registerBox}>
        <h1 className={styles.title}>Cadastro - TradeBox</h1>
        <p className={styles.subtitle}>Crie sua conta na plataforma</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Toggle de Tipo de Usuário */}
          <div className={styles.userTypeToggle}>
            <div className={styles.toggleHeader}>
              <span className={styles.toggleLabel}>Tipo de Conta *</span>
            </div>
            <div className={styles.toggleContainer}>
              <button
                type="button"
                onClick={() => setFormData({...formData, userType: 'retailer', documentType: 'cpf', document: ''})}
                className={`${styles.toggleButton} ${formData.userType === 'retailer' ? styles.active : ''}`}
              >
                <div className={styles.toggleIcon}>🏪</div>
                <div className={styles.toggleText}>
                  <span className={styles.toggleTitle}>Varejista</span>
                  <span className={styles.toggleSubtitle}>Para quem vende produtos</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, userType: 'industry', documentType: 'cnpj', document: ''})}
                className={`${styles.toggleButton} ${formData.userType === 'industry' ? styles.active : ''}`}
              >
                <div className={styles.toggleIcon}>🏭</div>
                <div className={styles.toggleText}>
                  <span className={styles.toggleTitle}>Indústria</span>
                  <span className={styles.toggleSubtitle}>Para quem produz produtos</span>
                </div>
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>
              {formData.userType === 'retailer' && formData.documentType === 'cpf' 
                ? 'Nome Completo' 
                : 'Razão Social'} *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              placeholder={formData.userType === 'retailer' && formData.documentType === 'cpf' 
                ? 'Seu nome completo' 
                : 'Nome da empresa'}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email *
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

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Senha *
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                placeholder="Sua senha"
                minLength={6}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>
                Confirmar Senha *
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.input}
                placeholder="Confirme sua senha"
                minLength={6}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="address" className={styles.label}>
              Endereço *
            </label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={styles.input}
              placeholder="Rua, número, bairro, cidade"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phone" className={styles.label}>
              Telefone *
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={styles.input}
              placeholder="(11) 99999-9999"
              maxLength={15}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label htmlFor="documentType" className={styles.label}>
                Tipo de Documento *
              </label>
              <select
                id="documentType"
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className={styles.select}
                disabled={formData.userType === 'industry'}
                required
              >
                <option value="cpf" disabled={formData.userType === 'industry'}>
                  CPF {formData.userType === 'industry' ? '(não disponível para indústria)' : ''}
                </option>
                <option value="cnpj">CNPJ</option>
              </select>
              {formData.userType === 'industry' && (
                <small className={styles.helperText}>
                  Indústrias devem usar CNPJ
                </small>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="document" className={styles.label}>
                {formData.documentType === 'cpf' ? 'CPF' : 'CNPJ'} *
              </label>
              <input
                id="document"
                type="text"
                name="document"
                value={formData.document}
                onChange={handleDocumentChange}
                className={styles.input}
                placeholder={formData.documentType === 'cpf' ? '123.456.789-01' : '12.345.678/0001-90'}
                maxLength={formData.documentType === 'cpf' ? 14 : 18}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Já tem uma conta?{' '}
            <Link href="/auth/login" className={styles.link}>
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
