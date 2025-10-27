# TradeBox - Database Scripts

## 📋 Visão Geral

Este diretório contém todos os scripts SQL necessários para inicializar e gerenciar o banco de dados Oracle do sistema TradeBox.

## 🗂️ Arquivos Principais

### 1. **INIT_DATABASE.sql** ⭐
**Script principal de inicialização completa do banco de dados.**

**Contém:**
- ✅ Criação de todas as sequences
- ✅ Criação de todas as tabelas (usuarios, categorias, produtos, clientes, vendas, itens_venda)
- ✅ Índices para performance
- ✅ Constraints e validações
- ✅ Triggers de auditoria
- ✅ Comentários nas tabelas e colunas
- ✅ Dados iniciais (DML):
  - 10 categorias padrão
  - 5 usuários de teste (2 varejistas + 3 indústrias)
  - 5 produtos de exemplo

**Quando usar:**
- Primeira instalação do sistema
- Após executar DROP_ALL.sql para reset completo
- Ambiente de desenvolvimento/teste

**Como executar:**
```sql
-- Conecte-se ao Oracle como usuário com privilégios DDL
@INIT_DATABASE.sql
```

---

### 2. **DROP_ALL.sql** ⚠️
**Script para limpeza completa do banco de dados.**

**Atenção:** Este script **DELETA TODOS OS DADOS**!

**Contém:**
- ❌ Drop de todas as tabelas
- ❌ Drop de todas as sequences

**Quando usar:**
- Reset completo do banco
- Antes de executar INIT_DATABASE.sql novamente
- **NUNCA em produção sem backup!**

**Como executar:**
```sql
-- FAÇA BACKUP ANTES!
@DROP_ALL.sql
```

---

### 3. **Arquivos Legados** (Referência)

Estes arquivos foram consolidados no `INIT_DATABASE.sql` mas são mantidos para referência:

- `schema_usuarios_simplificado.sql` - Schema de usuários
- `schema_produtos_vendas.sql` - Schema de produtos e vendas
- `ALTER_ADD_PRECO_CUSTO.sql` - Alteração para adicionar campo preco_custo

**Nota:** Não é necessário executar estes arquivos se você usar `INIT_DATABASE.sql`.

---

## 🚀 Guia de Instalação

### Instalação Limpa (Primeira Vez)

```bash
# 1. Conecte-se ao Oracle
sqlplus usuario/senha@banco

# 2. Execute o script de inicialização
@INIT_DATABASE.sql

# 3. Verifique a instalação
SELECT 'Usuários: ' || COUNT(*) FROM usuarios;
SELECT 'Categorias: ' || COUNT(*) FROM categorias;
SELECT 'Produtos: ' || COUNT(*) FROM produtos;
```

### Reinstalação (Reset Completo)

```bash
# 1. Conecte-se ao Oracle
sqlplus usuario/senha@banco

# 2. BACKUP (IMPORTANTE!)
expdp usuario/senha@banco directory=backup_dir dumpfile=tradebox_backup.dmp

# 3. Limpe o banco
@DROP_ALL.sql

# 4. Recrie tudo
@INIT_DATABASE.sql
```

---

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas

| Tabela | Descrição | Registros Iniciais |
|--------|-----------|-------------------|
| `usuarios` | Varejistas e Indústrias | 5 |
| `categorias` | Categorias de produtos | 10 |
| `produtos` | Produtos cadastrados | 5 |
| `clientes` | Clientes dos varejistas | 0 |
| `vendas` | Registro de vendas | 0 |
| `itens_venda` | Itens das vendas | 0 |

### Sequences Criadas

- `seq_usuarios`
- `seq_categorias`
- `seq_produtos`
- `seq_clientes`
- `seq_vendas`
- `seq_itens_venda`

### Índices Criados

**Total: 23 índices** para otimização de queries frequentes.

Principais:
- Índices únicos em emails e documentos
- Índices em foreign keys
- Índices em campos de busca (GTIN, categoria, status)
- Índices compostos para queries de margem

---

## 👥 Usuários de Teste

### Credenciais Padrão

**Senha para todos:** `senha123`

| Email | Tipo | Nome | Documento |
|-------|------|------|-----------|
| joao@varejista.com | Varejista PF | João Silva Santos | 12345678901 |
| contato@mercadinho.com | Varejista PJ | Mercadinho Bom Preço | 12345678000100 |
| vendas@cocacola.com.br | Indústria | Coca-Cola Brasil | 45997418000153 |
| comercial@nestle.com.br | Indústria | Nestlé Brasil | 60409075000192 |
| contato@unilever.com.br | Indústria | Unilever Brasil | 61068276000180 |

**Nota:** O hash de senha no script é apenas um exemplo. Em produção, gere hashes reais com bcrypt.

---

## 📦 Produtos de Exemplo

5 produtos cadastrados para o varejista "João Silva Santos":

1. **Coca-Cola Lata 350ml** - GTIN: 7894900011517
   - Preço: R$ 5,50 | Custo: R$ 3,20 | Estoque: 100
   
