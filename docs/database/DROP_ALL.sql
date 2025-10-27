-- ==========================================
-- TRADEBOX - SCRIPT DE LIMPEZA COMPLETA
-- ==========================================
-- 
-- ATENÇÃO: Este script irá DELETAR TODOS OS DADOS!
-- Use apenas para resetar o banco de dados completamente.
-- 
-- INSTRUÇÕES:
-- 1. Faça backup antes de executar
-- 2. Execute este script antes do INIT_DATABASE.sql
-- 3. Confirme que deseja realmente deletar tudo
-- 
-- ==========================================

-- Desabilitar constraints temporariamente para facilitar drop
BEGIN
   FOR c IN (SELECT table_name FROM user_tables) LOOP
      EXECUTE IMMEDIATE ('DROP TABLE ' || c.table_name || ' CASCADE CONSTRAINTS');
   END LOOP;
END;
/

-- Método alternativo (mais seguro - ordem específica)
/*
-- Drop tables na ordem inversa das foreign keys
DROP TABLE itens_venda CASCADE CONSTRAINTS;
DROP TABLE vendas CASCADE CONSTRAINTS;
DROP TABLE clientes CASCADE CONSTRAINTS;
DROP TABLE produtos CASCADE CONSTRAINTS;
DROP TABLE categorias CASCADE CONSTRAINTS;
DROP TABLE usuarios CASCADE CONSTRAINTS;
*/

-- Drop sequences
DROP SEQUENCE seq_itens_venda;
DROP SEQUENCE seq_vendas;
DROP SEQUENCE seq_clientes;
DROP SEQUENCE seq_produtos;
DROP SEQUENCE seq_categorias;
DROP SEQUENCE seq_usuarios;

-- Verificar se tudo foi removido
SELECT 'Tabelas restantes: ' || COUNT(*) as resultado FROM user_tables;
SELECT 'Sequences restantes: ' || COUNT(*) as resultado FROM user_sequences;

-- ==========================================
-- FIM DA LIMPEZA
-- ==========================================

COMMIT;