2. **Nescau Cereal 210g** - GTIN: 7891000100103
   - Preço: R$ 12,90 | Custo: R$ 8,50 | Estoque: 50
   
3. **Dove Sabonete 90g** - GTIN: 7891150017504
   - Preço: R$ 4,99 | Custo: R$ 2,80 | Estoque: 200
   
4. **Leite Ninho 400g** - GTIN: 7891000100004
   - Preço: R$ 18,90 | Custo: R$ 12,50 | Estoque: 30
   
5. **Omo Líquido 3L** - GTIN: 7891150061002
   - Preço: R$ 32,90 | Custo: R$ 22,00 | Estoque: 25

---

## 🔍 Queries Úteis

### Listar Todos os Usuários
```sql
SELECT id, email, nome, categoria, tipo_pessoa 
FROM usuarios 
WHERE ativo = 'Y';
```

### Listar Produtos com Margem
```sql
SELECT 
    p.id,
    p.nome,
    p.gtin,
    p.preco_base,
    p.preco_custo,
    (p.preco_base - p.preco_custo) as lucro_unitario,
    ROUND(((p.preco_base - p.preco_custo) / p.preco_custo * 100), 2) as margem_percentual,
    p.estoque,
    c.nome as categoria,
    i.nome as industria
FROM produtos p
LEFT JOIN categorias c ON p.categoria_id = c.id
LEFT JOIN usuarios i ON p.industria_id = i.id
WHERE p.ativo = 'Y'
ORDER BY margem_percentual DESC;
```

### Verificar Integridade
```sql
-- Produtos órfãos (sem vendedor)
SELECT COUNT(*) as produtos_orfaos
FROM produtos p
LEFT JOIN usuarios u ON p.vendedor_id = u.id
WHERE u.id IS NULL;

-- Vendas sem itens
SELECT v.id, v.data_venda, v.valor_total
FROM vendas v
LEFT JOIN itens_venda i ON v.id = i.venda_id
WHERE i.id IS NULL;
```

---

## ⚙️ Configurações Importantes

### Constraints Principais

1. **Unicidade de GTIN:** Um vendedor pode ter o mesmo GTIN para indústrias diferentes
   - Constraint: `uk_produto_vendedor_gtin_industria`
   
2. **Validação de Documentos:**
   - CPF: 11 dígitos numéricos
   - CNPJ: 14 dígitos numéricos
   
3. **Validação de Preços:**
   - `preco_custo <= preco_base`
   - Ambos >= 0
   
4. **Validação de GTIN:**
   - 8, 12, 13 ou 14 dígitos

### Triggers Ativos

- `trg_usuarios_updated_at` - Atualiza timestamp em updates
- `trg_categorias_updated_at`
- `trg_produtos_updated_at`
- `trg_clientes_updated_at`
- `trg_vendas_updated_at`

---

## 🔐 Segurança

### Recomendações

1. **Senhas:**
   - Altere as senhas de teste em produção
   - Use bcrypt com salt adequado (rounds >= 10)
   
2. **Permissões:**
   - Crie usuários específicos para a aplicação
   - Limite privilégios (não use DBA em produção)
   
3. **Backup:**
   - Configure backups automáticos diários
   - Teste restauração regularmente
   
4. **Auditoria:**
   - Monitore acessos suspeitos
   - Revise logs de alterações

---

## 📈 Performance

### Índices Otimizados Para:

- ✅ Login de usuários (email)
- ✅ Busca de produtos por GTIN
- ✅ Listagem de produtos por vendedor
- ✅ Queries de margem e lucro
- ✅ Relatórios de vendas por período
- ✅ Analytics de categorias

### Monitoramento

```sql
-- Verificar uso de índices
SELECT index_name, table_name, uniqueness
FROM user_indexes
WHERE table_name IN ('USUARIOS', 'PRODUTOS', 'VENDAS');

-- Estatísticas de tabelas
SELECT table_name, num_rows, blocks, avg_row_len
FROM user_tables
WHERE table_name IN ('USUARIOS', 'PRODUTOS', 'VENDAS');
```

---

## 🐛 Troubleshooting

### Erro: "Table already exists"
```sql
-- Execute DROP_ALL.sql primeiro
@DROP_ALL.sql
@INIT_DATABASE.sql
```

### Erro: "Sequence does not exist"
```sql
-- Recrie as sequences
@INIT_DATABASE.sql
```

### Erro: "Integrity constraint violated"
```sql
-- Verifique foreign keys
SELECT constraint_name, table_name, constraint_type
FROM user_constraints
WHERE constraint_type = 'R';
```

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique os logs do Oracle
2. Consulte a documentação oficial do Oracle
3. Revise este README
4. Entre em contato com a equipe de desenvolvimento

---

## 📝 Changelog

### Versão 1.0 (Outubro 2025)
- ✅ Script consolidado INIT_DATABASE.sql
- ✅ Script de limpeza DROP_ALL.sql
- ✅ Dados de exemplo completos
- ✅ Documentação completa
- ✅ Campo preco_custo incluído
- ✅ Constraint de GTIN + Indústria única

---

## 📄 Licença

Este projeto é parte do trabalho acadêmico da FIAP - 2025.

